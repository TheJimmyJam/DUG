"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  ArrowUpDown,
  Clock,
  ChevronRight,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SPECIALTIES_BY_SLUG } from "@/lib/specialties";

export type BoardCase = {
  id: string;
  code: string;
  slug: string;
  title: string;
  summary: string;
  primary_specialty: string;
  additional_specialties: string[];
  difficulty: number;
  time_limit_minutes: number | null;
  created_at: string;
};

type SortKey = "newest" | "difficulty_asc" | "difficulty_desc";

const SORTS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "difficulty_asc", label: "Difficulty (easy → hard)" },
  { value: "difficulty_desc", label: "Difficulty (hard → easy)" },
];

function compareCases(a: BoardCase, b: BoardCase, key: SortKey): number {
  switch (key) {
    case "newest":
      return b.code.localeCompare(a.code);
    case "difficulty_asc":
      return a.difficulty - b.difficulty || b.code.localeCompare(a.code);
    case "difficulty_desc":
      return b.difficulty - a.difficulty || b.code.localeCompare(a.code);
    default:
      return 0;
  }
}

const DIFFICULTY_LABEL: Record<number, string> = {
  1: "1 / 5 — easy",
  2: "2 / 5",
  3: "3 / 5",
  4: "4 / 5",
  5: "5 / 5 — expert",
};

const DIFFICULTY_VARIANT: Record<number, "default" | "primary" | "warning" | "accent"> = {
  1: "default",
  2: "default",
  3: "primary",
  4: "warning",
  5: "accent",
};

export function CasesBoard({ cases }: { cases: BoardCase[] }) {
  const [query, setQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<number | null>(null);
  const [sort, setSort] = useState<SortKey>("newest");

  // Distinct specialties that have at least one case, sorted by case count desc.
  const specialtyOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of cases) {
      counts.set(c.primary_specialty, (counts.get(c.primary_specialty) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([slug, n]) => ({
        slug,
        label: SPECIALTIES_BY_SLUG[slug]?.label ?? slug,
        count: n,
      }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }, [cases]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cases
      .filter((c) => {
        if (selectedSpecialty && c.primary_specialty !== selectedSpecialty) return false;
        if (selectedDifficulty && c.difficulty !== selectedDifficulty) return false;
        if (!q) return true;
        const hay = `${c.title} ${c.summary} ${c.code} ${
          SPECIALTIES_BY_SLUG[c.primary_specialty]?.label ?? ""
        }`.toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => compareCases(a, b, sort));
  }, [cases, query, selectedSpecialty, selectedDifficulty, sort]);

  const anyFilter = !!selectedSpecialty || !!selectedDifficulty || query.length > 0;

  return (
    <>
      {/* Search + sort */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, summary, code…"
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-[var(--color-muted)]" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Specialty + difficulty filter strip */}
      <div className="mt-4 flex flex-col gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-3">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
            <Filter className="h-3.5 w-3.5" />
            Line of business
          </div>
          <div className="flex flex-wrap gap-1.5">
            <FilterChip
              active={selectedSpecialty === null}
              onClick={() => setSelectedSpecialty(null)}
            >
              All ({cases.length})
            </FilterChip>
            {specialtyOptions.map((s) => (
              <FilterChip
                key={s.slug}
                active={selectedSpecialty === s.slug}
                onClick={() =>
                  setSelectedSpecialty(selectedSpecialty === s.slug ? null : s.slug)
                }
              >
                {s.label} ({s.count})
              </FilterChip>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
            Difficulty
          </div>
          <div className="flex flex-wrap gap-1.5">
            <FilterChip
              active={selectedDifficulty === null}
              onClick={() => setSelectedDifficulty(null)}
            >
              Any
            </FilterChip>
            {[1, 2, 3, 4, 5].map((d) => (
              <FilterChip
                key={d}
                active={selectedDifficulty === d}
                onClick={() =>
                  setSelectedDifficulty(selectedDifficulty === d ? null : d)
                }
              >
                {d} / 5
              </FilterChip>
            ))}
          </div>
        </div>
        {anyFilter && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSelectedSpecialty(null);
                setSelectedDifficulty(null);
              }}
              className="flex items-center gap-1 text-xs text-[var(--color-muted)] hover:text-[var(--color-fg)]"
            >
              <X className="h-3 w-3" />
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Count */}
      <div className="mt-4 text-xs text-[var(--color-muted)]">
        {filtered.length === cases.length
          ? `${cases.length} case${cases.length === 1 ? "" : "s"}`
          : `${filtered.length} of ${cases.length} cases`}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-card)] p-10 text-center">
          <p className="text-[var(--color-muted)]">No cases match those filters.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <Link
              key={c.id}
              href={`/dojo/cases/${c.slug}`}
              className="group block"
            >
              <Card className="h-full transition hover:border-[var(--color-accent)] hover:shadow-md">
                <CardContent className="flex h-full flex-col pt-5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-[var(--color-muted)]">{c.code}</span>
                    <Badge variant={DIFFICULTY_VARIANT[c.difficulty] ?? "default"}>
                      {DIFFICULTY_LABEL[c.difficulty] ?? `${c.difficulty} / 5`}
                    </Badge>
                  </div>

                  <h3 className="mt-3 font-semibold leading-snug group-hover:text-[var(--color-accent)]">
                    {c.title}
                  </h3>

                  <p className="mt-1.5 line-clamp-3 text-sm text-[var(--color-muted)]">
                    {c.summary}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    <Badge variant="primary">
                      {SPECIALTIES_BY_SLUG[c.primary_specialty]?.label ?? c.primary_specialty}
                    </Badge>
                    {c.additional_specialties.slice(0, 2).map((slug) => (
                      <Badge key={slug} variant="default">
                        {SPECIALTIES_BY_SLUG[slug]?.label ?? slug}
                      </Badge>
                    ))}
                    {c.additional_specialties.length > 2 && (
                      <Badge variant="default">
                        +{c.additional_specialties.length - 2}
                      </Badge>
                    )}
                  </div>

                  <div className="mt-auto flex items-center justify-between border-t border-[var(--color-border)] pt-3 text-xs text-[var(--color-muted)]">
                    {c.time_limit_minutes ? (
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {c.time_limit_minutes} min
                      </span>
                    ) : (
                      <span />
                    )}
                    <span className="flex items-center gap-1 font-semibold text-[var(--color-accent)]">
                      Open case
                      <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-full bg-[var(--color-accent)] px-3 py-1 text-xs font-medium text-[var(--color-accent-fg)]"
          : "rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-1 text-xs text-[var(--color-muted)] hover:border-[var(--color-accent)]/40 hover:text-[var(--color-fg)]"
      }
    >
      {children}
    </button>
  );
}

