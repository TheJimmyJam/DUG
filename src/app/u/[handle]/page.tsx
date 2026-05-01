import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { SPECIALTIES_BY_SLUG } from "@/lib/specialties";
import { formatRelativeTime } from "@/lib/utils";
import { Star, MapPin, CheckCircle, Briefcase } from "lucide-react";

type PageProps = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { handle } = await params;
  return { title: `@${handle}` };
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { handle } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("handle", handle)
    .maybeSingle();

  if (!profile) notFound();

  // Specialties + recent reviews + recent completed jobs (parallel)
  const [{ data: specialties }, { data: reviews }, { data: completedJobs }] =
    await Promise.all([
      supabase
        .from("profile_specialties")
        .select("specialty_slug")
        .eq("profile_id", profile.id),
      supabase
        .from("reviews")
        .select(
          `id, rating, feedback, created_at,
           job:jobs(id, title, primary_specialty),
           poster:profiles!reviews_poster_id_fkey(handle, display_name)`,
        )
        .eq("underwriter_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("jobs")
        .select("id, title, primary_specialty, completed_at")
        .eq("claimed_by", profile.id)
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
        .limit(10),
    ]);

  return (
    <>
      <SiteHeader />
      <main className="container-page py-10">
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* Left rail */}
          <aside className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-primary)] text-2xl font-bold text-[var(--color-primary-fg)]">
                    {profile.display_name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <h1 className="mt-4 text-center text-xl font-semibold">
                  {profile.display_name}
                </h1>
                <div className="mt-1 text-center text-sm text-[var(--color-muted)]">
                  @{profile.handle}
                </div>
                {profile.is_verified && (
                  <div className="mt-2 flex items-center justify-center gap-1 text-xs text-[var(--color-success)]">
                    <CheckCircle className="h-3 w-3" /> Verified
                  </div>
                )}

                <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="flex items-center justify-center gap-1 text-lg font-semibold">
                      <Star className="h-4 w-4 text-[var(--color-accent)]" />
                      {profile.rating ? Number(profile.rating).toFixed(2) : "—"}
                    </div>
                    <div className="text-xs text-[var(--color-muted)]">
                      {profile.rating_count} reviews
                    </div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold">
                      {profile.completed_job_count}
                    </div>
                    <div className="text-xs text-[var(--color-muted)]">
                      jobs done
                    </div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold">
                      {profile.years_experience ?? "—"}
                    </div>
                    <div className="text-xs text-[var(--color-muted)]">
                      yrs P&C
                    </div>
                  </div>
                </div>

                {(profile.location_city || profile.location_state) && (
                  <div className="mt-5 flex items-center justify-center gap-1 text-sm text-[var(--color-muted)]">
                    <MapPin className="h-4 w-4" />
                    {[profile.location_city, profile.location_state]
                      .filter(Boolean)
                      .join(", ")}
                  </div>
                )}
              </CardContent>
            </Card>

            {(specialties ?? []).length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                    Specialties
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {specialties!.map((s) => {
                      const meta = SPECIALTIES_BY_SLUG[s.specialty_slug];
                      return (
                        <Link
                          key={s.specialty_slug}
                          href={`/jobs?specialty=${s.specialty_slug}`}
                        >
                          <Badge variant="primary">
                            {meta?.label ?? s.specialty_slug}
                          </Badge>
                        </Link>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </aside>

          {/* Main column */}
          <div className="space-y-6">
            {profile.bio && (
              <Card>
                <CardContent className="pt-6">
                  <p className="leading-relaxed text-[var(--color-fg)] whitespace-pre-line">
                    {profile.bio}
                  </p>
                </CardContent>
              </Card>
            )}

            <section>
              <h2 className="text-lg font-semibold">Recent reviews</h2>
              {(reviews ?? []).length === 0 ? (
                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  No reviews yet. Reviews appear here once jobs are completed
                  and rated.
                </p>
              ) : (
                <div className="mt-3 grid gap-3">
                  {reviews!.map((r) => (
                    <Card key={r.id}>
                      <CardContent className="pt-5 pb-5">
                        <div className="flex items-center gap-2 text-sm">
                          <Star className="h-4 w-4 text-[var(--color-accent)]" />
                          <span className="font-semibold">
                            {Number(r.rating).toFixed(0)}/5
                          </span>
                          {r.poster && (
                            <span className="text-[var(--color-muted)]">
                              · by{" "}
                              <Link
                                href={`/u/${r.poster.handle}`}
                                className="hover:text-[var(--color-primary)] hover:underline"
                              >
                                {r.poster.display_name}
                              </Link>
                            </span>
                          )}
                          <span className="text-xs text-[var(--color-muted)]">
                            · {formatRelativeTime(r.created_at)}
                          </span>
                        </div>
                        {r.job && (
                          <Link
                            href={`/jobs/${r.job.id}`}
                            className="mt-1 block text-sm font-medium hover:text-[var(--color-primary)] hover:underline"
                          >
                            {r.job.title}
                          </Link>
                        )}
                        {r.feedback && (
                          <p className="mt-2 text-sm text-[var(--color-fg)] leading-relaxed">
                            {r.feedback}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="text-lg font-semibold">Completed work</h2>
              {(completedJobs ?? []).length === 0 ? (
                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  Nothing completed yet.
                </p>
              ) : (
                <div className="mt-3 grid gap-2">
                  {completedJobs!.map((j) => (
                    <Link key={j.id} href={`/jobs/${j.id}`}>
                      <Card className="transition-shadow hover:shadow-md">
                        <CardContent className="pt-4 pb-4">
                          <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
                            <Briefcase className="h-3 w-3" />
                            <Badge variant="primary">
                              {SPECIALTIES_BY_SLUG[j.primary_specialty]?.label ??
                                j.primary_specialty}
                            </Badge>
                          </div>
                          <div className="mt-2 font-medium">{j.title}</div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
