import Link from "next/link";
import { DugLockup } from "@/components/dug-mark";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t bg-[var(--color-card)]">
      <div className="container-page py-10 text-sm text-[var(--color-muted)]">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <DugLockup showTagline={false} />
            <p className="mt-3 max-w-xs">
              A consulting marketplace for independent underwriters. Build a
              portfolio. Earn credibility. Find work.
            </p>
          </div>
          <div>
            <div className="font-semibold text-[var(--color-fg)]">Platform</div>
            <ul className="mt-2 space-y-1.5">
              <li>
                <Link href="/jobs" className="hover:text-[var(--color-primary)]">
                  Browse jobs
                </Link>
              </li>
              <li>
                <Link
                  href="/underwriters"
                  className="hover:text-[var(--color-primary)]"
                >
                  Find underwriters
                </Link>
              </li>
              <li>
                <Link
                  href="/post-job"
                  className="hover:text-[var(--color-primary)]"
                >
                  Post a job
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-[var(--color-fg)]">Company</div>
            <ul className="mt-2 space-y-1.5">
              <li>
                <Link href="/about" className="hover:text-[var(--color-primary)]">
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/terms"
                  className="hover:text-[var(--color-primary)]"
                >
                  Terms
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/privacy"
                  className="hover:text-[var(--color-primary)]"
                >
                  Privacy
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-[var(--color-fg)]">
              Important
            </div>
            <p className="mt-2 text-xs leading-relaxed">
              DUG is a consulting platform. Members provide advisory analysis
              only — never bind coverage on behalf of insurers.
            </p>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 text-xs">
          © {new Date().getFullYear()} DUG. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
