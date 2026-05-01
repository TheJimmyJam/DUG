"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, X, MapPin, CheckCircle, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SPECIALTIES, SPECIALTIES_BY_SLUG } from "@/lib/specialties";
import { cn } from "@/lib/utils";

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

const GROUP_ORDER = ["Property", "Liability", "Specialty", "Emerging", "Personal", "Other"];

export function UnderwritersBoard({ profiles }: { profiles: BoardProfile[] }) {
  const [query, setQuery] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<Set<string>>(new Set());

  // Only show specialty chips that at least one underwriter has
  const availableSpecialties = useMemo(() => {
    const slugsWithProfiles = new Set(
      profiles.flatMap((p) => p.profile_specialties.map((s) => s.specialty_slug))
    );
    return SPECIALTIES.filter((s) => slugsWithProfiles.has(s.slug)).sort((a, b) => {
      const gi = GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group);
      return gi !== 0 ? gi : a.label.localeCompare(b.label);
    });
  }, [profiles]);

  const specialtyGroups = useMemo(() => {
    const map = new Map<string, typeof availableSpecialties>();
    for (const s of availableSpecialties) {
      const arr = map.get(s.group) ?? [];
      arr.push(s);
      map.set(s.group, arr);
    }
    return [...map.entries()];
  }, [availableSpecialties]);

  function toggleSpecialty(slug: string) {
    setSelectedSpecialties((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return profiles.filter((p) => {
      // Specialty filter
      if (selectedSpecialties.size > 0) {
        const hasMatch = p.profile_specialties.some((s) =>
          selectedSpecialties.has(s.specialty_slug)
        );
        if (!hasMatch) return false;
      }

      // Text search
      if (q) {
        const slugLabels = p.profile_specialties
          .map((s) => SPECIALTIES_BY_SLUG[s.specialty_slug]?.label ?? "")
          .join(" ")
          .toLowerCase();
        const haystack = [
          p.display_name,
          p.handle,
          p.bio ?? "",
          p.location_city ?? "",
          p.location_state ?? "",
          slugLabels,
        ]
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
      {/* Search bar */}
      <div className="relative">
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

      {/* Specialty filter strip */}
      {availableSpecialties.length > 0 && (
        <div className="rounded-lg border bg-[var(--color-card)] px-4 py-3 space-y-3">
          {specialtyGroups.map(([group, specs]) => (
            <div key={group} className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="w-20 shrink-0 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                {group}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {specs.map((s) => {
                  const active = selectedSpecialties.has(s.slug);
                  return (
                    <button
                      key={s.slug}
                      type="button"
                      onClick={() => toggleSpecialty(s.slug)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-medium transition-all",
                        active
                          ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-fg)] shadow-sm"
                          : "border-[var(--color-border)] bg-transparent text-[var(--color-muted)] hover:border-[var(--color-primary)]/60 hover:text-[var(--color-fg)]"
                      )}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {selectedSpecialties.size > 0 && (
            <div className="flex items-center gap-2 border-t border-[var(--color-border)] pt-2">
              <span className="text-xs text-[var(--color-muted)]">
                {selectedSpecialties.size} selected
              </span>
              <button
                type="button"
                onClick={() => setSelectedSpecialties(new Set())}
                className="inline-flex items-center gap-1 text-xs text-[var(--color-muted)] underline-offset-2 hover:text-[var(--color-fg)] hover:underline"
              >
                <X className="h-3 w-3" />
                Clear
              </button>
            </div>
          )}
        </div>
      )}

      {/* Count + clear all */}
      <div className="flex items-center justify-between text-xs text-[var(--color-muted)]">
        <span>
          Showing {filtered.length} of {profiles.length} underwriters
        </span>
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
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Try removing some filters or clearing the search.
          </p>
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
                        {p.is_verified && (
                          <CheckCircle className="h-4 w-4 text-[var(--color-success)]" />
                        )}
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-[var(--color-muted)]">
                        <span>@{p.handle}</span>
                        {(p.location_city || p.location_state) && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {[p.location_city, p.location_state].filter(Boolean).join(", ")}
                          </span>
                        )}
                        {p.years_experience != null && (
                          <span>{p.years_experience} yrs</span>
                        )}
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
    </div>
  );
}
