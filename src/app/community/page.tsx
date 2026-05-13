import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ArrowRight, MessageSquare, Shield, Star, Users } from "lucide-react";

export const metadata = {
  title: "Community — DUG",
  description: "Debate real risks in public. Build a reputation that travels with you. Peer moderation, awards, and visible credibility.",
};

export default function CommunityPage() {
  return (
    <>
      <SiteHeader />
      <main>

        {/* Hero */}
        <section className="border-b bg-gradient-to-b from-[var(--color-card)] to-[var(--color-bg)]">
          <div className="container-page py-16 sm:py-24">
            <div className="max-w-3xl">
              <Badge variant="primary" className="mb-4">Coming soon — join now</Badge>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                Credibility earned in public.
              </h1>
              <p className="mt-5 text-lg text-[var(--color-muted)] sm:text-xl">
                A community where your takes get stress-tested by peers, not just
                your manager. Post analysis. Debate risk. When you chime in, it
                should mean something — and when you&apos;re bluffing, the community will notice.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/signup">
                  <Button size="lg" variant="primary">
                    Create your profile
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/underwriters">
                  <Button size="lg" variant="secondary">
                    Browse the directory
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* How community credibility works */}
        <section className="border-b bg-[var(--color-card)]">
          <div className="container-page py-14">
            <h2 className="text-2xl font-semibold tracking-tight">How credibility works here.</h2>
            <p className="mt-2 max-w-2xl text-[var(--color-muted)]">
              Reputation isn&apos;t self-reported. It&apos;s earned through participation and visible to everyone.
            </p>
            <div className="mt-8 grid gap-6 md:grid-cols-2">

              <Card>
                <CardContent className="pt-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary)]/10">
                    <MessageSquare className="h-5 w-5 text-[var(--color-primary)]" />
                  </div>
                  <h3 className="mt-4 font-semibold">Public debate</h3>
                  <p className="mt-2 text-sm text-[var(--color-muted)]">
                    Post analysis on cases, lines, and market conditions. Challenge other members&apos; reasoning.
                    Substantive threads earn upvotes and stay visible. Weak takes fade. The quality of your
                    arguments — not your title or employer — is what carries weight here.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary)]/10">
                    <Star className="h-5 w-5 text-[var(--color-primary)]" />
                  </div>
                  <h3 className="mt-4 font-semibold">Medals & recognition</h3>
                  <p className="mt-2 text-sm text-[var(--color-muted)]">
                    Peers nominate exceptional analyses, helpful contributions, and community service.
                    Mods verify and award. Medals live permanently on your public profile. When a
                    carrier or poster is evaluating your marketplace profile, they see every one.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary)]/10">
                    <Shield className="h-5 w-5 text-[var(--color-primary)]" />
                  </div>
                  <h3 className="mt-4 font-semibold">Volunteer moderation</h3>
                  <p className="mt-2 text-sm text-[var(--color-muted)]">
                    The best communities are self-governing. DUG mods are community members who&apos;ve
                    earned the trust of their peers — not staff. They keep discussions substantive,
                    flag misinformation, and model the standard. The best mods earn recognition
                    that carries real weight on their profile.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary)]/10">
                    <Star className="h-5 w-5 text-[var(--color-primary)]" />
                  </div>
                  <h3 className="mt-4 font-semibold">Reputation is portable</h3>
                  <p className="mt-2 text-sm text-[var(--color-muted)]">
                    Your community standing feeds your full DUG profile — which is visible to
                    everyone who looks at your Dojo record or marketplace submissions. A 4.9-rated
                    underwriter with 50 community awards and 200 Dojo completions doesn&apos;t need
                    a resume. The profile speaks for itself.
                  </p>
                </CardContent>
              </Card>

            </div>
          </div>
        </section>

        {/* Discussion categories preview */}
        <section className="container-page py-16">
          <h2 className="text-2xl font-semibold tracking-tight">Where the conversations happen.</h2>
          <p className="mt-2 max-w-2xl text-[var(--color-muted)]">
            Organized by topic. Open to all members. Filtered by quality.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { name: "Risk Analysis", desc: "Post a case and get the community's take. Pick it apart. Find the holes in your reasoning before a loss does." },
              { name: "Market Conditions", desc: "Rate hardening, capacity shifts, carrier behavior. The information is scattered — the community centralizes it." },
              { name: "Emerging Lines", desc: "Cannabis, BESS, crypto, climate risk. Lines that are still being figured out by the industry are figured out here first." },
              { name: "Career & Transition", desc: "How to break in, how to level up, how to go independent. Mentorship happens in public so everyone benefits." },
              { name: "Regulatory & Compliance", desc: "State filings, coverage questions, regulatory trends. Not legal advice — community knowledge." },
              { name: "Tools & Data", desc: "Modeling software, data sources, workflows. What's actually useful vs. what carriers sell you." },
            ].map(({ name, desc }) => (
              <Card key={name}>
                <CardContent className="pt-6">
                  <div className="font-semibold">{name}</div>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* The mod culture section */}
        <section className="border-y bg-[var(--color-card)]">
          <div className="container-page py-14">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <Badge variant="primary" className="mb-3">Moderation</Badge>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Self-policing, by design.
                </h2>
                <p className="mt-4 text-[var(--color-muted)]">
                  The best underwriting communities — whether on LinkedIn, private Slacks, or
                  industry forums — are self-regulating. Experienced members call out bad
                  reasoning. Juniors learn by watching. Bluffing gets expensive fast.
                </p>
                <p className="mt-3 text-[var(--color-muted)]">
                  DUG formalizes that. Volunteer mods are elected by the community, empowered
                  to enforce standards, and recognized publicly for doing it well. It&apos;s a job
                  that attracts the right kind of person — someone who cares about the quality
                  of the conversation.
                </p>
                <p className="mt-3 text-[var(--color-muted)]">
                  If that sounds like you, your future profile will reflect it.
                </p>
              </div>
              <div className="grid gap-4">
                {[
                  { icon: Shield, title: "Community-elected", body: "Mods earn the role through contribution, not application. The community votes. Tenure is reviewed." },
                  { icon: Users, title: "Public accountability", body: "Mod actions are logged and visible. No black box decisions. Disagreements go to community vote." },
                  { icon: Star, title: "Recognized on your profile", body: "Mod tenure and community service show up on your public profile. It's a credential that means something." },
                ].map(({ icon: Icon, title, body }) => (
                  <Card key={title}>
                    <CardContent className="flex gap-4 pt-5">
                      <Icon className="h-5 w-5 mt-0.5 shrink-0 text-[var(--color-primary)]" />
                      <div>
                        <div className="font-semibold text-sm">{title}</div>
                        <p className="mt-1 text-xs text-[var(--color-muted)] leading-relaxed">{body}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container-page py-16">
          <div className="rounded-2xl bg-[var(--color-primary)] px-6 py-12 text-center text-[var(--color-primary-fg)] sm:px-12">
            <h2 className="text-3xl font-semibold tracking-tight">
              Start building before the Dojo opens.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-white/80">
              Community is live first. Your profile, reputation, and discussion history
              all carry over when the Dojo and full marketplace launch.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/signup">
                <Button size="lg" variant="accent">
                  Create your profile
                </Button>
              </Link>
              <Link href="/underwriters">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                >
                  Browse the directory
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
