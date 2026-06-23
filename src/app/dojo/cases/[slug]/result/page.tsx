import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { ArrowRight, CheckCircle, XCircle, Trophy, Lock, Eye, EyeOff } from "lucide-react";

export const metadata = {
  title: "Your scoring — DUG Dojo",
  description: "How your analysis stacked up against the model rationale and the community.",
};

type PageProps = { params: Promise<{ slug: string }> };

const RECOMMENDATION_LABEL: Record<string, string> = {
  approve: "Approve / bind",
  decline: "Decline",
  quote_with_modifications: "Quote w/ modifications",
  needs_more_info: "Need more info",
};

function fmtMoney(cents: number): string {
  const dollars = Number(cents) / 100;
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(2)}M`;
  if (dollars >= 1_000) return `$${(dollars / 1_000).toFixed(0)}K`;
  return `$${dollars.toLocaleString("en-US")}`;
}

export default async function DojoResultPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/dojo/cases/${slug}/result`);

  // Public case fields
  const { data: dojoCase } = await supabase
    .from("dojo_cases")
    .select("id, code, slug, title, summary, primary_specialty, difficulty")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!dojoCase) notFound();

  const { data: submission } = await supabase
    .from("dojo_submissions")
    .select(
      "id, rationale, premium_cents, recommendation, red_flags, confidence, score, premium_score, factors_score, matched_factors, missed_factors, created_at, status, visibility, bound_at",
    )
    .eq("case_id", dojoCase.id)
    .eq("user_id", user.id)
    .maybeSingle();

  // Only Bound submissions have a result. Draft = back to the case page.
  if (!submission || submission.status !== "bound") {
    redirect(`/dojo/cases/${slug}`);
  }

  // Bound rows always have these populated (CHECK constraint at DB level),
  // but the DB types reflect column-level nullability. Coerce to safe values
  // for rendering.
  const score = submission.score ?? 0;
  const premiumScore = submission.premium_score ?? 0;
  const factorsScore = submission.factors_score ?? 0;
  const matchedFactors = submission.matched_factors ?? [];
  const missedFactors = submission.missed_factors ?? [];

  // Now safe to fetch the answer key — they've submitted.
  const service = createServiceClient();
  const { data: answerKey } = await service
    .from("dojo_cases")
    .select(
      "model_rationale, model_premium_low_cents, model_premium_high_cents, model_recommendation, model_red_flags",
    )
    .eq("id", dojoCase.id)
    .single();

  // Community percentile — only Bound submissions count (drafts aren't scored).
  const { data: peerScores } = await service
    .from("dojo_submissions")
    .select("score")
    .eq("case_id", dojoCase.id)
    .eq("status", "bound")
    .not("score", "is", null);

  const userScore = score;
  const allScores = (peerScores ?? [])
    .map((r) => r.score)
    .filter((s): s is number => s !== null);
  const total = allScores.length;
  const beat = allScores.filter((s) => s < userScore).length;
  const percentile = total > 0 ? Math.round((beat / total) * 100) : 0;

  const userPremiumIn =
    answerKey &&
    Number(submission.premium_cents) >= Number(answerKey.model_premium_low_cents) &&
    Number(submission.premium_cents) <= Number(answerKey.model_premium_high_cents);

  const correctRedFlags = new Set(answerKey?.model_red_flags ?? []);
  const userRedFlags = new Set(submission.red_flags);
  const hitFlags = [...userRedFlags].filter((f) => correctRedFlags.has(f));
  const missedFlags = [...correctRedFlags].filter((f) => !userRedFlags.has(f));
  const falsePositives = [...userRedFlags].filter((f) => !correctRedFlags.has(f));

  return (
    <>
      <SiteHeader />
      <main>
        {/* Score banner */}
        <section className="border-b bg-gradient-to-b from-[var(--color-card)] to-[var(--color-bg)]">
          <div className="container-page py-8 sm:py-12">
            <div className="mx-auto max-w-3xl">
              <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
                <Link href="/dojo" className="hover:text-[var(--color-fg)]">The Dojo</Link>
                <span>·</span>
                <span>{dojoCase.code}</span>
                <span>·</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-fg)]/5 px-2 py-0.5 font-medium text-[var(--color-fg)]">
                  <Lock className="h-3 w-3" />
                  Bound
                </span>
                <span className="inline-flex items-center gap-1 text-[var(--color-muted)]">
                  {submission.visibility === "network" ? (
                    <>
                      <Eye className="h-3 w-3" />
                      Network
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-3 w-3" />
                      Private
                    </>
                  )}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                    {dojoCase.title}
                  </h1>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">
                    Your read, scored.
                  </p>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] px-5 py-3">
                  <Trophy className="h-6 w-6 text-[var(--color-accent)]" />
                  <div>
                    <div className="text-3xl font-semibold tracking-tight">
                      {score}
                      <span className="text-base text-[var(--color-muted)]"> / 100</span>
                    </div>
                    {total > 1 && (
                      <div className="text-xs text-[var(--color-muted)]">
                        Beat {percentile}% of {total} submissions
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container-page py-10">
          <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            {/* Left: breakdown */}
            <div className="space-y-6">
              {/* Premium */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold tracking-tight">Premium read</h2>
                    <Badge variant={userPremiumIn ? "success" : "warning"}>
                      {premiumScore} / 50
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-[var(--color-muted)]">
                    Your suggestion vs. the model band.
                  </p>
                  <div className="mt-5">
                    <div className="flex justify-between text-xs text-[var(--color-muted)]">
                      <span>Model low</span>
                      <span>Your number</span>
                      <span>Model high</span>
                    </div>
                    <div className="mt-1 grid grid-cols-3 gap-2 text-center text-sm">
                      <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] py-2 font-semibold">
                        {answerKey ? fmtMoney(Number(answerKey.model_premium_low_cents)) : "—"}
                      </div>
                      <div
                        className={`rounded-md py-2 font-semibold ${
                          userPremiumIn
                            ? "bg-[var(--color-success)]/15 text-[var(--color-success)]"
                            : "bg-[var(--color-warning)]/15 text-[var(--color-warning)]"
                        }`}
                      >
                        {fmtMoney(Number(submission.premium_cents))}
                      </div>
                      <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] py-2 font-semibold">
                        {answerKey ? fmtMoney(Number(answerKey.model_premium_high_cents)) : "—"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Factors covered */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold tracking-tight">Factor coverage</h2>
                    <Badge variant={factorsScore >= 35 ? "success" : "warning"}>
                      {factorsScore} / 50
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-[var(--color-muted)]">
                    The model rationale tracks {matchedFactors.length + missedFactors.length} key
                    factors. Yours covered{" "}
                    <span className="font-semibold text-[var(--color-fg)]">
                      {matchedFactors.length}
                    </span>
                    .
                  </p>

                  {matchedFactors.length > 0 && (
                    <div className="mt-5">
                      <div className="text-xs uppercase tracking-wider text-[var(--color-muted)]">
                        You covered
                      </div>
                      <ul className="mt-2 space-y-1.5 text-sm">
                        {matchedFactors.map((f) => (
                          <li key={f} className="flex items-start gap-2">
                            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-success)]" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {missedFactors.length > 0 && (
                    <div className="mt-5">
                      <div className="text-xs uppercase tracking-wider text-[var(--color-muted)]">
                        You missed
                      </div>
                      <ul className="mt-2 space-y-1.5 text-sm">
                        {missedFactors.map((f) => (
                          <li key={f} className="flex items-start gap-2">
                            <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-danger)]" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Red flags */}
              {(answerKey?.model_red_flags?.length ?? 0) > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-lg font-semibold tracking-tight">Red flag picks</h2>
                    <p className="mt-2 text-sm text-[var(--color-muted)]">
                      The model rationale calls these out as material risks.
                    </p>
                    <ul className="mt-4 space-y-2 text-sm">
                      {[...correctRedFlags].map((f) => {
                        const youGotIt = userRedFlags.has(f);
                        return (
                          <li
                            key={f}
                            className="flex items-start gap-2"
                          >
                            {youGotIt ? (
                              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-success)]" />
                            ) : (
                              <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-muted)]" />
                            )}
                            <span className={youGotIt ? "" : "text-[var(--color-muted)]"}>
                              {f}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                    {falsePositives.length > 0 && (
                      <p className="mt-4 text-xs text-[var(--color-muted)]">
                        Picked but not on the model list:{" "}
                        <span className="italic">{falsePositives.join(", ")}</span>. Doesn&apos;t cost you points
                        on this rep — defensible reads vary.
                      </p>
                    )}
                    {missedFlags.length === 0 && hitFlags.length > 0 && (
                      <p className="mt-3 text-xs text-[var(--color-success)]">
                        Clean sweep on red flags.
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right: model rationale + your submission */}
            <aside className="space-y-6">
              <Card className="border-[var(--color-accent)]/30">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Badge variant="accent">Model rationale</Badge>
                    {answerKey && (
                      <Badge variant="default">
                        {RECOMMENDATION_LABEL[answerKey.model_recommendation] ?? answerKey.model_recommendation}
                      </Badge>
                    )}
                  </div>
                  <h3 className="mt-3 text-sm font-semibold">How the case-author would write this up.</h3>
                  <div className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[var(--color-muted)]">
                    {answerKey?.model_rationale ?? "—"}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-sm font-semibold">Your submission</h3>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <Badge variant="primary">
                      {RECOMMENDATION_LABEL[submission.recommendation]}
                    </Badge>
                    <Badge variant="default">{fmtMoney(Number(submission.premium_cents))}</Badge>
                    <Badge variant="default">Confidence {submission.confidence}/5</Badge>
                  </div>
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[var(--color-muted)]">
                    {submission.rationale}
                  </p>
                </CardContent>
              </Card>

              <div className="flex flex-col gap-2">
                <Link href="/dojo">
                  <Button variant="primary" className="w-full">
                    Back to the Dojo
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href={`/u/${user.user_metadata?.handle ?? ""}`}>
                  <Button variant="secondary" className="w-full">
                    View your public profile
                  </Button>
                </Link>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
