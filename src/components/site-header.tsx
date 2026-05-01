import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DugLockup } from "@/components/dug-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileMenu } from "@/components/mobile-menu";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-[var(--color-card)]">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center" aria-label="DUG home">
          <DugLockup />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 text-sm md:flex">
          <Link
            href="/jobs"
            prefetch={true}
            className="text-[var(--color-fg)] hover:text-[var(--color-primary)]"
          >
            Browse jobs
          </Link>
          <Link
            href="/underwriters"
            prefetch={true}
            className="text-[var(--color-fg)] hover:text-[var(--color-primary)]"
          >
            Underwriters
          </Link>
          <Link
            href="/about"
            prefetch={true}
            className="text-[var(--color-fg)] hover:text-[var(--color-primary)]"
          >
            About
          </Link>
        </nav>

        {/* Desktop right actions */}
        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Log in
            </Button>
          </Link>
          <Link href="/signup">
            <Button variant="primary" size="sm">
              Join the network
            </Button>
          </Link>
        </div>

        {/* Mobile right actions */}
        <div className="flex md:hidden items-center gap-1">
          <ThemeToggle />
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
