"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { verifyTurnstile, turnstileErrorMessage } from "@/lib/turnstile";
import { isHoneypotTripped } from "@/lib/honeypot";
import { checkRateLimit, getClientIp, rateLimitErrorMessage } from "@/lib/rate-limit";

const emailPasswordSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const signupSchema = emailPasswordSchema.extend({
  display_name: z.string().min(2).max(60),
});

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string; field?: string };

/* -------------------------------------------------------------------------- */
/* Signup                                                                     */
/*                                                                            */
/* Defense stack:                                                             */
/*   1. Honeypot — silently drop bot-filled submissions                       */
/*   2. Rate limit — 3 signups per IP per hour                                */
/*   3. Cloudflare Turnstile — invisible challenge                            */
/*   4. Zod validation                                                        */
/*   5. Supabase signUp (which also sends confirmation email)                 */
/* -------------------------------------------------------------------------- */
export async function signUpAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  // 1. Honeypot — pretend success so the bot doesn't retry.
  if (isHoneypotTripped(formData)) {
    return { ok: true };
  }

  // 2. Rate limit by IP.
  const ip = await getClientIp();
  const rl = await checkRateLimit({
    action: "signup",
    scope: "ip",
    identifier: ip,
    maxCount: 3,
    windowSeconds: 3600,
  });
  if (!rl.allowed) {
    return { ok: false, error: rateLimitErrorMessage(rl) };
  }

  // 3. Turnstile.
  const turnstile = await verifyTurnstile(formData, ip);
  if (!turnstile.ok) {
    return { ok: false, error: turnstileErrorMessage(turnstile.reason) };
  }

  // 4. Validation.
  const parsed = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    display_name: formData.get("display_name"),
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      ok: false,
      error: issue.message,
      field: String(issue.path[0] ?? ""),
    };
  }

  // 5. Supabase signup.
  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        display_name: parsed.data.display_name,
      },
    },
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  redirect("/signup/check-email");
}

/* -------------------------------------------------------------------------- */
/* Login                                                                      */
/*                                                                            */
/* Defense stack:                                                             */
/*   1. Rate limit — 5 attempts per IP per 15 minutes                         */
/*   2. Validation                                                            */
/*   3. Supabase signInWithPassword                                           */
/*                                                                            */
/* Note: no Turnstile on login by default — adds friction for legit users on  */
/* every visit. Re-enable here if credential stuffing becomes a problem.      */
/* -------------------------------------------------------------------------- */
export async function logInAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  // 1. Rate limit.
  const ip = await getClientIp();
  const rl = await checkRateLimit({
    action: "login",
    scope: "ip",
    identifier: ip,
    maxCount: 5,
    windowSeconds: 900,
  });
  if (!rl.allowed) {
    return { ok: false, error: rateLimitErrorMessage(rl) };
  }

  // 2. Validation.
  const parsed = emailPasswordSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      ok: false,
      error: issue.message,
      field: String(issue.path[0] ?? ""),
    };
  }

  // 3. Auth.
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

/* -------------------------------------------------------------------------- */
/* Logout                                                                     */
/* -------------------------------------------------------------------------- */
export async function logOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
