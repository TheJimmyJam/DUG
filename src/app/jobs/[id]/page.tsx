import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { SPECIALTIES_BY_SLUG } from "@/lib/specialties";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { ClaimJobButton } from "./claim-button";

type PageProps = { params: Promise<{ id: string }> };

const JOB_TYPE_LABEL: Record<string, string> = {
  renewal_review: "Renewal review",
  second_look: "Second look",
  new_business_advisory: "New business advisory",
  audit: "Audit",
  program_design: "Program design",
  other: "Other",
};

export default async function JobDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: job }, { data: { user } }] = await Promise.all([
    supabase
      .from("jobs")
      .select(
        `*, poster:profiles!jobs_poster_id_fkey(handle, display_name, is_verified), claimer:profiles!jobs_claimed_by_fkey(handle, display_name, rating)`,
      )
      .eq("id", id)
      .maybeSingle(),
    supabase.auth.getUser(),
  ]);

  if (!job) notFound();

  const spec = SPECIALTIES_BY_SLUG[job.primary_specialty];
  const isPoster = user?.id === job.poster_id;
  const isClaimer = user?.id === job.claimed_by;
  const canClaim = job.status === "open" && !isPoster && Boolean(user);

  const budgetLabel =
    job.budget_type === "volunteer"
      ? "Portfolio (no pay)"
      : job.budget_cents != null
        ? `${formatCurrency(job.budget_cents)} ${job.budget_type === "hourly" ? "/ hr" : "flat"}`
        : "Negotiable";

  return (
    <>
      <SiteHeader />
      <main className="container-page py-10">
        <Link
          href="/jobs"
          className="text-sm text-[var(--color-muted)] hover:text-[var(--color-primary)]"
        >
          ← Back to jobs
        </Link>

        <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            {/* Title block */}
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <Badge variant="primary">
                  {spec?.label ?? job.primary_specialty}
                </Badge>
                <Badge variant="outline">
                  {JOB_TYPE_LABEL[job.job_type] ?? job.job_type}
                </Badge>
                <Badge
                  variant={
                    job.status === "open"
                      ? "success"
                      : job.status === "claimed"
                        ? "warning"
                        : "primary"
                  }
                >
                  {job.status}
                </Badge>
              </div>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                {job.title}
              </h1>
              <p className="mt-2 text-[var(--color-muted)]">
                Posted {formatRelativeTime(job.created_at)} by{" "}
                {job.poster ? (
                  <Link
                    href={`/u/${job.poster.handle}`}
                    className="font-medium text-[var(--color-fg)] hover:text-[var(--color-primary)] hover:underline"
                  >
                    {job.poster.display_name}
                  </Link>
                ) : (
                  "an unknown user"
                )}
                {job.poster?.is_verified && (
                  <span className="ml-1 text-xs text-[var(--color-success)]">
                    · verified
                  </span>
                )}
              </p>
            </div>

            {/* Description */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                  Risk description
                </h2>
                <p className="mt-3 whitespace-pre-line leading-relaxed text-[var(--color-fg)]">
                  {job.description}
                </p>
              </CardContent>
            </Card>

            {(job.additional_specialties ?? []).length > 0 && (
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                  Also touches
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {job.additional_specialties.map((slug: string) => (
                    <Badge key={slug} variant="default">
                      {SPECIALTIES_BY_SLUG[slug]?.label ?? slug}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-4 order-first lg:order-last">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <div className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
                    Budget
                  </div>
                  <div className="mt-1 text-lg font-semibold">
                    {budgetLabel}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
                    Estimated effort
                  </div>
                  <div className="mt-1">
                    {job.estimated_hours
                      ? `~${job.estimated_hours} hours`
                      : "Open"}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
                    Difficulty
                  </div>
                  <div className="mt-1">{job.difficulty}/5</div>
                </div>
                {job.deadline_at && (
                  <div>
                    <div className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
                      Deadline
                    </div>
                    <div className="mt-1">
                      {new Date(job.deadline_at).toLocaleString()}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action / state card */}
            <Card>
              <CardContent className="pt-6">
                {!user && (
                  <>
                    <p className="text-sm text-[var(--color-muted)]">
                      Sign in to claim this job and submit an analysis.
                    </p>
                    <Link
                      href="/login"
                      className="mt-3 inline-block w-full"
                    >
                      <Button variant="primary" className="w-full">
                        Log in to claim
                      </Button>
                    </Link>
                  </>
                )}

                {user && canClaim && <ClaimJobButton jobId={job.id} />}

                {isClaimer && (
                  <div className="space-y-3">
                    <Badge variant="success">You claimed this</Badge>
                    <Link
                      href={`/jobs/${job.id}/submit`}
                      className="block"
                    >
                      <Button variant="primary" className="w-full">
                        {job.status === "submitted"
                          ? "Edit submission"
                          : "Submit analysis"}
                      </Button>
                    </Link>
                  </div>
                )}

                {isPoster && job.claimer && (
                  <div className="space-y-2">
                    <div className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
                      Claimed by
                    </div>
                    <Link
                      href={`/u/${job.claimer.handle}`}
                      className="font-medium hover:text-[var(--color-primary)] hover:underline"
                    >
                      {job.claimer.display_name}
                    </Link>
                    {job.claimer.rating != null && (
                      <div className="text-xs text-[var(--color-muted)]">
                        Rating {Number(job.claimer.rating).toFixed(2)}
                      </div>
                    )}
                  </div>
                )}

                {isPoster && job.status === "submitted" && (
                  <Link
                    href={`/jobs/${job.id}/review`}
                    className="mt-3 block"
                  >
                    <Button variant="primary" className="w-full">
                      Review submission
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
