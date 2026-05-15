/**
 * Honeypot input — invisible to humans, irresistible to dumb form-fill bots.
 *
 * Usage:
 *  - Drop <Honeypot /> inside any <form>.
 *  - In the server action, call isHoneypotTripped(formData) — if true,
 *    silently reject (return success-looking response so the bot doesn't
 *    learn it was detected).
 *
 * Field name is intentionally generic ("website_url") so it looks
 * plausibly auto-fillable. CSS positions it off-screen and aria-hidden +
 * tabindex=-1 keep it out of accessible navigation.
 */

export const HONEYPOT_FIELD = "website_url";

export function Honeypot() {
  return (
    <div
      aria-hidden="true"
      // Hide visually, keep it in the DOM so bots find it.
      style={{
        position: "absolute",
        left: "-10000px",
        top: "auto",
        width: "1px",
        height: "1px",
        overflow: "hidden",
      }}
    >
      <label htmlFor={HONEYPOT_FIELD}>
        Leave this field empty
      </label>
      <input
        id={HONEYPOT_FIELD}
        name={HONEYPOT_FIELD}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        defaultValue=""
      />
    </div>
  );
}
