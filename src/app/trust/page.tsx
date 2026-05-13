import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Shield, Users, FileText, Lock, AlertCircle, CheckCircle } from "lucide-react";

export const metadata = {
  title: "Trust & Accountability — DUG",
  description:
    "DUG is built the hard way and the right way. Here is exactly what we are, what we are not, and how accountability works on this platform.",
};

const NOT_US = [
  "An insurance carrier or MGA",
  "A surplus lines broker or agent",
  "A claims handler or adjudicator",
  "A coverage attorney or legal advisor",
  "A data broker or insurer affiliate",
];

const WHAT_WE_ARE = [
  "A platform where credentialed independent underwriters provide advisory analysis",
  "A learning community where underwriting judgment is built in public",
  "A marketplace where requesters and independent professionals find each other",
  "A company that carries its own platform E&O and cyber liability insurance",
];

const AUDIENCES = [
  {
    icon: Shield,
    label: "For carriers & CUOs",
    items: [
      "DUG members provide advisory analysis only — they never bind, issue, or represent any carrier or MGA.",
      "Every marketplace underwriter discloses active carrier employment or exclusive relationships. Conflicts are disclosed at the engagement level.",
      "Advisory underwriting analysis is not the practice of insurance in any U.S. jurisdiction we have reviewed. We maintain a public regulatory posture statement, updated quarterly.",
      "Members are prohibited by our Terms from referencing DUG analysis in coverage litigation.",
    ],
  },
  {
    icon: Users,
    label: "For brokers & agents",
    items: [
      "DUG is not a competing brokerage. We do not place coverage, negotiate terms, or contact your clients' insurers.",
      "Brokers can use DUG’s pre-broker consult job type to bring independent underwriting perspective before going to market — strengthening your submission.",
      "A DUG advisory opinion carries no more legal weight than any other third-party consultant’s memo. It is not a claims determination.",
    ],
  },
  {
    icon: FileText,
    label: "For risk managers & commercial insureds",
    items: [
      "Every DUG marketplace underwriter carries their own E&O insurance, attested before their first paid engagement.",
      "DUG carries platform professional liability (E&O) insurance.",
      "Every engagement includes a documented scope of work with explicit reliance limitations.",
      "Your engagement history is confidential. We do not share it with your broker, carrier, or any third party.",
    ],
  },
  {
    icon: Lock,
    label: "For individuals & consumers",
    items: [
      "Your submission data — home address, renewal documents, claim history — is visible only to the underwriter(s) you engage.",
      "We do not sell your data. We do not share it with insurers. We do not use it to train AI models.",
      "You can delete your account and all associated data at any time.",
      "Your insurer is not notified when you use DUG. This is your right.",
    ],
  },
  {
    icon: AlertCircle,
    label: "For tech & AI companies",
    items: [
      "You own your submission data and your model’s outputs. DUG claims no IP rights to benchmarking inputs or outputs.",
      "Benchmarking engagements are confidential by default. Results are never published without your explicit written consent.",
      "Aggregate anonymized performance data may be used for platform analytics only in ways that cannot identify your model or organization.",
    ],
  },
];

export default function TrustPage() {
  return (
    <>
      <SiteHeader />
      <main>

        {/* ── Header ── */}
        <section className="border-b bg-[var(--color-card)]">
          <div className="container-page py-16 sm:py-20">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-wider text-[var(--color-primary)]">
                Trust & accountability
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
                Built the hard way. Before we had to.
              </h1>
              <p className="mt-5 text-lg text-[var(--color-muted)] leading-relaxed">
                We know what the objections are. We built the answers into the platform before
                anyone asked. This page exists so you don&apos;t have to wonder.
              </p>
            </div>
          </div>
        </section>

        {/* ── What we are not / What we are ── */}
        <section className="border-b">
          <div className="container-page py-14">
            <div className="grid gap-10 md:grid-cols-2 max-w-5xl">

              <div>
                <h2 className="text-xl font-semibold mb-5">DUG is not:</h2>
                <ul className="space-y-3">
                  {NOT_US.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-[var(--color-muted)]">
                      <span className="mt-1 h-4 w-4 shrink-0 rounded-full border-2 border-[var(--color-muted)]/40" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-5">DUG is:</h2>
                <ul className="space-y-3">
                  {WHAT_WE_ARE.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-[var(--color-muted)]">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-primary)]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        </section>

        {/* ── Audience-specific answers ── */}
        <section className="border-b bg-[var(--color-card)]">
          <div className="container-page py-14">
            <h2 className="text-2xl font-semibold tracking-tight mb-2">
              Answers by audience
            </h2>
            <p className="text-[var(--color-muted)] mb-10 max-w-2xl">
              We wrote this for the skeptic, not the convert. Find your role below.
            </p>

            <div className="space-y-10 max-w-3xl">
              {AUDIENCES.map(({ icon: Icon, label, items }) => (
                <div key={label} className="rounded-lg border bg-[var(--color-bg)] p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-primary)]/10">
                      <Icon className="h-5 w-5 text-[var(--color-primary)]" />
                    </div>
                    <h3 className="font-semibold text-lg">{label}</h3>
                  </div>
                  <ul className="space-y-3">
                    {items.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-[var(--color-muted)] leading-relaxed">
                        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-primary)]/60" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── The receipts ── */}
        <section className="border-b">
          <div className="container-page py-14 max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight mb-2">The receipts</h2>
            <p className="text-[var(--color-muted)] mb-8">
              Vague assurances are worse than silence. Here is exactly what is in place.
            </p>
            <div className="space-y-6">
              {[
                {
                  title: "Cyber liability insurance",
                  body: "DUG carries active cyber liability coverage. This protects against data breaches, unauthorized access, and breach response costs. We obtained this coverage at launch — before we had material volume — because it was the right thing to do.",
                },
                {
                  title: "Platform professional liability (E&O)",
                  body: "DUG carries platform E&O insurance covering our role as a marketplace facilitator. This was in place before the first paid transaction closed.",
                },
                {
                  title: "Underwriter E&O attestation",
                  body: "Every underwriter approved for paid marketplace work attests to active E&O coverage before their first engagement. Attestation date and carrier class are recorded. Lapsed coverage results in immediate marketplace suspension until reinstated.",
                },
                {
                  title: "Credential verification",
                  body: "Marketplace underwriters reach verified status through one of two paths: credential upload (license number, designations, prior employer — human-reviewed) or demonstrated Dojo performance (benchmarked case scores above the cohort threshold). Both paths result in a verified badge with the path disclosed.",
                },
                {
                  title: "Conflict disclosure",
                  body: "Active carrier employees and exclusive MGA members must disclose their affiliation at signup and again at the engagement level for any submission in their line. Undisclosed conflicts are grounds for immediate removal.",
                },
                {
                  title: "Regulatory posture",
                  body: "DUG maintains a public regulatory posture statement characterizing our service and the legal basis for our operations. It is updated quarterly and timestamped. If our position changes, we say so.",
                },
              ].map(({ title, body }) => (
                <div key={title} className="border-l-4 border-[var(--color-primary)]/30 pl-5">
                  <div className="font-semibold mb-1">{title}</div>
                  <p className="text-sm text-[var(--color-muted)] leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Closing ── */}
        <section className="bg-[var(--color-card)]">
          <div className="container-page py-12 max-w-3xl">
            <p className="text-[var(--color-muted)] text-sm leading-relaxed">
              DUG is a consulting and learning platform. Members provide advisory analysis only —
              they do not bind coverage, represent insurers, or act as licensed agents or brokers
              in connection with any DUG engagement. Nothing on this platform constitutes legal,
              financial, or insurance advice. If you have questions about your specific coverage
              situation, consult a licensed professional.
            </p>
            <p className="mt-3 text-xs text-[var(--color-muted)]/70">
              Questions about our trust and compliance posture?{" "}
              <a href="mailto:trust@dug.community" className="underline underline-offset-2 hover:text-[var(--color-primary)]">
                trust@dug.community
              </a>
            </p>
          </div>
        </section>

      </main>
      <SiteFooter />
    </>
  );
}
