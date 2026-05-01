import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DugMark } from "@/components/dug-mark";
import { ArrowRight, Award, Briefcase, Users } from "lucide-react";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="border-b bg-gradient-to-b from-[var(--color-card)] to-[var(--color-bg)]">
          <div className="container-page py-16 sm:py-24">
            <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="max-w-3xl">
                <Badge variant="accent" className="mb-4">
                  Beta — for independent underwriters
                </Badge>
                <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                  Underwriting on your terms.
                </h1>
                <p className="mt-5 text-lg text-[var(--color-muted)] sm:text-xl">
                  A consulting marketplace where independent underwriters earn
                  credibility, build a public portfolio, and find work — without
                  a W2 leash. Think GitHub × Reddit × Uber, built for risk
                  experts.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link href="/jobs">
                    <Button size="lg" variant="primary">
                      Browse open jobs
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="lg" variant="secondary">
                      Create your profile
                    </Button>
                  </Link>
                </div>
                <p className="mt-4 text-xs text-[var(--color-muted)]">
                  Sandbox is open. No payment required. No carrier integration
                  needed to start.
                </p>
              </div>
              <div className="hidden lg:block">
                <DugMark className="h-64 w-64 opacity-90" />
              </div>
            </div>
          </div>
        </section>

        {/* Three pillars */}
        <section className="container-page py-16">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <Briefcase className="h-6 w-6 text-[var(--color-primary)]" />
                <h3 className="mt-4 text-lg font-semibold">
                  Real work, real reps
                </h3>
                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  Claim consulting assignments — second looks, audits, renewal
                  reviews, complex risk analysis. Submit your work product and
                  build a public track record.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <Award className="h-6 w-6 text-[var(--color-accent)]" />
                <h3 className="mt-4 text-lg font-semibold">
                  Credibility that compounds
                </h3>
                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  Every completed job earns reviews and a rating. The work you
                  do today is portfolio you keep — visible to every carrier and
                  client who lands on your profile.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <Users className="h-6 w-6 text-[var(--color-primary)]" />
                <h3 className="mt-4 text-lg font-semibold">
                  Built for the in-between
                </h3>
                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  Caregivers, semi-retired pros, between-jobs experts, junior
                  underwriters who want more reps — DUG gives you a path the
                  W2 grind doesn&apos;t.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* How it works */}
        <section className="border-y bg-[var(--color-card)]">
          <div className="container-page py-16">
            <h2 className="text-3xl font-semibold tracking-tight">
              How it works
            </h2>
            <p className="mt-2 max-w-2xl text-[var(--color-muted)]">
              The whole platform runs on advisory work — recommendations only,
              never binding. That keeps you compliant and the carrier in
              control.
            </p>
            <ol className="mt-8 grid gap-6 md:grid-cols-4">
              {[
                {
                  n: 1,
                  title: "Build your profile",
                  body: "Tag your specialties (cannabis, BESS, CAT property, whatever you know). Add a bio. Done in 5 minutes.",
                },
                {
                  n: 2,
                  title: "Browse open jobs",
                  body: "Posters describe a risk and what they need analyzed. Filter by specialty, complexity, or budget.",
                },
                {
                  n: 3,
                  title: "Submit your analysis",
                  body: "Pick a job, do the work, send back a structured recommendation with reasoning. Stay advisory — never bind.",
                },
                {
                  n: 4,
                  title: "Get rated, repeat",
                  body: "Poster reviews your work and rates it. Your rating drives visibility. Top performers get the best jobs first.",
                },
              ].map((step) => (
                <li key={step.n}>
                  <div className="text-3xl font-bold text-[var(--color-accent)]">
                    {step.n}
                  </div>
                  <div className="mt-2 font-semibold">{step.title}</div>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Who it's for */}
        <section className="container-page py-16">
          <h2 className="text-3xl font-semibold tracking-tight">
            Built for six kinds of underwriter.
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Between jobs", "Bridge income while you figure out the next move."],
              ["Employed but bored", "Side reps to grow expertise and optionality."],
              ["Want to learn faster", "See 10× more risks across more lines."],
              ["Retired or semi-retired", "Stay sharp on your schedule."],
              ["Caregivers", "Real underwriting work that fits real life."],
              ["Entrepreneurs", "Build a portfolio that becomes a business."],
            ].map(([title, body]) => (
              <Card key={title}>
                <CardContent className="pt-6">
                  <div className="font-semibold">{title}</div>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">
                    {body}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="container-page pb-20">
          <div className="rounded-2xl bg-[var(--color-primary)] px-6 py-12 text-center text-[var(--color-primary-fg)] sm:px-12">
            <h2 className="text-3xl font-semibold tracking-tight">
              Your expertise is the product.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-white/80">
              Stop renting it to one carrier. Start building a portfolio you
              own.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/signup">
                <Button size="lg" variant="accent">
                  Create your profile
                </Button>
              </Link>
              <Link href="/jobs">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                >
                  Browse jobs first
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
