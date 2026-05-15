/**
 * Server-side honeypot check.
 *
 * If the bot filled in the hidden field, this returns true. The caller
 * should silently drop the request (don't return an error — bots that
 * learn they've been caught get smarter).
 */

import { HONEYPOT_FIELD } from "@/components/honeypot";

export function isHoneypotTripped(formData: FormData): boolean {
  const v = formData.get(HONEYPOT_FIELD);
  return typeof v === "string" && v.trim().length > 0;
}
