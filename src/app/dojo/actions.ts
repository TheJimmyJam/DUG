"use server";

import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";

const schema = z.object({
  email: z.string().email("Enter a valid email address."),
  role_hint: z.string().max(60).optional().nullable(),
  referrer: z.string().max(120).optional().nullable(),
});

export type WaitlistResult = { ok: true } | { ok: false; error: string };

/**
 * Join the Dojo waitlist. Anonymous-friendly — uses the service role client
 * so the row inserts even before Auth is set up. RLS still allows anon
 * inserts on this table; the service role just sidesteps any policy churn.
 *
 * Gracefully handles the case where the migration hasn't been applied yet:
 * logs a warning and returns ok: true so users aren't blocked. The intent
 * is captured in the server logs until the table exists.
 */
export async function joinDojoWaitlistAction(
  _prev: WaitlistResult | null,
  formData: FormData,
): Promise<WaitlistResult> {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    role_hint: formData.get("role_hint") || null,
    referrer: formData.get("referrer") || null,
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  try {
    const supabase = createServiceClient();

    const { error } = await supabase.from("dojo_waitlist").insert({
      email: parsed.data.email.trim().toLowerCase(),
      role_hint: parsed.data.role_hint?.trim() || null,
      referrer: parsed.data.referrer?.trim() || null,
    });

    if (error) {
      // Friendly handling of common failure modes
      const code = (error as { code?: string }).code;
      const msg = error.message?.toLowerCase() ?? "";

      // Already on the list — treat as success so users don't get punished
      if (code === "23505" || msg.includes("duplicate")) {
        return { ok: true };
      }

      // Table missing (migration not applied) — log + treat as success
      if (msg.includes("relation") && msg.includes("does not exist")) {
        console.warn(
          "[dojo waitlist] table missing — apply 20260508000000_dojo_waitlist.sql. Captured email:",
          parsed.data.email,
        );
        return { ok: true };
      }

      console.error("[dojo waitlist] insert error:", error);
      return { ok: false, error: "Couldn't save your spot. Try again in a moment." };
    }

    return { ok: true };
  } catch (e) {
    console.error("[dojo waitlist] unexpected error:", e);
    return { ok: false, error: "Couldn't reach the server. Try again." };
  }
}
