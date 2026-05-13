import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Pricing — DUG",
  description:
    "DUG takes a simple percentage of each engagement. No subscriptions, no seat fees, no carrier affiliation required.",
};

const TIERS = [
  {
    id: "consumer",
    name: "Consumer",
    audience: "Individuals & homeowners",
    fee: "20%",
    minFee: "$5 minimum",
    color: "border-amber-200 bg-amber-50/50 dark:bg-amber-900/10 dark:border-amber-800/30",
    headingColor: "text-amber-800 dark:text-amber-400",
    description:
      "For personal lines — homeowners challenging a renewal increase, renters disputing a non-renewal, individuals who need an expert opinion before signing anything.",
    features: [
      "One underwriter assigned per request",
      "Written advisory opinion delivered",
      "No carrier affiliation required",
      "Your insurer is never notified",
      "Your data is never sold or shared",
    ],
    cta: { label: "Post an engagement", href: "/post-engagement" },
  },
  {
    id: "professional",
    name: "Professional",
    audience: "Brokers, agents, risk managers & commercial insureds",
    fee: "15%",
    minFee: null,
    color: "border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5",
    headingColor: "text-[var(--color-primary)]",
    description:
      "For brokers sharpening a submission, agents with hard-to-place accounts, risk managers preparing for renewal meetings, and commercial insureds who need an expert in their corner.",
    features: [
      "Full advisory analysis with written deliverable",
      "Pre-broker consult type specifically for brokers & risk managers",
      "Commercial coverage dispute advisory",
      "Underwriter credentials & E&O attested before engagement",
      "Conflict disclosures at engagement level",
    ],
    cta: { label: "Post an engagement", href: "/post-engagement" },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    audience: "Carriers, MGAs & reinsurers",
    fee: "10%",
    minFee: null,
    color: "border-indigo-200 bg-indigo-50/50 dark:bg-indigo-900/10 dark:border-indigo-800/30",
    headingColor: "text-indigo-700 dark:text-indigo-400",
    description:
      "For carriers needing independent second opinions, MGAs auditing program appetite, and reinsurers reviewing treaty pricing. Optional SLA commitments available.",
    features: [
      "Optional 24 / 48 / 72-hour SLA",
      "Multiple underwriter assignments for high-stakes reviews",
      "Program design and audit job types",
      "DUG carries platform E&O — documented at engagement level",
      "Regulatory posture statement available on request",
    ],
    cta: { label: "Post an engagement", href: "/post-engagement" },
  },
  {
    id: "strategic",
    name: "Strategic",
    audience: "Large carriers, AI labs & enterprise benchmarking",
    fee: "5–8%",
    minFee: "Annual license",
    color: "border-[var(--color-border)] bg-[var(--color-card)]",
    headingColor: "text-[var(--color-fg)]",
    description:
      "For Tier-1 carriers and AI companies running large-volume benchmarking or ongoing advisory programs. Custom fee structures, dedicated SLAs, and white-glove onboarding.",
    features: [
      "Custom negotiated fee rate (5–8%)",
      "Annual platform license with SLA",
      "Dedicated underwriter cohort for consistent methodology",
      "Blinded benchmarking protocols for AI/human comparison",
      "Results confidential — never published without written consent",
    ],
    cta: { label: "Contact us", href: "mailto:hello@dug.community" },
  },
];

const FAQS = [
  {
    q: "How does the fee work?",
    a: "DUG takes a percentage of the engagement value. The underwriter sets their rate, the requester pays it, and DUG's fee is deducted from the total before the underwriter is paid. No hidden fees, no markups.",
  },
  {
    q: "Do underwriters pay to use DUG?",
    a: "No. Underwriters join the community and Dojo for free. DUG only earns when a paid engagement closes — we're aligned with underwriter success.",
  },
  {
    q: "What's the minimum engagement value?",
    a: "Consumer-tier requests have a $5 platform minimum. Professional and Enterprise have no floor — the budget is set by the requester and negotiated with the underwriter.",
  },
  {
    q: "Can I post a volunteer or portfolio request?",
    a: "Yes. Any requester can post a volunteer-budget request, which Dojo members can claim for practice credit. There's no platform fee on volunteer engagements.",
  },
  {
    q: "Is there an annual subscription?",
    a: "No subscription for Consumer, Professional, or Enterprise tiers. Strategic accounts (Tier-1 carriers, AI labs) can negotiate an annual license for volume pricing and dedicated SLAs.",
  },
  {
    q: "What does the platform fee include?",
    a: "The fee covers the DUG marketplace, credential verification, underwriter E&O attestation tracking, platform professional liability insurance, conflict disclosure management, and the documented scope-of-work framework.",
  },
];

export default function PricingPage() {
  return (
    <>
      <SiteHeader />
      <main>

        {/* ── Header ── */}
        <section className="border-b bg-[var(--color-card)]">
          <div className="container-page py-16 sm:py-20">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-wider text-[var(--color-primary)]">
                Pricing
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
                Pay when it closes. Nothing else.
              </h1>
              <p className="mt-5 text-lg text-[var(--color-muted)] leading-relaxed">
                DUG takes a percentage of each engagement. No subscriptions, no seat fees,
                no carrier affiliation required. The rate depends on who you are — the model
                scales from a $5 homeowners consult to a seven-figure enterprise program.
              </p>
            </div>
          </div>
        </section>

        {/* ── Tiers ── */}
        <section className="border-b">
          <div className="container-page py-14">
            <div className="grid gap-6 md:grid-cols-2">
              {TIERS.map((tier) => (
                <div
                  key={tier.id}
                  className={`rounded-xl border p-6 flex flex-col ${tier.color}`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className={`text-xs font-semibold uppercase tracking-wider mb-0.5 ${tier.headingColor}`}>
                        {tier.name}
                      </div>
                      <div className="text-sm text-[var(--color-muted)]">{tier.audience}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-2xl font-bold text-[var(--color-fg)]">{tier.fee}</div>
                      {tier.minFee && (
                        <div className="text-xs text-[var(--color-muted)]">{tier.minFee}</div>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-5">
                    {tier.description}
                  </p>

                  <ul className="space-y-2 mb-6 flex-1">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-[var(--color-muted)]">
                        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-primary)]/60" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <div>
                    <Link href={tier.cta.href}>
                      <Button variant="primary" size="sm">
                        {tier.cta.label}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How fees work ── */}
        <section className="border-b bg-[var(--color-card)]">
          <div className="container-page py-14 max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight mb-2">How it works</h2>
            <p className="text-[var(--color-muted)] mb-8">Simple math, no surprises.</p>
            <div className="space-y-6">
              {[
                {
                  step: "01",
                  title: "Post an engagement",
                  body: "You describe what you need, set a budget, and post. The form takes a few minutes. No account required to browse.",
                },
                {
                  step: "02",
                  title: "An underwriter claims it",
                  body: "Qualified underwriters see your request and claim it. Their credentials, Dojo record, and ratings are visible before you accept.",
                },
                {
                  step: "03",
                  title: "Work happens, deliverable delivered",
                  body: "The underwriter completes the advisory analysis. DUG's scope-of-work framework documents what was promised and delivered.",
                },
                {
                  step: "04",
                  title: "DUG takes its cut, underwriter gets paid",
                  body: "The platform fee is deducted from the engagement total. The underwriter receives the remainder. No invoice chasing, no net-60.",
                },
              ].map(({ step, title, body }) => (
                <div key={step} className="grid gap-4 sm:grid-cols-[3rem_1fr]">
                  <div className="text-2xl font-bold text-[var(--color-border)] select-none">{step}</div>
                  <div>
                    <div className="font-semibold mb-1">{title}</div>
                    <p className="text-sm text-[var(--color-muted)] leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="border-b">
          <div className="container-page py-14 max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight mb-8">Common questions</h2>
            <div className="space-y-6">
              {FAQS.map(({ q, a }) => (
                <div key={q} className="border-l-4 border-[var(--color-primary)]/30 pl-5">
                  <div className="font-semibold mb-1">{q}</div>
                  <p className="text-sm text-[var(--color-muted)] leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="bg-[var(--color-card)]">
          <div className="container-page py-12 max-w-3xl">
            <p className="text-[var(--color-muted)] text-sm leading-relaxed">
              Questions about enterprise pricing, strategic accounts, or embedded E&amp;O?{" "}
              <a href="mailto:hello@dug.community" className="underline underline-offset-2 hover:text-[var(--color-primary)]">
                hello@dug.community
              </a>
            </p>
          </div>
        </section>

      </main>
      <SiteFooter />
    </>
  );
}
