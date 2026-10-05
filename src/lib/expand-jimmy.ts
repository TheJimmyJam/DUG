// Typing just "jimmy" in a sign-in email box means jimmy@cannoncodeconnect.com.
export const expandJimmy = (v: string) =>
  v.trim().toLowerCase() === "jimmy" ? "jimmy@cannoncodeconnect.com" : v;
