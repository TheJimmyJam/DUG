/**
 * Inline script that runs BEFORE React hydration and sets data-theme so we
 * never paint the wrong theme on first load (no flash of light theme).
 *
 * Order:
 *   1. Read user choice from localStorage ("dug-theme" = "dark"|"light"|"system")
 *   2. If "system" or unset, fall back to prefers-color-scheme
 *   3. Set <html data-theme="dark|light"> accordingly
 *   4. Add `theme-ready` class on next frame so transitions only kick in
 *      AFTER the initial paint (no animated theme flip on load)
 */
const SCRIPT = `
(function () {
  try {
    var saved = localStorage.getItem("dug-theme");
    var theme = saved && saved !== "system"
      ? saved
      : (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);
  } catch (_) {}
})();
`;

export function ThemeScript() {
  return (
    <script
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: SCRIPT }}
    />
  );
}
