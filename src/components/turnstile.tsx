"use client";

/**
 * Cloudflare Turnstile widget — invisible bot challenge.
 *
 * Behavior:
 *  - Renders a hidden `cf-turnstile-response` input that Cloudflare's script
 *    populates with a one-shot token after the visitor passes the challenge.
 *  - Server-side `verifyTurnstile()` in @/lib/turnstile validates that token.
 *
 * Configuration:
 *  - NEXT_PUBLIC_TURNSTILE_SITE_KEY (client, public)
 *  - TURNSTILE_SECRET_KEY (server, secret)
 *
 * If the site key is missing the component renders nothing — useful for local
 * dev. Pair with the server-side check, which fails open when the secret is
 * missing for the same reason.
 */

import { useEffect, useRef } from "react";

const TURNSTILE_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";

// Lazy-load the script exactly once per page.
let scriptInjected = false;
function injectScript() {
  if (scriptInjected) return;
  if (typeof document === "undefined") return;
  if (document.querySelector(`script[src="${TURNSTILE_SRC}"]`)) {
    scriptInjected = true;
    return;
  }
  const s = document.createElement("script");
  s.src = TURNSTILE_SRC;
  s.async = true;
  s.defer = true;
  document.head.appendChild(s);
  scriptInjected = true;
}

export function Turnstile({
  action,
  theme = "auto",
}: {
  /** Optional action label — surfaces on Cloudflare's analytics dashboard. */
  action?: string;
  theme?: "auto" | "light" | "dark";
}) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!siteKey) return;
    injectScript();
  }, [siteKey]);

  // If keys aren't configured yet, render nothing — the server-side check will
  // also fail-open in this state. Allows local development without keys.
  if (!siteKey) return null;

  return (
    <div
      ref={containerRef}
      className="cf-turnstile"
      data-sitekey={siteKey}
      data-action={action}
      data-theme={theme}
      // The widget injects a hidden <input name="cf-turnstile-response">
      // into this container. Form submissions pick it up automatically.
    />
  );
}
