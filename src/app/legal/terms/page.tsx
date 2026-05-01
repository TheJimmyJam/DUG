import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main className="container-page py-12">
        <article className="mx-auto max-w-2xl prose">
          <h1 className="text-3xl font-semibold tracking-tight">
            Terms of Service
          </h1>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Placeholder — final terms drafted with insurance regulatory counsel
            before public launch.
          </p>
          <div className="mt-6 space-y-4 text-[var(--color-fg)]/90 leading-relaxed text-sm">
            <p>
              <strong>Advisory only.</strong> DUG is a consulting marketplace.
              Members provide analysis and recommendations; they do not bind
              coverage on behalf of any insurer.
            </p>
            <p>
              <strong>Independent contractor status.</strong> Members are
              independent contractors, not employees. They are responsible for
              their own employment-agreement compliance, professional liability
              coverage, and tax obligations.
            </p>
            <p>
              <strong>No regulated advice.</strong> Recommendations on the
              platform are professional opinion, not regulated insurance
              advice. Posters retain full responsibility for any binding or
              coverage decisions.
            </p>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
