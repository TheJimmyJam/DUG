import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "Why Humans — DUG",
  description:
    "The industry spent billions automating underwriting. We think that's a mistake. Here's why we're scaling the people instead.",
};

const TENETS = [
  {
    n: "01",
    heading: "AI learns from the past. Risk lives in the future.",
    body: "Every underwriting model was trained on historical claims, historical losses, historical patterns. But the risks that cost carriers billions are the ones nobody anticipated — the novel supply chain, the experimental facility, the contractual exposure that's never been litigated. A senior underwriter who has watched things go sideways for 25 years knows what questions to ask. The model doesn't know what it doesn't know.",
  },
  {
    n: "02",
    heading: "The people who trained the models are still here.",
    body: "Every AI underwriting tool was built on the decisions of human underwriters. Somewhere, a person made a call. That call went into a spreadsheet. That spreadsheet became training data. The models are a shadow of the humans who built them. We work with the originals — and we're training the next generation of them.",
  },
  {
    n: "03",
    heading: "Scale doesn't mean automation.",
    body: "The industry conflated two things: efficiency and intelligence. Automation is efficient. It is not intelligent. DUG is proof that you can have both scale and judgment. Five hundred independent underwriters reviewing the same submission will catch what one algorithm — and one overloaded desk underwriter — will miss. Distributed human expertise isn't a workaround. It's the architecture.",
  },
  {
    n: "04",
    heading: "Accountability travels with a name.",
    body: "When an algorithm makes a wrong call, the answer is a model update and a shrug. When an underwriter makes a call on DUG, their name, their track record, their public reputation in this community, and their entire career are attached to it. That asymmetry of accountability is not a bug in the old system. It is the feature we are bringing back.",
  },
  {
    n: "05",
    heading: "The algorithm optimizes for what it can measure. We care about the rest.",
    body: "Loss ratios. Frequency. Severity. These are the things models are good at. What they cannot measure: the management team that's bluffing their way through a renewal, the broker who buried the real exposure in paragraph fourteen, the risk that looks clean until you see the site. Human judgment exists precisely for the gap between what you can quantify and what you need to know.",
  },
  {
    n: "06",
    heading: "We are the hedge.",
    body: "Maybe the models get good enough. Maybe AI eventually closes the gap on complex commercial risk. We genuinely don't know — and neither does anyone else, no matter how confidently they say it. What we do know is that right now, in 2026, independent underwriters with real credentials reviewing real risks in public represent an option the market doesn't have anywhere else. That's not nostalgia. That's a position.",
  },
];

export default function ManifestoPage() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* ── Header ── */}
        <section className="border-b bg-[var(--color-card)]">
          <div className="container-page py-16 sm:py-20">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-wider text-[var(--color-accent)]">
                The human bet
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                The algorithm doesn&apos;t know what it doesn&apos;t know.
              </h1>
              <p className="mt-6 text-xl text-[var(--color-muted)] leading-relaxed">
                The insurance industry has spent billions trying to automate underwriting.
                We think that&apos;s exactly the wrong bet at exactly the wrong time — and we&apos;re
                building the alternative.
              </p>
            </div>
          </div>
        </section>

        {/* ── Tenets ── */}
        <section className="border-b">
          <div className="container-page py-16 sm:py-20">
            <div className="max-w-3xl space-y-16">
              {TENETS.map((t) => (
                <div key={t.n} className="grid gap-4 sm:grid-cols-[3rem_1fr]">
                  <div className="text-2xl font-bold text-[var(--color-border)] select-none">
                    {t.n}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                      {t.heading}
                    </h2>
                    <p className="mt-3 text-[var(--color-muted)] leading-relaxed">
                      {t.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Closing statement ── */}
        <section className="border-b bg-[var(--color-card)]">
          <div className="container-page py-16 sm:py-20">
            <div className="max-w-3xl">
              <blockquote className="border-l-4 border-[var(--color-accent)] pl-6">
                <p className="text-2xl font-semibold leading-snug sm:text-3xl">
                  &ldquo;Ten thousand underwriters, working in public, staking their reputations
                  on every call — that&apos;s not a product feature. That&apos;s a structural
                  advantage no model can replicate.&rdquo;
                </p>
              </blockquote>
              <p className="mt-8 text-[var(--color-muted)] leading-relaxed max-w-2xl">
                DUG exists because we believe the market is about to learn, expensively,
                that judgment cannot be fully automated. We intend to be the place where
                that judgment lives, grows, and gets deployed — by real underwriters,
                on real risks, with real accountability attached.
              </p>
              <p className="mt-4 text-[var(--color-muted)] leading-relaxed max-w-2xl">
                Join us before the realization becomes consensus.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link href="/community">
                  <Button variant="primary" size="lg">
                    Join the community
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/post-engagement">
                  <Button variant="secondary" size="lg">
                    Post an engagement
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
