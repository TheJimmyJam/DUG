import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DugMark } from "@/components/dug-mark";
import { WaitlistForm } from "./waitlist-form";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Flame,
  Layers,
  Lock,
  Medal,
  Star,
  Trophy,
  Users,
  XCircle,
  Zap,
} from "lucide-react";

export const metadata = {
  title: "The Dojo — DUG",
  description:
    "Get reps at the plate. Practice underwriting cases, compete in contests, and build a public training record before your first paid job.",
};

export default function DojoPage() {
  return (
    <>
      <SiteHeader />
      <main>

        {/* ───────────────────────────  Hero  ─────────────────────────── */}
        <section className="border-b bg-gradient-to-b from-[var(--color-card)] to-[var(--color-bg)]">
          <div className="container-page py-12 sm:py-24">
            <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="max-w-3xl">
                <Badge variant="accent" className="mb-4">Coming soon — join the waitlist</Badge>
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                  The Underwriting Dojo.
                </h1>
                <p className="mt-4 text-lg text-[var(--color-muted)] sm:text-xl">
                  An Uber driver isn&apos;t a professional driver — but they can become one.
                  The Dojo is the vessel. Get structured reps on real risk scenarios
                  instead of waiting for a carrier to sweep you up and train you.
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link href="#join" className="w-full sm:w-auto">
                    <Button size="lg" variant="primary" className="w-full sm:w-auto">
                      Join the waitlist
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="#how-it-works" className="w-full sm:w-auto">
                    <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                      See how a rep works
                    </Button>
                  </Link>
                </div>

                {/* Quick proof line */}
                <div className="mt-8 grid max-w-xl grid-cols-3 gap-4 border-t border-[var(--color-border)] pt-6 text-sm">
                  <div>
                    <div className="text-2xl font-semibold tracking-tight">100+</div>
                    <div className="text-[var(--color-muted)]">cases at launch</div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold tracking-tight">12</div>
                    <div className="text-[var(--color-muted)]">specialty lines</div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold tracking-tight">5</div>
                    <div className="text-[var(--color-muted)]">difficulty tiers</div>
                  </div>
                </div>
              </div>

              <div className="hidden lg:flex lg:items-center lg:justify-center">
                <div className="relative">
                  <div className="absolute inset-0 -m-6 rounded-full bg-[var(--color-accent)]/10 blur-2xl" />
                  <DugMark className="relative h-64 w-64" title="Digger — DUG mascot" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ───────────────────────  How a rep works  ─────────────────────── */}
        <section className="border-b" id="how-it-works">
          <div className="container-page py-14 sm:py-16">
            <div className="max-w-2xl">
              <Badge variant="accent" className="mb-3">How it works</Badge>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                One rep, end to end.
              </h2>
              <p className="mt-2 text-[var(--color-muted)]">
                Every Dojo case follows the same loop the marketplace uses. By the time
                you take a paid job, the workflow is muscle memory.
              </p>
            </div>

            <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  n: "01",
                  icon: FileText,
                  title: "Pick a case",
                  body: "Browse curated submissions across lines and difficulty. Pick one that stretches you — not one that bores you.",
                },
                {
                  n: "02",
                  icon: Layers,
                  title: "Submit your read",
                  body: "Rationale, premium suggestion, red flags, confidence. Same fields a paid job would use. Same time pressure if you want it.",
                },
                {
                  n: "03",
                  icon: Star,
                  title: "Get scored",
                  body: "Compared against the model answer and community submissions. You see exactly where your reasoning held up — and where it didn't.",
                },
                {
                  n: "04",
                  icon: Trophy,
                  title: "Build your record",
                  body: "Every score, every rank, every contest finish lives on your public profile. Show up to the marketplace with proof of work.",
                },
              ].map(({ n, icon: Icon, title, body }) => (
                <li
                  key={n}
                  className="relative rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-accent)]/10">
                      <Icon className="h-5 w-5 text-[var(--color-accent)]" />
                    </div>
                    <span className="text-xs font-mono tracking-wider text-[var(--color-muted)]">
                      {n}
                    </span>
                  </div>
                  <h3 className="mt-4 font-semibold">{title}</h3>
                  <p className="mt-1.5 text-sm text-[var(--color-muted)]">{body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ───────────────────────  Who it's for  ─────────────────────── */}
        <section className="border-b bg-[var(--color-card)]">
          <div className="container-page py-14">
            <h2 className="text-2xl font-semibold tracking-tight">Built for the in-between.</h2>
            <p className="mt-2 max-w-2xl text-[var(--color-muted)]">
              The Dojo isn&apos;t just for aspiring underwriters. It&apos;s for anyone with adjacent
              expertise who wants to make the move — or just get sharper.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Claims adjusters",
                  body: "You already understand loss from the ground up. The Dojo teaches you to price it. Most carriers won't show you that side — we will.",
                },
                {
                  title: "Premium auditors",
                  body: "Risk data fluency is half the underwriting job. You have it. Use the Dojo to close the gap on the other half.",
                },
                {
                  title: "Subject matter experts",
                  body: "Deep expertise in cannabis, BESS, cyber, marine, ag? The market needs that brain. The Dojo gives you the structured reps to become credentialed in it.",
                },
                {
                  title: "Career changers",
                  body: "You don't need a carrier job to start building underwriting credentials. You need reps. That's what the Dojo is.",
                },
                {
                  title: "Junior underwriters",
                  body: "See 10× more risk across more lines than your employer will show you. Every case is a rep. Every rep compounds.",
                },
                {
                  title: "Experienced UWs",
                  body: "Keep sharp on lines outside your specialty. Mentor trainees. Host contests. Your expertise has value here too.",
                },
              ].map(({ title, body }) => (
                <Card key={title}>
                  <CardContent className="pt-6">
                    <div className="font-semibold">{title}</div>
                    <p className="mt-1 text-sm text-[var(--color-muted)]">{body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ───────────────────────  Sample case preview  ─────────────────────── */}
        <section className="container-page py-16 sm:py-20" id="sample-case">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center">
            <div>
              <Badge variant="accent" className="mb-3">Sample case</Badge>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                What a Dojo case looks like.
              </h2>
              <p className="mt-3 text-[var(--color-muted)]">
                Real shape, real fields, real difficulty. The only thing redacted is
                the carrier name. You&apos;ll get cases like this across property,
                liability, specialty, and emerging lines — built by experienced DUG
                members and, eventually, carrier partners.
              </p>
              <ul className="mt-5 space-y-2 text-sm">
                {[
                  "Structured submission packet (loss runs, financials, exposures)",
                  "Time-boxed scoring window — go quick or go thorough",
                  "Compare your read against community + model answers",
                  "Optional discussion thread after submission closes",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-2 text-[var(--color-muted)]">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent)]" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* The mock case card */}
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm">
              <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-3 text-xs">
                <span className="flex items-center gap-2 text-[var(--color-muted)]">
                  <Lock className="h-3.5 w-3.5" />
                  Dojo Case · DOJO-2026-014
                </span>
                <Badge variant="warning">Difficulty 4 / 5</Badge>
              </div>
              <div className="px-5 py-5">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <Badge variant="primary">Habitational</Badge>
                  <Badge variant="default">CAT — Wind / Hail</Badge>
                  <Badge variant="default">Loss-troubled</Badge>
                </div>
                <h3 className="mt-3 font-semibold">
                  Coastal habitational renewal — 312-unit garden style, 3 hail losses in 4 yrs
                </h3>
                <p className="mt-1.5 text-sm text-[var(--color-muted)]">
                  Incumbent carrier non-renewing. Broker submitting to E&amp;S markets at
                  +47% with $50K AOP / 5% wind ded. Insured pushing back hard on the
                  wind deductible. Your read?
                </p>

                <dl className="mt-5 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                  {[
                    { k: "TIV", v: "$48.2M" },
                    { k: "Loss ratio (5yr)", v: "138%" },
                    { k: "Time limit", v: "60 min" },
                    { k: "Reps so far", v: "47" },
                  ].map(({ k, v }) => (
                    <div
                      key={k}
                      className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2"
                    >
                      <div className="text-[var(--color-muted)]">{k}</div>
                      <div className="mt-0.5 font-semibold">{v}</div>
                    </div>
                  ))}
                </dl>

                <div className="mt-5 flex items-center justify-between border-t border-[var(--color-border)] pt-4 text-xs text-[var(--color-muted)]">
                  <span className="flex items-center gap-1.5">
                    <Flame className="h-3.5 w-3.5 text-[var(--color-accent)]" />
                    Hot — 12 submissions in last 24h
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    Closes in 2d 14h
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ───────────────────────  Features  ─────────────────────── */}
        <section className="border-t bg-[var(--color-card)]" id="features">
          <div className="container-page py-16">
            <h2 className="text-2xl font-semibold tracking-tight">What&apos;s in the Dojo.</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">

              <Card>
                <CardContent className="pt-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-accent)]/10">
                    <FileText className="h-5 w-5 text-[var(--color-accent)]" />
                  </div>
                  <h3 className="mt-4 font-semibold">Practice cases</h3>
                  <p className="mt-2 text-sm text-[var(--color-muted)]">
                    Curated risk scenarios across lines — property, liability, specialty,
                    emerging risk. Submit a structured analysis, get scored against model
                    answers and community benchmarks, and see exactly where your reasoning
                    held up and where it didn&apos;t.
                  </p>
                  <p className="mt-2 text-sm text-[var(--color-muted)]">
                    Difficulty levels from trainee through expert. Cases contributed by
                    experienced DUG members and, eventually, carrier partners.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-accent)]/10">
                    <Trophy className="h-5 w-5 text-[var(--color-accent)]" />
                  </div>
                  <h3 className="mt-4 font-semibold">Contests</h3>
                  <p className="mt-2 text-sm text-[var(--color-muted)]">
                    Timed underwriting challenges with live leaderboards. A new case drops,
                    the community has 48 hours (or sometimes 48 minutes — live contests are
                    coming), submissions get scored, and rankings publish publicly.
                  </p>
                  <p className="mt-2 text-sm text-[var(--color-muted)]">
                    Contests run by specialty, experience level, or open bracket. Top
                    finishers earn community awards that live permanently on their profile.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-accent)]/10">
                    <Medal className="h-5 w-5 text-[var(--color-accent)]" />
                  </div>
                  <h3 className="mt-4 font-semibold">Your Dojo record</h3>
                  <p className="mt-2 text-sm text-[var(--color-muted)]">
                    Every case you attempt, every score you earn, every contest you place
                    in — it lives on your public profile. When you eventually claim a paid
                    job in the marketplace, your Dojo record is the proof of work that gets
                    you taken seriously.
                  </p>
                  <p className="mt-2 text-sm text-[var(--color-muted)]">
                    Start building it now, before you ever need it.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-accent)]/10">
                    <Zap className="h-5 w-5 text-[var(--color-accent)]" />
                  </div>
                  <h3 className="mt-4 font-semibold">Blinded carrier data</h3>
                  <p className="mt-2 text-sm text-[var(--color-muted)]">
                    The roadmap includes real submission data from carrier partners,
                    anonymized and structured for training. Carriers already export data in
                    bordereaux format for reinsurers — the infrastructure is there.
                  </p>
                  <p className="mt-2 text-sm text-[var(--color-muted)]">
                    When this goes live, Dojo cases become the closest thing to sitting in
                    an underwriting seat — without the W2.
                  </p>
                </CardContent>
              </Card>

            </div>
          </div>
        </section>

        {/* ───────────────────────  Comparison  ─────────────────────── */}
        <section className="container-page py-16 sm:py-20">
          <div className="max-w-2xl">
            <Badge variant="accent" className="mb-3">The case</Badge>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Two paths into the seat.
            </h2>
            <p className="mt-2 text-[var(--color-muted)]">
              The traditional carrier track works — if you can get in. The Dojo is what
              the rest of the talent pool has been waiting for.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {/* Traditional */}
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-[var(--color-muted)]">
                  Traditional carrier track
                </span>
              </div>
              <h3 className="mt-2 text-xl font-semibold tracking-tight">
                Wait for someone to pick you.
              </h3>
              <ul className="mt-5 space-y-3 text-sm">
                {[
                  "Apply to a trainee program. Compete with 200 others for one spot.",
                  "Get assigned one specialty. Stay in it for 3–5 years.",
                  "See whatever risks the carrier's appetite walks in the door.",
                  "Reputation is internal — visible to your manager, not the market.",
                  "Leave the carrier and your portfolio doesn't come with you.",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-2 text-[var(--color-muted)]">
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-danger)]" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Dojo */}
            <div className="rounded-2xl border-2 border-[var(--color-accent)] bg-[var(--color-card)] p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-[var(--color-accent)]">
                  The Dojo
                </span>
                <Badge variant="accent">DUG</Badge>
              </div>
              <h3 className="mt-2 text-xl font-semibold tracking-tight">
                Pick yourself. Prove it in public.
              </h3>
              <ul className="mt-5 space-y-3 text-sm">
                {[
                  "Start the moment you sign up. No application, no gatekeeper.",
                  "Cycle through 12+ lines and 5 difficulty tiers — go where the reps are.",
                  "Curated case library + carrier-anonymized data on the roadmap.",
                  "Reputation is public, portable, and ranked against your peers.",
                  "Your record is yours. It travels with you to the marketplace.",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent)]" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ───────────────────────  Mock leaderboard  ─────────────────────── */}
        <section className="border-y bg-[var(--color-card)]">
          <div className="container-page py-14 sm:py-16">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-center">
              <div className="max-w-xl">
                <Badge variant="accent" className="mb-3">Leaderboard</Badge>
                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  Public ranking. Public reps.
                </h2>
                <p className="mt-3 text-[var(--color-muted)]">
                  Specialty leaderboards refresh weekly. Top finishers earn medals
                  that live on their public profile forever — and bubble to the top of
                  marketplace job matching.
                </p>
                <p className="mt-3 text-[var(--color-muted)]">
                  Below: a sample weekly leaderboard for the Habitational specialty.
                  Entirely fictional — but close to what you&apos;ll see at launch.
                </p>
              </div>

              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)]">
                <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-[var(--color-accent)]" />
                    <span className="font-semibold">Habitational · This week</span>
                  </div>
                  <span className="text-[var(--color-muted)]">Top 6 of 142</span>
                </div>
                <ol className="divide-y divide-[var(--color-border)]">
                  {[
                    { rank: 1, handle: "marisol_re",     score: 96, reps: 38, medal: "Gold" },
                    { rank: 2, handle: "cat_modeler",    score: 93, reps: 41, medal: "Silver" },
                    { rank: 3, handle: "the_adjuster",   score: 91, reps: 22, medal: "Bronze" },
                    { rank: 4, handle: "second_look",    score: 88, reps: 29, medal: null },
                    { rank: 5, handle: "delta_v",        score: 86, reps: 17, medal: null },
                    { rank: 6, handle: "you?",           score: 0,  reps: 0,  medal: null, you: true },
                  ].map(({ rank, handle, score, reps, medal, you }) => (
                    <li
                      key={rank}
                      className={`flex items-center justify-between px-5 py-3 text-sm ${
                        you ? "bg-[var(--color-accent)]/5" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                            rank === 1
                              ? "bg-[var(--color-accent)] text-[var(--color-accent-fg)]"
                              : "bg-[var(--color-border)]/60 text-[var(--color-fg)]"
                          }`}
                        >
                          {rank}
                        </span>
                        <div>
                          <div className={`font-medium ${you ? "italic text-[var(--color-accent)]" : ""}`}>
                            {you ? "you?" : `@${handle}`}
                          </div>
                          {!you && (
                            <div className="text-xs text-[var(--color-muted)]">
                              {reps} reps · score {score}
                            </div>
                          )}
                          {you && (
                            <div className="text-xs text-[var(--color-muted)]">
                              start your first rep — every score counts
                            </div>
                          )}
                        </div>
                      </div>
                      {medal && (
                        <Badge variant={medal === "Gold" ? "accent" : medal === "Silver" ? "primary" : "default"}>
                          {medal}
                        </Badge>
                      )}
                      {you && !medal && (
                        <Link href="#join">
                          <Button size="sm" variant="primary">
                            Get on the board
                          </Button>
                        </Link>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* ───────────────────────  Contests preview  ─────────────────────── */}
        <section className="container-page py-16" id="contests">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Badge variant="accent" className="mb-2">Contests</Badge>
              <h2 className="text-2xl font-semibold tracking-tight">Upcoming events</h2>
            </div>
            <p className="text-sm text-[var(--color-muted)]">Notified at launch when you join the waitlist</p>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Commercial Property Deep Dive", type: "48-hour open", level: "All levels", date: "Q3 2026", spots: "Open bracket" },
              { title: "Cyber Risk Fundamentals",       type: "Async self-paced", level: "Trainee",  date: "Q3 2026", spots: "Up to 250" },
              { title: "Specialty Lines Sprint",        type: "Live — 90 min",    level: "Intermediate+", date: "Q4 2026", spots: "Top 100 by reps" },
            ].map((contest) => (
              <Card key={contest.title}>
                <CardContent className="pt-5">
                  <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
                    <Clock className="h-3 w-3" />
                    {contest.type}
                    <span>·</span>
                    <Users className="h-3 w-3" />
                    {contest.level}
                  </div>
                  <div className="mt-2 font-semibold">{contest.title}</div>
                  <div className="mt-1 text-sm text-[var(--color-muted)]">
                    Planned {contest.date} · {contest.spots}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ───────────────────────  FAQ  ─────────────────────── */}
        <section className="border-t bg-[var(--color-card)]" id="faq">
          <div className="container-page py-14 sm:py-16">
            <div className="max-w-2xl">
              <Badge variant="accent" className="mb-3">FAQ</Badge>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Things people ask first.
              </h2>
            </div>

            <div className="mt-10 grid gap-4 lg:grid-cols-2">
              {[
                {
                  q: "Is the Dojo free?",
                  a: "Yes for the core training loop — practice cases, scoring, profile record. Premium contests and carrier-data tracks may carry a fee or be sponsored, but the path from zero to credentialed will always have a free lane.",
                },
                {
                  q: "Do I need an underwriting background to start?",
                  a: "No. The Dojo is built for the in-between — claims adjusters, premium auditors, subject matter experts, and career changers welcome. Difficulty 1–2 cases are designed for someone with insurance literacy but no UW seat time.",
                },
                {
                  q: "Who writes the cases?",
                  a: "Experienced DUG members at first, with peer review. The roadmap is to bring in carrier partners contributing anonymized real submissions — already structured because they export to reinsurers in bordereaux format.",
                },
                {
                  q: "How is scoring fair if there's no single right answer?",
                  a: "There rarely is one. Every case has a model rationale plus a community-distribution band. You get scored on reasoning quality, key-factor coverage, and price reasonableness — not whether you matched one number.",
                },
                {
                  q: "Will my employer see my Dojo record?",
                  a: "Only if it's on your public profile, which is your call. You can keep your handle anonymous from your real name, opt cases in or out, and surface only the medals you want shown.",
                },
                {
                  q: "Does this give me real underwriting authority?",
                  a: "No — the Dojo is training, not licensing. But your record is the proof of work carriers, brokers, and DUG marketplace posters can use to decide whether to give you a seat at the table for paid work.",
                },
              ].map(({ q, a }) => (
                <Card key={q}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-2">
                      <span className="text-[var(--color-accent)] font-mono text-sm">Q.</span>
                      <div className="font-semibold">{q}</div>
                    </div>
                    <div className="mt-3 flex items-start gap-2 text-sm text-[var(--color-muted)]">
                      <span className="text-[var(--color-muted)] font-mono text-sm">A.</span>
                      <p>{a}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ───────────────────────  CTA + Waitlist  ─────────────────────── */}
        <section className="container-page py-12 sm:py-20" id="join">
          <div className="overflow-hidden rounded-2xl bg-[var(--color-accent)] text-white">
            <div className="grid gap-8 px-6 py-10 sm:px-12 sm:py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)] lg:items-center lg:gap-12">
              <div>
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                  The reps are coming. Get in early.
                </h2>
                <p className="mt-3 max-w-xl text-sm sm:text-base text-white/80">
                  Join the waitlist and you&apos;ll be first into the Dojo when it opens.
                  In the meantime, your DUG profile starts building from day one — community
                  reputation, marketplace activity, the whole thing.
                </p>

                <ul className="mt-6 grid max-w-lg gap-2.5 text-sm text-white/90">
                  {[
                    "Early access invite when the Dojo opens",
                    "First crack at launch contests + medals",
                    "Optional spot in the founding-100 cohort",
                  ].map((line) => (
                    <li key={line} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      {line}
                    </li>
                  ))}
                </ul>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link href="/community">
                    <Button
                      size="lg"
                      variant="secondary"
                      className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                    >
                      Go to Community
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button
                      size="lg"
                      className="bg-white text-[var(--color-accent)] hover:bg-white/90"
                    >
                      Create your DUG profile
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="lg:pl-2">
                <div className="rounded-2xl bg-white/95 p-1 shadow-lg">
                  <div className="rounded-xl bg-[var(--color-card)] p-5">
                    <div className="text-sm font-semibold text-[var(--color-fg)]">
                      Join the Dojo waitlist
                    </div>
                    <p className="mt-1 text-xs text-[var(--color-muted)]">
                      One email when it opens. That&apos;s it.
                    </p>
                    <div className="mt-4">
                      <WaitlistForm variant="card" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
      <SiteFooter />
    </>
  );
}
