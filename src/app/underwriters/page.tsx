import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { SPECIALTIES_BY_SLUG } from "@/lib/specialties";
import { Star, MapPin, CheckCircle } from "lucide-react";

export const metadata = { title: "Underwriters" };

// Cache for 60 seconds — underwriter profiles change infrequently.
export const revalidate = 60;

type SearchParams = Promise<{ specialty?: string }>;

export default async function UnderwritersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  // If a specialty filter is set, look up profile_ids first.
  let allowedIds: string[] | null = null;
  if (params.specialty) {
    const { data } = await supabase
      .from("profile_specialties")
      .select("profile_id")
      .eq("specialty_slug", params.specialty);
    allowedIds = (data ?? []).map((r) => r.profile_id);
  }

  let query = supabase
    .from("profiles")
    .select("*, profile_specialties(specialty_slug)")
    .in("role", ["underwriter", "both"])
    .order("rating", { ascending: false })
    .order("completed_job_count", { ascending: false })
    .limit(60);

  if (allowedIds) {
    if (allowedIds.length === 0) {
      query = query.eq("id", "00000000-0000-0000-0000-000000000000"); // force empty
    } else {
      query = query.in("id", allowedIds);
    }
  }

  const { data: profiles } = await query;

  return (
    <>
      <SiteHeader />
      <main className="container-page py-10">
        <h1 className="text-3xl font-semibold tracking-tight">Underwriters</h1>
        <p className="mt-1 text-[var(--color-muted)]">
          Browse the network. Filter by specialty.
        </p>

        {params.specialty && (
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="text-[var(--color-muted)]">Filtered:</span>
            <Badge variant="primary">
              {SPECIALTIES_BY_SLUG[params.specialty]?.label ?? params.specialty}
            </Badge>
            <Link
              href="/underwriters"
              className="text-xs text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:underline"
            >
              Clear
            </Link>
          </div>
        )}

        <div className="mt-8 grid gap-3 md:grid-cols-2 md:grid-rows-[masonry]" style={{ alignItems: "stretch" }}>
          {(profiles ?? []).map((p) => {
            const allTags = (p.profile_specialties ?? []).map((s) => s.specialty_slug);
            const visibleTags = allTags.slice(0, 2);
            const overflow = allTags.length - visibleTags.length;
            return (
              <Link
                key={p.id}
                href={`/u/${p.handle}`}
                className="block group h-full"
              >
                <Card className="transition-shadow group-hover:shadow-md h-full">
                  <CardContent className="pt-5 pb-5 h-full">
                    <div className="flex items-start gap-4 h-full">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-lg font-bold text-[var(--color-primary-fg)]">
                        {p.display_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1 flex flex-col">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold leading-tight group-hover:text-[var(--color-primary)]">
                            {p.display_name}
                          </h3>
                          {p.is_verified && (
                            <CheckCircle className="h-4 w-4 text-[var(--color-success)]" />
                          )}
                        </div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-[var(--color-muted)]">
                          <span>@{p.handle}</span>
                          {(p.location_city || p.location_state) && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {[p.location_city, p.location_state]
                                .filter(Boolean)
                                .join(", ")}
                            </span>
                          )}
                          {p.years_experience != null && (
                            <span>{p.years_experience} yrs</span>
                          )}
                        </div>
                        {/* Bio: always occupies 2 lines worth of space */}
                        <p className="mt-2 line-clamp-2 text-sm text-[var(--color-fg)]/80 min-h-[2.5rem]">
                          {p.bio ?? ""}
                        </p>
                        {/* Specialty tags: always 1 row, max 2 shown + overflow pill */}
                        <div className="mt-2 flex items-center gap-1.5 flex-nowrap overflow-hidden">
                          {visibleTags.length > 0 ? (
                            <>
                              {visibleTags.map((slug) => (
                                <Badge key={slug} variant="default" className="shrink-0">
                                  {SPECIALTIES_BY_SLUG[slug]?.label ?? slug}
                                </Badge>
                              ))}
                              {overflow > 0 && (
                                <Badge variant="default" className="shrink-0 text-[var(--color-muted)]">
                                  +{overflow} more →
                                </Badge>
                              )}
                            </>
                          ) : (
                            <span className="text-xs text-[var(--color-muted)]">No specialties listed</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="inline-flex items-center gap-1 text-sm font-semibold">
                          <Star className="h-4 w-4 text-[var(--color-accent)]" />
                          {p.rating ? Number(p.rating).toFixed(2) : "—"}
                        </div>
                        <div className="text-xs text-[var(--color-muted)]">
                          {p.rating_count} reviews
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
