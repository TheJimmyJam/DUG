import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="container-page py-12">
        <article className="mx-auto max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight">
            About DUG
          </h1>
          <div className="mt-6 space-y-5 text-[var(--color-fg)]/90 leading-relaxed">
            <p>
              Insurance underwriting is broken for the people who do it. Carriers
              treat senior expertise as a salaried cost center while brokers
              with equivalent skills build wealth on commission. Caregivers and
              retirees with decades of experience get pushed out because the W2
              structure can&apos;t accommodate flexibility. Junior underwriters
              hit a learning ceiling because their carrier&apos;s book is
              narrow.
            </p>
            <p>
              DUG is a consulting marketplace for independent underwriters.
              Think of it as GitHub × Reddit × Uber for risk experts. Members
              build a public portfolio of work, earn a credibility score, and
              find consulting assignments that match their specialty. Posters
              (carriers, MGAs, agents who need an outside opinion) get fast
              access to vetted expertise without hiring full-time.
            </p>
            <h2 className="pt-2 text-2xl font-semibold tracking-tight">
              Advisory only.
            </h2>
            <p>
              DUG is not a managing general agency. Members never bind coverage
              on behalf of insurers — they provide written analysis,
              recommendations, and second opinions. The poster always makes the
              binding decision themselves. This keeps the platform compliant
              and the carrier in control.
            </p>
            <h2 className="pt-2 text-2xl font-semibold tracking-tight">
              Built for the in-between.
            </h2>
            <p>
              Caregivers returning to work on their own schedule. Semi-retired
              experts who want to stay sharp. Junior underwriters who want
              broader reps than their carrier provides. Between-jobs experts
              who need bridge income. Entrepreneurs building a portfolio that
              becomes a business. The W2 grind doesn&apos;t fit everyone.
            </p>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
