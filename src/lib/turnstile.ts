/**
 * Server-side Cloudflare Turnstile verification.
 *
 * Pulls `cf-turnstile-response` out of the FormData, validates it against
 * Cloudflare's siteverify endpoint, and returns ok/blocked.
 *
 * Behavior when not configured:
 *  - If TURNSTILE_SECRET_KEY is unset, returns { ok: true } (fail-open).
 *    This lets local development + first-deploy flows work before Cloudflare
 *    keys are in place. Production deploys MUST set the secret.
 */

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

type TurnstileVerifyResult = {
  ok: boolean;
  /** Short reason code when blocked. */
  reason?:
    | "missing_token"
    | "verify_failed"
    | "network_error";
};

export async function verifyTurnstile(
  formData: FormData,
  remoteIp?: string,
): Promise<TurnstileVerifyResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    // Fail open when not configured — allows local dev + initial deploys.
    return { ok: true };
  }

  const token = formData.get("cf-turnstile-response");
  if (typeof token !== "string" || token.length === 0) {
    return { ok: false, reason: "missing_token" };
  }

  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", token);
  if (remoteIp) body.set("remoteip", remoteIp);

  try {
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
      // Don't cache verify calls
      cache: "no-store",
    });
    if (!res.ok) return { ok: false, reason: "verify_failed" };
    const json = (await res.json()) as { success: boolean };
    if (!json.success) return { ok: false, reason: "verify_failed" };
    return { ok: true };
  } catch {
    return { ok: false, reason: "network_error" };
  }
}

/**
 * User-facing message for a failed Turnstile check. Generic on purpose —
 * don't tell bots which signal tripped them.
 */
export function turnstileErrorMessage(_reason: TurnstileVerifyResult["reason"]): string {
  return "We couldn't verify your browser. Refresh the page and try again.";
}
