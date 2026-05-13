import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { SubmitForm } from "./submit-form";
import { ArrowRight, Clock, Lock, AlertCircle } from "lucide-react";

export const metadata = {
  title: "Practice case — DUG Dojo",
  description: "Submit your underwriting analysis. Get scored against the model rationale and the community.",
};

type PageProps = { params: Promise<{ slug: string }> };

type Packet = Record<string, string>;

export default async function DojoCasePage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // Public case fields only — answer-key columns stay server-side until result.
  const { data: dojoCase } = await supabase
    .from("dojo_cases")
    .select(
      "id, code, slug, title, summary, scenario, primary_specialty, additional_specialties, difficulty, time_limit_minutes, packet, red_flag_options, status, closes_at",
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!dojoCase) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If they've already submitted, jump to their result.
  if (user) {
    const { data: existing } = await supabase
      .from("dojo_submissions")
      .select("id")
      .eq("case_id", dojoCase.id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (existing) {
      redirect(`/dojo/cases/${slug}/result`);
    }
  }

  const packet = (dojoCase.packet ?? {}) as Packet;

  return (
    <>
      <SiteHeader />
      <main>
        {/* Header */}
        <section className="border-b bg-[var(--color-card)]">
          <div className="container-page py-8 sm:py-10">
            <div className="mx-auto max-w-3xl">
              <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
                <Link href="/dojo" className="hover:text-[var(--color-fg)]">The Dojo</Link>
                <span>·</span>
                <Lock className="h-3 w-3" />
                <span>{dojoCase.code}</span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant="primary">{dojoCase.primary_specialty}</Badge>
                {(dojoCase.additional_specialties ?? []).map((s) => (
                  <Badge key={s} variant="default">{s}</Badge>
                ))}
                <Badge variant="warning">Difficulty {dojoCase.difficulty} / 5</Badge>
                {dojoCase.time_limit_minutes && (
                  <span className="inline-flex items-center gap-1 text-xs text-[var(--color-muted)]">
                    <Clock className="h-3.5 w-3.5" />
                    Suggested {dojoCase.time_limit_minutes} min
                  </span>
                )}
              </div>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                {dojoCase.title}
              </h1>
              <p className="mt-2 text-[var(--color-muted)]">{dojoCase.summary}</p>
            </div>
          </div>
        </section>

        <section className="container-page py-10">
          <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
            {/* Scenario + packet */}
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-lg font-semibold tracking-tight">Submission packet</h2>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">
                    The structured facts the broker put in front of you. Treat it as the cover sheet,
                    not the whole picture.
                  </p>
                  <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                    {Object.entries(packet).map(([k, v]) => (
                      <div
                        key={k}
                        className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm"
                      >
                        <dt className="text-xs uppercase tracking-wider text-[var(--color-muted)]">
                          {k}
                        </dt>
                        <dd className="mt-0.5 font-semibold">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-lg font-semibold tracking-tight">Scenario</h2>
                  <div className="mt-3 space-y-3 whitespace-pre-line text-sm leading-relaxed text-[var(--color-muted)]">
                    {dojoCase.scenario}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Submit form (auth-gated) */}
            <aside className="lg:sticky lg:top-20 lg:self-start">
              {user ? (
                <SubmitForm
                  caseId={dojoCase.id}
                  caseSlug={dojoCase.slug}
                  redFlagOptions={dojoCase.red_flag_options ?? []}
                />
              ) : (
                <Card className="border-[var(--color-accent)]/40">
                  <CardContent className="pt-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-accent)]/10">
                      <AlertCircle className="h-5 w-5 text-[var(--color-accent)]" />
                    </div>
                    <h3 className="mt-4 font-semibold">Sign in to take this rep.</h3>
                    <p className="mt-2 text-sm text-[var(--color-muted)]">
                      Your Dojo record builds on your public DUG profile. We need an account
                      so the score has somewhere to live.
                    </p>
                    <div className="mt-5 flex flex-col gap-2">
                      <Link href={`/login?next=/dojo/cases/${slug}`}>
                        <Button variant="primary" className="w-full">
                          Log in
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/signup?next=/dojo/cases/${slug}`}>
                        <Button variant="secondary" className="w-full">
                          Create a profile
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}
            </aside>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
