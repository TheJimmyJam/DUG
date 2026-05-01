"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  ChevronDown,
  ChevronRight,
  ArrowUpDown,
  Briefcase,
  Clock,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SpecialtyFilter } from "@/components/specialty-filter";
import { SPECIALTIES_BY_SLUG } from "@/lib/specialties";
import { cn, formatCurrency, formatRelativeTime } from "@/lib/utils";

export type BoardJob = {
  id: string;
  title: string;
  summary: string;
  description: string;
  primary_specialty: string;
  job_type: string;
  difficulty: number;
  budget_cents: number | null;
  budget_type: "hourly" | "flat" | "volunteer";
  status: string;
  estimated_hours: number | null;
  created_at: string;
};

type SortKey =
  | "newest"
  | "oldest"
  | "budget_desc"
  | "budget_asc"
  | "difficulty_desc";

const SORTS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "budget_desc", label: "Budget (high → low)" },
  { value: "budget_asc", label: "Budget (low → high)" },
  { value: "difficulty_desc", label: "Difficulty (high → low)" },
];

const JOB_TYPE_LABEL: Record<string, string> = {
  renewal_review: "Renewal review",
  second_look: "Second look",
  new_business_advisory: "New business advisory",
  audit: "Audit",
  program_design: "Program design",
  other: "Other",
};

// Group order for the specialty filter strip
const GROUP_ORDER = ["Property", "Liability", "Specialty", "Emerging", "Personal", "Other"];

function compareJobs(a: BoardJob, b: BoardJob, key: SortKey): number {
  switch (key) {
    case "newest":
      return b.created_at.localeCompare(a.created_at);
    case "oldest":
      return a.created_at.localeCompare(b.created_at);
    case "budget_desc":
      return (b.budget_cents ?? -1) - (a.budget_cents ?? -1);
    case "budget_asc":
      return (a.budget_cents ?? Infinity) - (b.budget_cents ?? Infinity);
    case "difficulty_desc":
      return b.difficulty - a.difficulty || b.created_at.localeCompare(a.created_at);
  }
}

export function JobsBoard({ jobs }: { jobs: BoardJob[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [selectedSpecialties, setSelectedSpecialties] = useState<Set<string>>(new Set());
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Specialties that have at least one job, in taxonomy group order
  const availableSpecialties = useMemo(() => {
    const slugsWithJobs = new Set(jobs.map((j) => j.primary_specialty));
    return SPECIALTIES.filter((s) => slugsWithJobs.has(s.slug)).sort((a, b) => {
      const gi = GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group);
      return gi !== 0 ? gi : a.label.localeCompare(b.label);
    });
  }, [jobs]);


  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();

    let filtered = jobs;

    // Text search
    if (q) {
      filtered = filtered.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.summary.toLowerCase().includes(q) ||
          j.description.toLowerCase().includes(q) ||
          (SPECIALTIES_BY_SLUG[j.primary_specialty]?.label ?? "")
            .toLowerCase()
            .includes(q),
      );
    }

    // Specialty filter
    if (selectedSpecialties.size > 0) {
      filtered = filtered.filter((j) => selectedSpecialties.has(j.primary_specialty));
    }

    const sorted = [...filtered].sort((a, b) => compareJobs(a, b, sort));

    const map = new Map<string, BoardJob[]>();
    for (const job of sorted) {
      const arr = map.get(job.primary_specialty) ?? [];
      arr.push(job);
      map.set(job.primary_specialty, arr);
    }
    // Sort groups alphabetically by specialty label
    return [...map.entries()].sort(([a], [b]) => {
      const al = SPECIALTIES_BY_SLUG[a]?.label ?? a;
      const bl = SPECIALTIES_BY_SLUG[b]?.label ?? b;
      return al.localeCompare(bl);
    });
  }, [jobs, query, sort, selectedSpecialties]);

  const totalCount = jobs.length;
  const visibleCount = grouped.reduce((n, [, arr]) => n + arr.length, 0);

  function toggleGroup(slug: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }
  function toggleExpand(jobId: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) next.delete(jobId);
      else next.add(jobId);
      return next;
    });
  }

  const hasActiveFilters = selectedSpecialties.size > 0 || query.trim().length > 0;

  return (
    <div className="space-y-4">
      {/* ── Search + Sort ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, summary, description, specialty…"
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
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-[var(--color-muted)]" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="h-10 rounded-md border bg-[var(--color-card)] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Specialty filter ── */}
      {availableSpecialties.length > 0 && (
        <SpecialtyFilter
          available={availableSpecialties.map((s) => s.slug)}
          selected={selectedSpecialties}
          onChange={setSelectedSpecialties}
        />
      )}

      {/* ── Count line ── */}
      <div className="flex items-center justify-between text-xs text-[var(--color-muted)]">
        <span>
          Showing {visibleCount} of {totalCount} jobs · {grouped.length}{" "}
          {grouped.length === 1 ? "specialty" : "specialties"}
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

      {/* ── Empty ── */}
      {visibleCount === 0 && (
        <Card>
          <CardContent className="pt-8 pb-8 text-center">
            <div className="text-base font-semibold">No matches.</div>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              {hasActiveFilters
                ? "Try removing some filters or clearing the search."
                : "No open jobs at the moment."}
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
          </CardContent>
        </Card>
      )}

      {/* ── Groups ── */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {grouped.map(([slug, items]) => {
          const meta = SPECIALTIES_BY_SLUG[slug];
          const isCollapsed = collapsed.has(slug);
          return (
            <section key={slug} className="rounded-lg border bg-[var(--color-card)]">
              <button
                type="button"
                onClick={() => toggleGroup(slug)}
                aria-expanded={!isCollapsed}
                className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left hover:bg-[var(--color-border)]/30"
              >
                <div className="flex items-center gap-3">
                  {isCollapsed ? (
                    <ChevronRight className="h-4 w-4 text-[var(--color-muted)]" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-[var(--color-muted)]" />
                  )}
                  <div>
                    <div className="font-semibold">{meta?.label ?? slug}</div>
                    {meta?.group && (
                      <div className="text-xs text-[var(--color-muted)]">
                        {meta.group}
                      </div>
                    )}
                  </div>
                </div>
                <Badge variant="primary">
                  {items.length} {items.length === 1 ? "job" : "jobs"}
                </Badge>
              </button>
              {!isCollapsed && (
                <div className="border-t p-3">
                  <ul className="grid grid-cols-1 gap-3">
                    {items.map((job) => (
                      <ExpandableJobRow
                        key={job.id}
                        job={job}
                        expanded={expanded.has(job.id)}
                        onToggle={() => toggleExpand(job.id)}
                      />
                    ))}
                  </ul>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

function ExpandableJobRow({
  job,
  expanded,
  onToggle,
}: {
  job: BoardJob;
  expanded: boolean;
  onToggle: () => void;
}) {
  const budgetLabel =
    job.budget_type === "volunteer"
      ? "Portfolio (no pay)"
      : job.budget_cents != null
        ? `${formatCurrency(job.budget_cents)} ${job.budget_type === "hourly" ? "/ hr" : "flat"}`
        : "Negotiable";

  const statusVariant =
    job.status === "open"
      ? "success"
      : job.status === "claimed"
        ? "warning"
        : job.status === "completed"
          ? "primary"
          : "default";

  return (
    <li className="rounded-md border bg-[var(--color-card)] overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className={cn(
          "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors",
          "hover:bg-[var(--color-border)]/20",
        )}
      >
        <div className="mt-0.5 shrink-0">
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-[var(--color-muted)]" />
          ) : (
            <ChevronRight className="h-4 w-4 text-[var(--color-muted)]" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="font-medium leading-tight">{job.title}</div>
            <Badge variant={statusVariant as never}>{job.status}</Badge>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--color-muted)]">
            <span className="inline-flex items-center gap-1">
              <Briefcase className="h-3 w-3" />
              {JOB_TYPE_LABEL[job.job_type] ?? job.job_type}
            </span>
            <span className="font-medium text-[var(--color-fg)]">
              {budgetLabel}
            </span>
            {job.estimated_hours != null && <span>~{job.estimated_hours}h</span>}
            <span>Difficulty {job.difficulty}/5</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatRelativeTime(job.created_at)}
            </span>
          </div>
          {!expanded && (
            <p className="mt-1 line-clamp-1 text-sm text-[var(--color-muted)]">
              {job.summary}
            </p>
          )}
        </div>
      </button>
      {expanded && (
        <div className="border-t px-4 pb-4 pt-3 pl-11">
          <p className="text-sm text-[var(--color-fg)] leading-relaxed whitespace-pre-line">
            {job.summary}
          </p>
          <p className="mt-3 text-sm text-[var(--color-fg)]/85 leading-relaxed line-clamp-6 whitespace-pre-line">
            {job.description}
          </p>
          <div className="mt-4">
            <Link href={`/jobs/${job.id}`}>
              <Button variant="primary" size="sm">
                Open job →
              </Button>
            </Link>
          </div>
        </div>
      )}
    </li>
  );
}
