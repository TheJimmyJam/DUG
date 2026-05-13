import Link from "next/link";
import { DugLockup } from "@/components/dug-mark";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t bg-[var(--color-card)]">
      <div className="container-page py-10 text-sm text-[var(--color-muted)]">
        <div className="grid gap-8 grid-cols-2 lg:grid-cols-4">
          <div>
            <DugLockup showTagline={false} />
            <p className="mt-3 max-w-xs">
              A community for underwriters — emerging, independent, and experienced.
              Learn, debate, and find work in public.
            </p>
          </div>
          <div>
            <div className="font-semibold text-[var(--color-fg)]">Community</div>
            <ul className="mt-2 space-y-1.5">
              <li>
                <Link href="/community" className="hover:text-[var(--color-primary)]">
                  Discussions
                </Link>
              </li>
              <li>
                <Link href="/underwriters" className="hover:text-[var(--color-primary)]">
                  Member directory
                </Link>
              </li>
              <li>
                <Link href="/community#awards" className="hover:text-[var(--color-primary)]">
                  Awards & recognition
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-[var(--color-fg)]">Dojo & Marketplace</div>
            <ul className="mt-2 space-y-1.5">
              <li>
                <Link href="/dojo" className="hover:text-[var(--color-primary)]">
                  Practice cases
                </Link>
              </li>
              <li>
                <Link href="/dojo#contests" className="hover:text-[var(--color-primary)]">
                  Contests
                </Link>
              </li>
              <li>
                <Link href="/engagements" className="hover:text-[var(--color-primary)]">
                  Browse engagements
                </Link>
              </li>
              <li>
                <Link href="/post-engagement" className="hover:text-[var(--color-primary)]">
                  Post an engagement
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-[var(--color-fg)]">Company</div>
            <ul className="mt-2 space-y-1.5">
              <li>
                <Link href="/pricing" className="hover:text-[var(--color-primary)]">Pricing</Link>
              </li>
              <li>
                <Link href="/manifesto" className="hover:text-[var(--color-primary)]">Why humans →</Link>
              </li>
              <li>
                <Link href="/trust" className="hover:text-[var(--color-primary)]">Trust & accountability</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[var(--color-primary)]">About</Link>
              </li>
              <li>
                <Link href="/legal/terms" className="hover:text-[var(--color-primary)]">Terms</Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="hover:text-[var(--color-primary)]">Privacy</Link>
              </li>
            </ul>
            <p className="mt-4 text-xs leading-relaxed">
              DUG is a consulting and learning platform. Members provide advisory
              analysis only — never bind coverage on behalf of insurers.
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
