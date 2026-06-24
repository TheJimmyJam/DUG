import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import Image from "next/image";
import { ArrowRight, Briefcase, FileText, MessageSquare, Star, Users, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>

        {/* ── Hero ── */}
        <section className="relative border-b overflow-hidden bg-[var(--color-card)]">
          {/* Banner — fills the section on lg+, hidden on mobile */}
          <div className="hidden lg:block absolute inset-0">
            <Image
              src="/dug-banner.png"
              alt="DUG mascot"
              fill
              className="object-cover object-center"
              priority
            />
          </div>

          <div className="relative z-10 container-page py-10 sm:py-20 lg:py-28">
            {/* Mobile banner — shown only when full-bleed banner is hidden */}
            <div className="flex justify-center mb-6 lg:hidden">
              <Image
                src="/dug-banner-full-name.png"
                alt="DUG — Decentralized Underwriting Group"
                width={2172}
                height={724}
                className="w-full max-w-sm object-contain"
                priority
              />
            </div>

            {/* Force black text always — banner is always light regardless of theme */}
            <div className="max-w-xl [color-scheme:light]" style={{ color: "#1a1008" }}>
              <Badge variant="accent" className="mb-4">
                Beta — open to the underwriting community
              </Badge>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl !text-[#1a1008]">
                Where underwriters are made.
              </h1>
              <p className="mt-4 text-lg sm:text-xl !text-[#3d2b1f]">
                A community where independent underwriters, emerging talent, and industry
                insiders learn together, debate in public, and find consulting work — on
                their own terms.
              </p>
              <p className="mt-3 text-sm font-medium !text-[#1a1008]">
                The industry spent billions automating underwriting. We scaled the people they replaced.{" "}
                <Link href="/manifesto" className="underline underline-offset-2 hover:opacity-70">
                  Why humans →
                </Link>
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href="/community" className="w-full sm:w-auto">
                  <Button size="lg" variant="primary" className="w-full sm:w-auto">
                    Join the community
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/dojo" className="w-full sm:w-auto">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto !text-[#1a1008]">
                    Enter the Dojo
                  </Button>
                </Link>
              </div>
              <p className="mt-4 text-xs !text-[#5c4033]">
                Free to join. No carrier affiliation required. Lurk, learn, or earn — your call.{" "}
                <a href="/sizzle" className="underline underline-offset-2 hover:opacity-70 font-medium">
                  Watch the sizzle reel →
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* ── Three pillars ── */}
        <section className="border-b bg-[var(--color-card)]">
          <div className="container-page py-10 sm:py-16">
            <p className="text-sm font-semibold uppercase tracking-wider text-[var(--color-muted)]">
              Three pillars
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              One platform. Three ways to build.
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">

              <Card className="border-[var(--color-primary)]/30 ring-1 ring-[var(--color-primary)]/10">
                <CardContent className="pt-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary)]/10">
                    <MessageSquare className="h-5 w-5 text-[var(--color-primary)]" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">Community</h3>
                  <p className="mt-2 text-sm text-[var(--color-muted)]">
                    Debate real risks in public. Build a reputation that travels with you.
                    Medals, peer acknowledgment, and volunteer moderation make credibility
                    visible — and bluffing expensive.
                  </p>
                  <Link href="/community" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] hover:underline">
                    Explore discussions <ArrowRight className="h-3 w-3" />
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-[var(--color-accent)]/30 ring-1 ring-[var(--color-accent)]/10">
                <CardContent className="pt-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-accent)]/10">
                    <FileText className="h-5 w-5 text-[var(--color-accent)]" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">The Dojo</h3>
                  <p className="mt-2 text-sm text-[var(--color-muted)]">
                    Get reps at the plate. Practice on curated risk scenarios, compete in
                    underwriting contests, and build a training record before you ever take
                    a paid engagement.
                  </p>
                  <Link href="/dojo" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[var(--color-accent)] hover:underline">
                    Start training <ArrowRight className="h-3 w-3" />
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-border)]">
                    <Briefcase className="h-5 w-5 text-[var(--color-muted)]" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">Marketplace</h3>
                  <p className="mt-2 text-sm text-[var(--color-muted)]">
                    Claim consulting assignments — second looks, audits, renewal reviews,
                    complex risk analysis. Advisory work only. Your reputation from the
                    community and Dojo follows you here.
                  </p>
                  <Link href="/engagements" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[var(--color-muted)] hover:underline">
                    Browse open jobs <ArrowRight className="h-3 w-3" />
                  </Link>
                </CardContent>
              </Card>

            </div>
          </div>
        </section>

        {/* ── Dojo section ── */}
        <section className="container-page py-10 sm:py-16">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
            <div>
              <Badge variant="accent" className="mb-3">The Dojo</Badge>
              <h2 className="text-3xl font-semibold tracking-tight">
                The path from insider to underwriter.
              </h2>
              <p className="mt-4 text-[var(--color-muted)]">
                An Uber driver isn&apos;t a professional driver — but they can become one.
                The Dojo is the vessel. Claims adjusters, premium auditors, subject matter
                experts, and career changers get structured reps on real risk scenarios
                instead of waiting for a carrier to sweep them up and train them.
              </p>
              <p className="mt-3 text-[var(--color-muted)]">
                Practice submissions are scored. Contests rank participants in real time.
                As blinded carrier data becomes available, the cases get real. Your Dojo
                record feeds your public profile — before you ever claim a paid engagement.
              </p>
              <div className="mt-6">
                <Link href="/dojo">
                  <Button variant="primary">
                    Enter the Dojo
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: FileText, title: "Practice cases", body: "Curated risk scenarios across lines. Submit an analysis, get scored, see how you compare to the community." },
                { icon: Star, title: "Contests", body: "Timed underwriting challenges with live leaderboards. Compete for recognition, not just reps." },
                { icon: Star, title: "Dojo record", body: "Your training history is public. A strong Dojo record makes your marketplace profile credible from day one." },
                { icon: Zap, title: "Blinded carrier data", body: "Eventually: real submissions from real carriers, anonymized. The closest thing to live reps outside a carrier seat." },
              ].map(({ icon: Icon, title, body }) => (
                <Card key={title}>
                  <CardContent className="pt-5">
                    <Icon className="h-5 w-5 text-[var(--color-accent)]" />
                    <div className="mt-3 font-semibold text-sm">{title}</div>
                    <p className="mt-1 text-xs text-[var(--color-muted)] leading-relaxed">{body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ── Community section ── */}
        <section className="border-y bg-[var(--color-card)]">
          <div className="container-page py-10 sm:py-16">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
              <div className="grid gap-4 sm:grid-cols-2 order-last lg:order-first">
                {[
                  { icon: MessageSquare, title: "Public debate", body: "Post takes. Challenge others. Substantive risk discussions that sharpen everyone in the room." },
                  { icon: Users, title: "Peer moderation", body: "Volunteer mods keep it honest. Self-policing is the point — and the best mods earn recognition for it." },
                  { icon: Star, title: "Medals & acknowledgment", body: "Peer awards, featured analyses, reputation points. When you chime in, it means something." },
                  { icon: Star, title: "Visible credibility", body: "Your community reputation lives on your public profile. Bluffing doesn&apos;t survive peer scrutiny." },
                ].map(({ icon: Icon, title, body }) => (
                  <Card key={title}>
                    <CardContent className="pt-5">
                      <Icon className="h-5 w-5 text-[var(--color-primary)]" />
                      <div className="mt-3 font-semibold text-sm">{title}</div>
                      <p className="mt-1 text-xs text-[var(--color-muted)] leading-relaxed">{body}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div>
                <Badge variant="primary" className="mb-3">Community</Badge>
                <h2 className="text-3xl font-semibold tracking-tight">
                  Credibility you earn in public.
                </h2>
                <p className="mt-4 text-[var(--color-muted)]">
                  The best underwriters have strong opinions and the reasoning to back them.
                  DUG&apos;s community is where that reputation gets built in the open —
                  stress-tested by peers, not just your manager.
                </p>
                <p className="mt-3 text-[var(--color-muted)]">
                  When someone with a 4.9 rating and 200 Dojo completions weighs in on a
                  controversial case, it carries weight. When someone with an empty profile
                  talks big, the community notices. That asymmetry is intentional.
                </p>
                <div className="mt-6">
                  <Link href="/community">
                    <Button variant="primary">
                      Join the discussion
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Who it&apos;s for ── */}
        <section className="container-page py-10 sm:py-16">
          <h2 className="text-3xl font-semibold tracking-tight">
            Built for the underwriting spectrum.
          </h2>
          <p className="mt-2 max-w-2xl text-[var(--color-muted)]">
            From total outsider to 20-year veteran. Everyone builds in public.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Claims adjusters", "You understand loss. The Dojo teaches you to price it. Cross the aisle on your schedule."],
              ["Premium auditors", "Risk data fluency is half the job. The other half is right here."],
              ["Subject matter experts", "Deep expertise in cannabis, BESS, cyber, ag? The market needs your brain — DUG gives you the reps."],
              ["Between jobs", "Keep sharp and earn consulting income while you figure out the next move."],
              ["Semi-retired pros", "Mentor, moderate, and take the occasional job. Stay connected on your terms."],
              ["Hungry juniors", "See 10× more risk across more lines than any single carrier will show you."],
            ].map(([title, body]) => (
              <Card key={title}>
                <CardContent className="pt-6">
                  <div className="font-semibold">{title}</div>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">{body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="container-page py-10 sm:pb-20">
          <div className="rounded-2xl bg-[var(--color-primary)] px-5 py-10 text-center text-[var(--color-primary-fg)] sm:px-12 sm:py-12">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Your expertise is already here. The reps aren&apos;t.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm sm:text-base text-white/80">
              Join the community. Hit the Dojo. Take a job when you&apos;re ready.
              Your profile builds the whole time.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/signup" className="w-full sm:w-auto">
                <Button size="lg" variant="accent" className="w-full sm:w-auto">
                  Create your profile
                </Button>
              </Link>
              <Link href="/dojo" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full sm:w-auto bg-white/10 text-white border-white/20 hover:bg-white/20"
                >
                  Explore the Dojo
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
