"use client";

import { useActionState, useState, useTransition, useRef } from "react";
import { Sparkles, RotateCcw, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { postJobAction, generateJobAction, type Result, type GeneratedJob } from "./actions";
import type { Specialty, SpecialtyGroup } from "@/lib/specialties";

const initial: Result | null = null;

const JOB_TYPES = [
  ["renewal_review", "Renewal review"],
  ["second_look", "Second look"],
  ["new_business_advisory", "New business advisory"],
  ["audit", "Audit"],
  ["program_design", "Program design"],
  ["other", "Other"],
] as const;

export function PostJobForm({
  specialties,
  specialtyGroups,
}: {
  specialties: Specialty[];
  specialtyGroups: SpecialtyGroup[];
}) {
  const [state, action, pending] = useActionState(postJobAction, initial);

  // AI generation state
  const [brief, setBrief] = useState("");
  const [generating, startGenerate] = useTransition();
  const [generated, setGenerated] = useState<GeneratedJob | null>(null);
  const [genError, setGenError] = useState<string | null>(null);

  // Controlled field values — pre-filled by AI, fully editable
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [jobType, setJobType] = useState("renewal_review");
  const [primarySpecialty, setPrimarySpecialty] = useState("");
  const [difficulty, setDifficulty] = useState("3");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [budgetType, setBudgetType] = useState<"hourly" | "flat" | "volunteer">("flat");
  const [budgetDollars, setBudgetDollars] = useState("");

  const formRef = useRef<HTMLDivElement>(null);

  function applyGenerated(job: GeneratedJob) {
    setTitle(job.title);
    setSummary(job.summary);
    setDescription(job.description);
    setJobType(job.job_type);
    setPrimarySpecialty(job.primary_specialty);
    setDifficulty(String(job.difficulty));
    setEstimatedHours(job.estimated_hours ? String(job.estimated_hours) : "");
    setBudgetType(job.budget_type);
    setBudgetDollars(job.budget_dollars ? String(job.budget_dollars) : "");
    setGenerated(job);
    setGenError(null);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  }

  function handleGenerate() {
    setGenError(null);
    startGenerate(async () => {
      const result = await generateJobAction(brief);
      if (result.ok) {
        applyGenerated(result.job);
      } else {
        setGenError(result.error);
      }
    });
  }

  function handleReset() {
    setGenerated(null);
    setBrief("");
    setTitle(""); setSummary(""); setDescription("");
    setJobType("renewal_review"); setPrimarySpecialty("");
    setDifficulty("3"); setEstimatedHours("");
    setBudgetType("flat"); setBudgetDollars("");
  }

  return (
    <div className="space-y-6">

      {/* ── Step 1: AI Brief ── */}
      <div className="rounded-xl border-2 border-dashed border-[var(--color-primary)]/30 bg-[var(--color-primary)]/[0.03] p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[var(--color-primary)]" />
          <h2 className="font-semibold text-[var(--color-primary)]">Draft with AI</h2>
          <span className="rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 text-xs font-medium text-[var(--color-primary)]">
            Optional
          </span>
        </div>
        <p className="text-sm text-[var(--color-muted)]">
          Describe what you need underwritten in plain language — a sentence or two is enough.
          Claude will draft the full posting. You review and edit before it goes live.
        </p>
        <Textarea
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          rows={3}
          placeholder="e.g. I have a 50,000 sq ft indoor trampoline park in Houston, prior carrier non-renewed after a $120K GL claim. Need a second opinion on whether we can bind at $18K."
          disabled={generating}
          className="bg-white dark:bg-[var(--color-bg)]"
        />

        {genError && (
          <p className="text-sm text-[var(--color-danger)]">{genError}</p>
        )}

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleGenerate}
            disabled={generating || brief.trim().length < 10}
            className="gap-1.5"
          >
            {generating ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Drafting…
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                {generated ? "Re-generate" : "Generate job posting"}
              </>
            )}
          </Button>
          {generated && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-xs text-[var(--color-muted)] hover:text-[var(--color-fg)] underline-offset-2 hover:underline"
            >
              <RotateCcw className="h-3 w-3" />
              Start over
            </button>
          )}
        </div>

        {generated && (
          <div className="flex items-center gap-2 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 px-3 py-2 text-sm text-green-800 dark:text-green-300">
            ✓ Claude drafted this posting — review and edit everything below, then post.
          </div>
        )}
      </div>

      {/* ── Divider ── */}
      {generated && (
        <div className="flex items-center gap-3 text-xs text-[var(--color-muted)]">
          <div className="h-px flex-1 bg-[var(--color-border)]" />
          <ChevronDown className="h-3.5 w-3.5" />
          <span>Review &amp; edit</span>
          <div className="h-px flex-1 bg-[var(--color-border)]" />
        </div>
      )}

      {/* ── Step 2: Full form ── */}
      <div ref={formRef}>
        <form action={action} className="space-y-5">

          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              required
              minLength={5}
              maxLength={200}
              placeholder="e.g. Indoor trampoline park — second look on GL pricing"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="summary">One-line summary</Label>
            <Input
              id="summary"
              name="summary"
              required
              minLength={20}
              maxLength={500}
              placeholder="A sentence that helps the right underwriter spot it."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="description">Full risk description</Label>
            <Textarea
              id="description"
              name="description"
              rows={8}
              required
              minLength={50}
              placeholder="Operations, exposure, loss history, what specifically you want analyzed."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="job_type">Type</Label>
              <select
                id="job_type"
                name="job_type"
                required
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="mt-0 flex h-10 w-full rounded-md border bg-white dark:bg-[var(--color-bg)] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
              >
                {JOB_TYPES.map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="primary_specialty">Primary specialty</Label>
              <select
                id="primary_specialty"
                name="primary_specialty"
                required
                value={primarySpecialty}
                onChange={(e) => setPrimarySpecialty(e.target.value)}
                className="mt-0 flex h-10 w-full rounded-md border bg-white dark:bg-[var(--color-bg)] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
              >
                <option value="">Select…</option>
                {specialtyGroups.map((g) => {
                  const items = specialties.filter((s) => s.group === g);
                  if (items.length === 0) return null;
                  return (
                    <optgroup key={g} label={g}>
                      {items.map((s) => (
                        <option key={s.slug} value={s.slug}>{s.label}</option>
                      ))}
                    </optgroup>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="difficulty">Difficulty (1–5)</Label>
              <Input
                id="difficulty"
                name="difficulty"
                type="number"
                min={1}
                max={5}
                required
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="estimated_hours">Estimated hours</Label>
              <Input
                id="estimated_hours"
                name="estimated_hours"
                type="number"
                min={1}
                max={200}
                placeholder="e.g. 4"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="budget_type">Budget type</Label>
              <select
                id="budget_type"
                name="budget_type"
                value={budgetType}
                onChange={(e) => setBudgetType(e.target.value as typeof budgetType)}
                className="mt-0 flex h-10 w-full rounded-md border bg-white dark:bg-[var(--color-bg)] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
              >
                <option value="flat">Flat fee</option>
                <option value="hourly">Hourly</option>
                <option value="volunteer">Volunteer / portfolio</option>
              </select>
            </div>
          </div>

          {budgetType !== "volunteer" && (
            <div>
              <Label htmlFor="budget_dollars">
                Budget ({budgetType === "hourly" ? "$/hr" : "total $"})
              </Label>
              <Input
                id="budget_dollars"
                name="budget_dollars"
                type="number"
                min={0}
                placeholder="e.g. 500"
                value={budgetDollars}
                onChange={(e) => setBudgetDollars(e.target.value)}
              />
            </div>
          )}

          {state?.ok === false && (
            <div
              role="alert"
              className="rounded-md border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 p-3 text-sm text-[var(--color-danger)]"
            >
              {state.error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={pending}
            className="w-full sm:w-auto"
          >
            {pending ? "Posting…" : generated ? "Post this job →" : "Post job"}
          </Button>
        </form>
      </div>
    </div>
  );
}
