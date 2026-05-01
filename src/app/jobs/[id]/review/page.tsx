import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { ReviewForm } from "./review-form";

export const metadata = { title: "Review submission" };

type PageProps = { params: Promise<{ id: string }> };

const REC_LABEL: Record<string, string> = {
  approve: "Approve / bind",
  decline: "Decline",
  quote_with_modifications: "Quote with modifications",
  needs_more_info: "Need more info",
};

export default async function ReviewPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/jobs/${id}/review`);

  const { data: job } = await supabase
    .from("jobs")
    .select(
      `id, title, poster_id, claimer:profiles!jobs_claimed_by_fkey(handle, display_name)`,
    )
    .eq("id", id)
    .maybeSingle();
  if (!job) notFound();
  if (job.poster_id !== user.id) redirect(`/jobs/${id}`);

  const { data: sub } = await supabase
    .from("submissions")
    .select("*")
    .eq("job_id", id)
    .maybeSingle();
  if (!sub) {
    return (
      <>
        <SiteHeader />
        <main className="container-page py-10">
          <div className="mx-auto max-w-2xl">
            <Link
              href={`/jobs/${id}`}
              className="text-sm text-[var(--color-muted)]"
            >
              ← Back
            </Link>
            <h1 className="mt-3 text-2xl font-semibold">No submission yet.</h1>
            <p className="mt-1 text-[var(--color-muted)]">
              Once your underwriter submits their analysis, you can rate it
              here.
            </p>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="container-page py-10">
        <div className="mx-auto max-w-3xl">
          <Link
            href={`/jobs/${id}`}
            className="text-sm text-[var(--color-muted)] hover:text-[var(--color-primary)]"
          >
            ← Back to job
          </Link>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Review submission
          </h1>
          <p className="mt-1 text-[var(--color-muted)]">
            For: <span className="font-medium text-[var(--color-fg)]">{job.title}</span>
            {job.claimer && (
              <>
                {" — by "}
                <Link
                  href={`/u/${job.claimer.handle}`}
                  className="font-medium hover:text-[var(--color-primary)] hover:underline"
                >
                  {job.claimer.display_name}
                </Link>
              </>
            )}
          </p>

          {/* Submission read-only */}
          <Card className="mt-6">
            <CardContent className="pt-6 space-y-4">
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge variant="primary">
                  {REC_LABEL[sub.recommendation] ?? sub.recommendation}
                </Badge>
                <Badge variant="outline">
                  Confidence {sub.confidence}/5
                </Badge>
                {sub.suggested_premium_cents != null && (
                  <Badge variant="default">
                    Suggested ${Math.round(sub.suggested_premium_cents / 100).toLocaleString()}
                  </Badge>
                )}
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                  Rationale
                </div>
                <p className="mt-2 whitespace-pre-line leading-relaxed text-[var(--color-fg)]">
                  {sub.rationale}
                </p>
              </div>
              {(sub.red_flags ?? []).length > 0 && (
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                    Red flags
                  </div>
                  <ul className="mt-2 list-disc pl-5 text-sm">
                    {sub.red_flags.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Review form */}
          <Card className="mt-6">
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold">Your rating</h2>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                Drives the underwriter&apos;s public credibility score.
              </p>
              <div className="mt-4">
                <ReviewForm jobId={id} />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
