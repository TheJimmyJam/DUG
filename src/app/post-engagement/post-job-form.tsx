"use client";

import { useActionState, useState, useTransition, useRef } from "react";
import { Sparkles, RotateCcw, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Honeypot } from "@/components/honeypot";
import { Turnstile } from "@/components/turnstile";
import { postJobAction, generateJobAction, type Result, type GeneratedJob } from "./actions";
import type { Specialty, SpecialtyGroup } from "@/lib/specialties";
import type { PricingConfig } from "@/lib/pricing-config";

const initial: Result | null = null;

// ---------------------------------------------------------------------------
// Requester types
// ---------------------------------------------------------------------------
const REQUESTER_TYPES = [
  { value: "carrier",            label: "Carrier" },
  { value: "mga",                label: "MGA / Program admin" },
  { value: "reinsurer",          label: "Reinsurer" },
  { value: "broker",             label: "Broker / Wholesale" },
  { value: "agent",              label: "Agent / Retail producer" },
  { value: "risk_manager",       label: "Risk manager" },
  { value: "insured_commercial", label: "Commercial insured / business owner" },
  { value: "insured_personal",   label: "Individual / personal lines" },
  { value: "tech_ai",            label: "Tech company / AI benchmarking" },
  { value: "other",              label: "Other" },
] as const;

// ---------------------------------------------------------------------------
// Job types — ordered by relevance per requester
// ---------------------------------------------------------------------------
const ALL_JOB_TYPES = [
  { value: "renewal_review",        label: "Renewal review" },
  { value: "second_look",           label: "Second look / sanity check" },
  { value: "new_business_advisory", label: "New business advisory" },
  { value: "pricing_review",        label: "Pricing review" },
  { value: "risk_assessment",       label: "Risk assessment" },
  { value: "pre_broker_consult",    label: "Pre-broker consult" },
  { value: "coverage_dispute",      label: "Coverage dispute / challenge" },
  { value: "audit",                 label: "Coverage audit" },
  { value: "portfolio_audit",       label: "Portfolio audit (bounty)" },
  { value: "program_design",        label: "Program design" },
  { value: "ai_benchmark",          label: "AI benchmarking" },
  { value: "other",                 label: "Other" },
] as const;

type JobTypeValue = typeof ALL_JOB_TYPES[number]["value"];

const JOB_TYPES_BY_REQUESTER: Record<string, JobTypeValue[]> = {
  carrier:            ["renewal_review", "second_look", "new_business_advisory", "pricing_review", "risk_assessment", "audit", "portfolio_audit", "program_design", "other"],
  mga:                ["renewal_review", "second_look", "new_business_advisory", "pricing_review", "audit", "portfolio_audit", "program_design", "risk_assessment", "other"],
  reinsurer:          ["pricing_review", "renewal_review", "audit", "portfolio_audit", "risk_assessment", "second_look", "program_design", "other"],
  broker:             ["pre_broker_consult", "renewal_review", "second_look", "new_business_advisory", "pricing_review", "risk_assessment", "other"],
  agent:              ["pre_broker_consult", "renewal_review", "second_look", "new_business_advisory", "pricing_review", "other"],
  risk_manager:       ["pre_broker_consult", "renewal_review", "pricing_review", "risk_assessment", "audit", "second_look", "other"],
  insured_commercial: ["pre_broker_consult", "renewal_review", "coverage_dispute", "pricing_review", "risk_assessment", "second_look", "other"],
  insured_personal:   ["renewal_review", "coverage_dispute", "pre_broker_consult", "pricing_review", "second_look", "other"],
  tech_ai:            ["ai_benchmark", "risk_assessment", "second_look", "pricing_review", "other"],
  other:              ALL_JOB_TYPES.map((t) => t.value),
};

// ---------------------------------------------------------------------------
// AI brief placeholder examples per requester
// ---------------------------------------------------------------------------
const BRIEF_PLACEHOLDER: Record<string, string> = {
  carrier:            "e.g. Trampoline park in Houston, TX. Prior carrier non-renewed after a $120K GL claim. Need a second opinion on whether we should bind at $18K annual.",
  mga:                "e.g. Program renewal on 45-unit habitational portfolio in FL. Occupancy mix has shifted toward STR. Need audit of appetite fit and pricing recommendation.",
  reinsurer:          "e.g. Reviewing a casualty treaty from a regional carrier. Need independent loss ratio analysis and pricing opinion on the XS layer.",
  broker:             "e.g. Client is facing a 40% renewal increase on commercial property, no claims. Want an independent pricing opinion before I sit down with the carrier.",
  agent:              "e.g. New restaurant account — liquor liability, prior DUI incident on premises 2 years ago. Need advisory on current market appetite and realistic price range.",
  risk_manager:       "e.g. D&O renewal is up 60%. Meeting with our broker next week. Want an independent underwriter's view on whether this increase is justified before we walk in.",
  insured_commercial: "e.g. Our GL carrier non-renewed after a minor slip-and-fall. We're a 12-employee HVAC contractor with a clean 8-year history. Is this legitimate?",
  insured_personal:   "e.g. My homeowners premium jumped 38% at renewal. No claims, same house, same neighborhood. I want an independent opinion on whether this is reasonable.",
  tech_ai:            "e.g. We've built an AI model for commercial auto underwriting. Want to benchmark it against human experts on 20 test submissions across difficulty levels.",
  other:              "e.g. Describe what you need evaluated. Any channel — carrier, insured, broker, or anything else — is welcome here.",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function PostJobForm({
  specialties,
  specialtyGroups,
  pricingConfig,
}: {
  specialties: Specialty[];
  specialtyGroups: SpecialtyGroup[];
  pricingConfig: PricingConfig;
}) {
  const [state, action, pending] = useActionState(postJobAction, initial);

  const [requesterType, setRequesterType] = useState("carrier");
  const [brief, setBrief] = useState("");
  const [generating, startGenerate] = useTransition();
  const [generated, setGenerated] = useState<GeneratedJob | null>(null);
  const [genError, setGenError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [jobType, setJobType] = useState<JobTypeValue | "">("");
  const [primarySpecialty, setPrimarySpecialty] = useState("");
  const [difficulty, setDifficulty] = useState("3");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [budgetType, setBudgetType] = useState<"hourly" | "flat" | "volunteer" | "per_find" | "milestone">("flat");
  const [budgetDollars, setBudgetDollars] = useState("");
  const [findBountyDollars, setFindBountyDollars] = useState(String(pricingConfig.bounty.defaultPerFind));
  const [milestones, setMilestones] = useState<{ label: string; amount: string }[]>([
    { label: "Kickoff & scoping", amount: "" },
    { label: "Draft delivery", amount: "" },
    { label: "Final delivery", amount: "" },
  ]);
  const [slaHours, setSlaHours] = useState<string>("");

  const formRef = useRef<HTMLDivElement>(null);

  const allowedJobTypeValues = JOB_TYPES_BY_REQUESTER[requesterType] ?? JOB_TYPES_BY_REQUESTER.other;
  const availableJobTypes = allowedJobTypeValues
    .map((v) => ALL_JOB_TYPES.find((t) => t.value === v))
    .filter(Boolean) as typeof ALL_JOB_TYPES[number][];

  function handleRequesterChange(val: string) {
    setRequesterType(val);
    const allowed = JOB_TYPES_BY_REQUESTER[val] ?? JOB_TYPES_BY_REQUESTER.other;
    if (jobType && !allowed.includes(jobType as JobTypeValue)) {
      setJobType(allowed[0] ?? "other");
    }
    setBrief("");
    setGenerated(null);
    setGenError(null);
  }

  function applyGenerated(job: GeneratedJob) {
    setTitle(job.title);
    setSummary(job.summary);
    setDescription(job.description);
    const allowed = JOB_TYPES_BY_REQUESTER[requesterType] ?? JOB_TYPES_BY_REQUESTER.other;
    setJobType(allowed.includes(job.job_type as JobTypeValue) ? (job.job_type as JobTypeValue) : (allowed[0] ?? "other"));
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
      const result = await generateJobAction(brief, requesterType);
      if (result.ok) applyGenerated(result.job);
      else setGenError(result.error);
    });
  }

  function handleReset() {
    setGenerated(null);
    setBrief("");
    setTitle(""); setSummary(""); setDescription("");
    setJobType(""); setPrimarySpecialty("");
    setDifficulty("3"); setEstimatedHours("");
    setBudgetType("flat"); setBudgetDollars("");
    setFindBountyDollars("8");
    setMilestones([
      { label: "Kickoff & scoping", amount: "" },
      { label: "Draft delivery", amount: "" },
      { label: "Final delivery", amount: "" },
    ]);
    setSlaHours("");
  }

  const requesterLabel = REQUESTER_TYPES.find((r) => r.value === requesterType)?.label ?? "";

  const isEnterpriseRequester = ["carrier", "mga", "reinsurer"].includes(requesterType);

  function getFeeLabel(tierKey: string): string {
    const bps = pricingConfig.platformFees[tierKey] ?? 1500;
    return `${(bps / 100).toFixed(0)}%`;
  }

  function deriveTierLabel(rt: string) {
    const tierKey = rt === "insured_personal" ? "consumer" : ["carrier","mga","reinsurer"].includes(rt) ? "enterprise" : "professional";
    const fee = getFeeLabel(tierKey);
    if (rt === "insured_personal") return { label: "Consumer", fee, color: "text-amber-700 bg-amber-50 border-amber-200" };
    if (["carrier", "mga", "reinsurer"].includes(rt)) return { label: "Enterprise", fee, color: "text-indigo-700 bg-indigo-50 border-indigo-200" };
    return { label: "Professional", fee, color: "text-[var(--color-primary)] bg-[var(--color-primary)]/5 border-[var(--color-primary)]/20" };
  }

  const tierInfo = deriveTierLabel(requesterType);

  // Dynamic pricing hint from live config
  const pricingHint = (() => {
    if (budgetType === "volunteer" || budgetType === "per_find" || budgetType === "milestone") return null;
    const diffRow = pricingConfig.byDifficulty[String(parseInt(difficulty) || 3)];
    if (!diffRow) return null;
    // Job type override takes precedence for flat
    if (budgetType === "flat" && jobType && pricingConfig.jobTypeOverrides[jobType]) {
      return { range: pricingConfig.jobTypeOverrides[jobType], label: diffRow.label, isOverride: true };
    }
    const range = budgetType === "hourly" ? diffRow.hourly : diffRow.flat;
    return range ? { range, label: diffRow.label, isOverride: false } : null;
  })();

  return (
    <div className="space-y-6">

      {/* ── Who are you? ── */}
      <div className="space-y-2">
        <Label htmlFor="requester_type_select">Who is requesting this evaluation?</Label>
        <p className="text-xs text-[var(--color-muted)]">
          DUG is channel-agnostic — carriers, insureds, brokers, risk managers, and AI labs are all welcome. This shapes the evaluation types shown and the AI draft.
        </p>
        <select
          id="requester_type_select"
          value={requesterType}
          onChange={(e) => handleRequesterChange(e.target.value)}
          className="flex h-10 w-full rounded-md border border-[var(--color-border)] bg-white dark:bg-[var(--color-bg)] px-3 text-sm text-[var(--color-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
        >
          {REQUESTER_TYPES.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
        <div className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${tierInfo.color}`}>
          <span>{tierInfo.label} tier</span>
          <span className="opacity-60">·</span>
          <span>{tierInfo.fee} platform fee</span>
        </div>
      </div>

      {/* ── AI Brief ── */}
      <div className="rounded-xl border-2 border-dashed border-[var(--color-primary)]/30 bg-[var(--color-primary)]/[0.03] p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[var(--color-primary)]" />
          <h2 className="font-semibold text-[var(--color-primary)]">Draft with AI</h2>
          <span className="rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 text-xs font-medium text-[var(--color-primary)]">
            Optional
          </span>
        </div>
        <p className="text-sm text-[var(--color-muted)]">
          Describe what you need evaluated in plain language — a sentence or two is enough.
          Claude will draft the full request. You review and edit before it goes live.
        </p>
        <Textarea
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          rows={3}
          placeholder={BRIEF_PLACEHOLDER[requesterType] ?? BRIEF_PLACEHOLDER.other}
          disabled={generating}
          className="bg-white dark:bg-[var(--color-bg)]"
        />
        {genError && <p className="text-sm text-[var(--color-danger)]">{genError}</p>}
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleGenerate}
            disabled={generating || brief.trim().length < 10}
          >
            {generating ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Drafting…
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                {generated ? "Re-generate" : "Generate request"}
              </>
            )}
          </Button>
          {generated && (
            <button type="button" onClick={handleReset} className="inline-flex items-center gap-1 text-xs text-[var(--color-muted)] hover:text-[var(--color-fg)] underline-offset-2 hover:underline">
              <RotateCcw className="h-3 w-3" />
              Start over
            </button>
          )}
        </div>
        {generated && (
          <div className="flex items-center gap-2 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 px-3 py-2 text-sm text-green-800 dark:text-green-300">
            ✓ Claude drafted this — review and edit everything below, then post.
          </div>
        )}
      </div>

      {generated && (
        <div className="flex items-center gap-3 text-xs text-[var(--color-muted)]">
          <div className="h-px flex-1 bg-[var(--color-border)]" />
          <ChevronDown className="h-3.5 w-3.5" />
          <span>Review &amp; edit</span>
          <div className="h-px flex-1 bg-[var(--color-border)]" />
        </div>
      )}

      {/* ── Full form ── */}
      <div ref={formRef}>
        <form action={action} className="space-y-5">
          <Honeypot />
          <input type="hidden" name="requester_type" value={requesterType} />

          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required minLength={5} maxLength={200}
              placeholder="e.g. Homeowners renewal — 38% increase, no claims, need pricing opinion"
              value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="summary">One-line summary</Label>
            <Input id="summary" name="summary" required minLength={20} maxLength={500}
              placeholder="A sentence that helps the right underwriter spot this request."
              value={summary} onChange={(e) => setSummary(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="description">Full description</Label>
            <Textarea id="description" name="description" rows={8} required minLength={50}
              placeholder="Describe the situation, exposure, history, and what you need analyzed."
              value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="job_type">
                Evaluation type
                {requesterLabel && (
                  <span className="ml-1.5 text-xs font-normal text-[var(--color-muted)]">
                    for {requesterLabel.toLowerCase()}
                  </span>
                )}
              </Label>
              <select id="job_type" name="job_type" required value={jobType}
                onChange={(e) => setJobType(e.target.value as JobTypeValue)}
                className="mt-0 flex h-10 w-full rounded-md border bg-white dark:bg-[var(--color-bg)] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
              >
                <option value="">Select…</option>
                {availableJobTypes.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="primary_specialty">Primary specialty</Label>
              <select id="primary_specialty" name="primary_specialty" required value={primarySpecialty}
                onChange={(e) => setPrimarySpecialty(e.target.value)}
                className="mt-0 flex h-10 w-full rounded-md border bg-white dark:bg-[var(--color-bg)] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
              >
                <option value="">Select…</option>
                {specialtyGroups.map((g) => {
                  const items = specialties.filter((s) => s.group === g);
                  if (!items.length) return null;
                  return (
                    <optgroup key={g} label={g}>
                      {items.map((s) => <option key={s.slug} value={s.slug}>{s.label}</option>)}
                    </optgroup>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="difficulty">Complexity (1–5)</Label>
              <Input id="difficulty" name="difficulty" type="number" min={1} max={5} required
                value={difficulty} onChange={(e) => setDifficulty(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="estimated_hours">Estimated hours</Label>
              <Input id="estimated_hours" name="estimated_hours" type="number" min={1} max={200}
                placeholder="e.g. 2" value={estimatedHours} onChange={(e) => setEstimatedHours(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="budget_type">Budget type</Label>
              <select id="budget_type" name="budget_type" value={budgetType}
                onChange={(e) => setBudgetType(e.target.value as typeof budgetType)}
                className="mt-0 flex h-10 w-full rounded-md border bg-white dark:bg-[var(--color-bg)] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
              >
                <option value="flat">Flat fee</option>
                <option value="hourly">Hourly</option>
                <option value="per_find">Per confirmed find (bounty)</option>
                <option value="milestone">Milestone billing</option>
                <option value="volunteer">Volunteer / portfolio</option>
              </select>
            </div>
          </div>

          {/* Flat / hourly budget */}
          {(budgetType === "flat" || budgetType === "hourly") && (
            <div>
              <Label htmlFor="budget_dollars">Budget ({budgetType === "hourly" ? "$/hr" : "total $"})</Label>
              <Input id="budget_dollars" name="budget_dollars" type="number" min={0}
                placeholder={pricingHint?.range ? `e.g. ${pricingHint.range.min}–${pricingHint.range.max}` : "e.g. 350"}
                value={budgetDollars} onChange={(e) => setBudgetDollars(e.target.value)} />
              {pricingHint?.range && (
                <p className="mt-1.5 text-xs text-[var(--color-muted)]">
                  Typical for {pricingHint.label.toLowerCase()} {budgetType === "hourly" ? "hourly rate" : "flat fee"}:{" "}
                  <span className="font-medium text-[var(--color-fg)]">
                    ${pricingHint.range.min.toLocaleString()}–${pricingHint.range.max.toLocaleString()}
                    {pricingHint.isOverride && " for this engagement type"}
                  </span>
                  {" "}— set whatever you think is fair.
                </p>
              )}
            </div>
          )}

          {/* Per-find bounty */}
          {budgetType === "per_find" && (
            <div className="rounded-lg border bg-amber-50/50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/30 p-4 space-y-3">
              <div className="text-sm font-medium text-amber-900 dark:text-amber-200">Bounty per confirmed find</div>
              <p className="text-xs text-[var(--color-muted)]">
                Underwriters earn this amount for each issue flagged and confirmed. Great for large portfolio audits where you want many eyes on many submissions.
              </p>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Label htmlFor="find_bounty_dollars">Bounty per find ($)</Label>
                  <Input id="find_bounty_dollars" name="find_bounty_dollars" type="number"
                    min={pricingConfig.bounty.suggestedMin} max={pricingConfig.bounty.suggestedMax}
                    placeholder={`e.g. ${pricingConfig.bounty.defaultPerFind}`}
                    value={findBountyDollars} onChange={(e) => setFindBountyDollars(e.target.value)} />
                </div>
                <div className="flex-1">
                  <Label htmlFor="budget_dollars_cap">Total pool cap ($ optional)</Label>
                  <Input id="budget_dollars_cap" name="budget_dollars" type="number" min={0}
                    placeholder="No cap" value={budgetDollars} onChange={(e) => setBudgetDollars(e.target.value)} />
                </div>
              </div>
              <p className="text-xs text-[var(--color-muted)]">
                Platform fee ({tierInfo.fee}) applies to each bounty payout.
              </p>
            </div>
          )}

          {/* Milestone billing */}
          {budgetType === "milestone" && (
            <div className="rounded-lg border bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800/30 p-4 space-y-4">
              <div className="text-sm font-medium text-indigo-900 dark:text-indigo-200">Milestone schedule</div>
              <p className="text-xs text-[var(--color-muted)]">
                Define up to 5 milestones. Payment is released when each is marked complete. No rate cap — suitable for high-value program design engagements.
              </p>
              <div className="space-y-2">
                {milestones.map((m, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      className="flex-1"
                      placeholder={`Milestone ${i + 1} description`}
                      value={m.label}
                      onChange={(e) => {
                        const next = [...milestones];
                        next[i] = { ...next[i], label: e.target.value };
                        setMilestones(next);
                      }}
                    />
                    <div className="relative w-28 shrink-0">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] text-sm">$</span>
                      <Input
                        className="pl-6"
                        type="number"
                        min={1}
                        placeholder="0"
                        value={m.amount}
                        onChange={(e) => {
                          const next = [...milestones];
                          next[i] = { ...next[i], amount: e.target.value };
                          setMilestones(next);
                        }}
                      />
                    </div>
                    {milestones.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setMilestones(milestones.filter((_, j) => j !== i))}
                        className="shrink-0 text-[var(--color-muted)] hover:text-[var(--color-danger)] text-lg leading-none"
                        aria-label="Remove milestone"
                      >×</button>
                    )}
                  </div>
                ))}
              </div>
              {milestones.length < 5 && (
                <button
                  type="button"
                  onClick={() => setMilestones([...milestones, { label: "", amount: "" }])}
                  className="text-xs text-[var(--color-primary)] hover:underline"
                >
                  + Add milestone
                </button>
              )}
              {/* Running total */}
              {milestones.some((m) => m.amount) && (
                <div className="flex items-center justify-between border-t pt-3 text-sm">
                  <span className="text-[var(--color-muted)]">Total</span>
                  <span className="font-semibold">
                    ${milestones.reduce((s, m) => s + (parseFloat(m.amount) || 0), 0).toLocaleString()}
                  </span>
                </div>
              )}
              <p className="text-xs text-[var(--color-muted)]">
                Platform fee ({tierInfo.fee}) deducted at each milestone release.
              </p>
              {/* Hidden serialized milestones */}
              <input
                type="hidden"
                name="milestones_json"
                value={JSON.stringify(milestones.filter((m) => m.label && m.amount).map((m) => ({
                  label: m.label,
                  amount_dollars: parseFloat(m.amount) || 0,
                })))}
              />
            </div>
          )}

          {/* ── SLA — shown for carrier/MGA/reinsurer ── */}
          {isEnterpriseRequester && (
            <div>
              <Label htmlFor="sla_hours">Turnaround commitment</Label>
              <p className="text-xs text-[var(--color-muted)] mb-1">
                Enterprise requests can include a committed response window. Select if needed.
              </p>
              <select id="sla_hours" name="sla_hours" value={slaHours}
                onChange={(e) => setSlaHours(e.target.value)}
                className="flex h-10 w-full rounded-md border border-[var(--color-border)] bg-white dark:bg-[var(--color-bg)] px-3 text-sm text-[var(--color-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
              >
                <option value="">Best-effort (no SLA)</option>
                <option value="24">24-hour turnaround</option>
                <option value="48">48-hour turnaround</option>
                <option value="72">72-hour turnaround</option>
                <option value="168">7-day turnaround</option>
              </select>
            </div>
          )}

          {state?.ok === false && (
            <div role="alert" className="rounded-md border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 p-3 text-sm text-[var(--color-danger)]">
              {state.error}
            </div>
          )}

          <Turnstile action="post-engagement" />

          <Button type="submit" variant="primary" size="lg" disabled={pending} className="w-full sm:w-auto">
            {pending ? "Posting…" : generated ? "Post this request →" : "Post request"}
          </Button>
        </form>
      </div>
    </div>
  );
}
