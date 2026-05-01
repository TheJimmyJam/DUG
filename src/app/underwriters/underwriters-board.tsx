"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, X, MapPin, CheckCircle, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SpecialtyFilter } from "@/components/specialty-filter";
import { SPECIALTIES_BY_SLUG } from "@/lib/specialties";

export type BoardProfile = {
  id: string;
  handle: string;
  display_name: string;
  bio: string | null;
  location_city: string | null;
  location_state: string | null;
  years_experience: number | null;
  rating: number | null;
  rating_count: number;
  is_verified: boolean;
  profile_specialties: { specialty_slug: string }[];
};

export function UnderwritersBoard({ profiles }: { profiles: BoardProfile[] }) {
  const [query, setQuery] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<Set<string>>(new Set());

  // Slugs that at least one underwriter actually has
  const availableSlugs = useMemo(
    () => [...new Set(profiles.flatMap((p) => p.profile_specialties.map((s) => s.specialty_slug)))],
    [profiles]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return profiles.filter((p) => {
      if (selectedSpecialties.size > 0) {
        const hasMatch = p.profile_specialties.some((s) => selectedSpecialties.has(s.specialty_slug));
        if (!hasMatch) return false;
      }
      if (q) {
        const slugLabels = p.profile_specialties
          .map((s) => SPECIALTIES_BY_SLUG[s.specialty_slug]?.label ?? "")
          .join(" ")
          .toLowerCase();
        const haystack = [p.display_name, p.handle, p.bio ?? "", p.location_city ?? "", p.location_state ?? "", slugLabels]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [profiles, query, selectedSpecialties]);

  const hasActiveFilters = selectedSpecialties.size > 0 || query.trim().length > 0;

  return (
    <div className="space-y-4">
      {/* Search + specialty filter row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, handle, specialty, location…"
            className="pl-9 pr-9"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[var(--color-muted)] hover:bg-[var(--color-border)]/50"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Specialty filter */}
      <SpecialtyFilter
        available={availableSlugs}
        selected={selectedSpecialties}
        onChange={setSelectedSpecialties}
      />

      {/* Count + clear all */}
      <div className="flex items-center justify-between text-xs text-[var(--color-muted)]">
        <span>Showing {filtered.length} of {profiles.length} underwriters</span>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => { setQuery(""); setSelectedSpecialties(new Set()); }}
            className="inline-flex items-center gap-1 hover:text-[var(--color-fg)] hover:underline underline-offset-2"
          >
            <X className="h-3 w-3" />
            Clear all filters
          </button>
        )}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="rounded-lg border bg-[var(--color-card)] px-6 py-10 text-center">
          <div className="text-base font-semibold">No underwriters match.</div>
          <p className="mt-1 text-sm text-[var(--color-muted)]">Try removing some filters or clearing the search.</p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => { setQuery(""); setSelectedSpecialties(new Set()); }}
              className="mt-3 text-sm text-[var(--color-primary)] hover:underline underline-offset-2"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Grid */}
      <div className="grid gap-3 md:grid-cols-2" style={{ alignItems: "stretch" }}>
        {filtered.map((p) => {
          const allTags = p.profile_specialties.map((s) => s.specialty_slug);
          const visibleTags = allTags.slice(0, 2);
          const overflow = allTags.length - visibleTags.length;

          return (
            <Link key={p.id} href={`/u/${p.handle}`} className="block group h-full">
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
                        {p.is_verified && <CheckCircle className="h-4 w-4 text-[var(--color-success)]" />}
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-[var(--color-muted)]">
                        <span>@{p.handle}</span>
                        {(p.location_city || p.location_state) && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {[p.location_city, p.location_state].filter(Boolean).join(", ")}
                          </span>
                        )}
                        {p.years_experience != null && <span>{p.years_experience} yrs</span>}
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-[var(--color-fg)]/80 min-h-[2.5rem]">
                        {p.bio ?? ""}
                      </p>
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
                      <div className="text-xs text-[var(--color-muted)]">{p.rating_count} reviews</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
