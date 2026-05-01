import { cn } from "@/lib/utils";

/**
 * The DUG hexagonal-node mark — the icon part of the brand.
 *
 * Inlined SVG so we can size it fluidly and never block rendering on a
 * separate request. Colors are CSS variables (--brand-mark-navy /
 * --brand-mark-accent) so the mark adapts to dark mode automatically.
 */
export function DugMark({
  className,
  navy,
  accent,
  title = "DUG",
}: {
  className?: string;
  navy?: string;
  accent?: string;
  title?: string;
}) {
  const navyColor = navy ?? "var(--brand-mark-navy, #0D1F3D)";
  const accentColor = accent ?? "var(--brand-mark-accent, #1E88E5)";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 400"
      role="img"
      aria-label={title}
      className={cn("inline-block", className)}
    >
      <title>{title}</title>
      <g stroke={navyColor} strokeWidth="7" strokeLinecap="round" fill="none">
        <line x1="321" y1="130" x2="321" y2="270" />
        <line x1="321" y1="270" x2="200" y2="340" />
        <line x1="200" y1="340" x2="79" y2="270" />
        <line x1="79" y1="270" x2="79" y2="130" />
        <line x1="79" y1="130" x2="200" y2="60" />
      </g>
      <line
        x1="200"
        y1="60"
        x2="321"
        y2="130"
        stroke={accentColor}
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M 200 135 L 252 153 L 252 222 Q 252 262 200 285 Q 148 262 148 222 L 148 153 Z"
        fill={navyColor}
      />
      <path
        d="M 200 135 L 252 153 L 252 222 Q 252 262 200 285 L 200 135 Z"
        fill={accentColor}
      />
      <line
        x1="200"
        y1="135"
        x2="200"
        y2="285"
        stroke={navyColor}
        strokeWidth="3"
      />
      <circle cx="200" cy="60" r="20" fill={navyColor} />
      <circle cx="321" cy="130" r="20" fill={accentColor} />
      <circle cx="321" cy="270" r="20" fill={navyColor} />
      <circle cx="200" cy="340" r="20" fill={navyColor} />
      <circle cx="79" cy="270" r="20" fill={navyColor} />
      <circle cx="79" cy="130" r="20" fill={navyColor} />
    </svg>
  );
}

/**
 * Horizontal lockup: mark + "DUG" + small tagline. Use in headers/footers.
 */
export function DugLockup({
  className,
  showTagline = true,
}: {
  className?: string;
  showTagline?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <DugMark className="h-7 w-7" />
      <span className="flex flex-col leading-none">
        <span className="text-base sm:text-lg font-bold tracking-tight text-[var(--color-fg)]">
          DUG
        </span>
        {showTagline && (
          <span className="hidden sm:block mt-0.5 text-[10px] uppercase tracking-wider text-[var(--color-muted)]">
            Decentralized Underwriting Group
          </span>
        )}
      </span>
    </span>
  );
}
