/**
 * Rate-limit helper backed by the public.check_rate_limit() Postgres RPC.
 *
 * Usage:
 *   const verdict = await checkRateLimit({
 *     action: "signup",
 *     scope: "ip",
 *     identifier: ip,
 *     maxCount: 3,
 *     windowSeconds: 3600,
 *   });
 *   if (!verdict.allowed) return { ok: false, error: "Too many attempts." };
 *
 * Behavior on infra error:
 *   Fails open (allows the request) and logs to console — we'd rather let a
 *   legit user through than fail the form because Supabase blinked.
 */

import { headers } from "next/headers";
import { createServiceClient } from "@/lib/supabase/server";

export type RateLimitVerdict = {
  allowed: boolean;
  count: number;
  max: number;
  retryAfterSeconds: number;
};

export type RateLimitInput = {
  /** Action name, e.g. "signup", "login", "post_engagement". */
  action: string;
  /** Scope of the identifier — typically "ip" or "user". */
  scope: "ip" | "user";
  /** The actual identifier (IP address, user UUID, etc.). */
  identifier: string;
  /** Max events allowed in the window. */
  maxCount: number;
  /** Window length in seconds. */
  windowSeconds: number;
};

export async function checkRateLimit({
  action,
  scope,
  identifier,
  maxCount,
  windowSeconds,
}: RateLimitInput): Promise<RateLimitVerdict> {
  const key = `${action}:${scope}:${identifier}`;
  try {
    // RPC isn't in the generated Supabase types yet (added in
    // 20260515000000_rate_limits.sql). Cast around the strict typing —
    // regenerate types with `supabase gen types` to drop this cast.
    const supabase = createServiceClient() as unknown as {
      rpc: (
        fn: string,
        args: Record<string, unknown>,
      ) => Promise<{ data: unknown; error: { message: string } | null }>;
    };
    const { data, error } = await supabase.rpc("check_rate_limit", {
      p_key: key,
      p_max_count: maxCount,
      p_window_seconds: windowSeconds,
    });
    if (error) {
      console.error("[rate-limit] RPC error:", error.message);
      // Fail open
      return { allowed: true, count: 0, max: maxCount, retryAfterSeconds: 0 };
    }
    const v = (data ?? {}) as Partial<{
      allowed: boolean;
      count: number;
      max: number;
      retry_after_seconds: number;
    }>;
    return {
      allowed: v.allowed ?? true,
      count: v.count ?? 0,
      max: v.max ?? maxCount,
      retryAfterSeconds: v.retry_after_seconds ?? 0,
    };
  } catch (e) {
    console.error("[rate-limit] unexpected error:", e);
    return { allowed: true, count: 0, max: maxCount, retryAfterSeconds: 0 };
  }
}

/**
 * Best-effort client IP extraction from request headers.
 *
 * Netlify forwards the real client IP via `x-nf-client-connection-ip`;
 * `x-forwarded-for` is the fallback. Localhost dev usually has neither and
 * gets "anon" — which still rate-limits, just per-process not per-visitor.
 */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-nf-client-connection-ip") ||
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "anon"
  );
}

/**
 * Build the user-facing message for a blocked rate-limit. Slightly fuzzy on
 * the "try again in N" so bots can't time their retries precisely.
 */
export function rateLimitErrorMessage(verdict: RateLimitVerdict): string {
  const minutes = Math.max(1, Math.round(verdict.retryAfterSeconds / 60));
  if (minutes <= 1) return "Too many attempts. Try again in a minute.";
  if (minutes < 60) return `Too many attempts. Try again in ${minutes} minutes.`;
  const hours = Math.round(minutes / 60);
  return `Too many attempts. Try again in about ${hours} hour${hours === 1 ? "" : "s"}.`;
}
