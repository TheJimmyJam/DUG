import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * The DUG noble mole mark.
 * Drop-in replacement for the old SVG version — accepts the same className
 * prop so all existing usages (h-7 w-7, h-12 w-12, h-64 w-64, etc.) work
 * unchanged.
 */
export function DugMark({
  className,
  title = "DUG",
}: {
  className?: string;
  /** unused props kept for backwards compat */
  navy?: string;
  accent?: string;
  title?: string;
}) {
  return (
    <span
      className={cn("inline-block shrink-0", className)}
      role="img"
      aria-label={title}
    >
      <Image
        src="/dug-icon.png"
        alt={title}
        width={512}
        height={512}
        className="h-full w-full object-contain"
        priority
      />
    </span>
  );
}

/**
 * Horizontal lockup: mark + "DUG" wordmark + small tagline. Use in headers/footers.
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
