"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { SPECIALTIES } from "@/lib/specialties";
import { PLATFORM_FEES } from "@/lib/pricing-config";

// ---------------------------------------------------------------------------
// Engagement tier + fee logic
// ---------------------------------------------------------------------------

type EngagementTier = "consumer" | "professional" | "enterprise" | "strategic";

function deriveEngagementTier(requesterType: string): EngagementTier {
  if (requesterType === "insured_personal") return "consumer";
  if (["carrier", "mga", "reinsurer"].includes(requesterType)) return "enterprise";
  return "professional"; // broker, agent, risk_manager, insured_commercial, tech_ai, other
}

// Fee rates sourced from pricing-config.ts — edit there, not here
const TIER_FEE_BPS: Record<EngagementTier, number> = {
  consumer:     PLATFORM_FEES.consumer,
  professional: PLATFORM_FEES.professional,
  enterprise:   PLATFORM_FEES.enterprise,
  strategic:    PLATFORM_FEES.strategic,
};

// ---------------------------------------------------------------------------
// Post job
// ---------------------------------------------------------------------------

const JOB_TYPE_VALUES = [
  "renewal_review",
  "second_look",
  "new_business_advisory",
  "audit",
  "portfolio_audit",
  "program_design",
  "pre_broker_consult",
  "coverage_dispute",
  "ai_benchmark",
  "pricing_review",
  "risk_assessment",
  "other",
] as const;

const REQUESTER_TYPE_VALUES = [
  "carrier",
  "mga",
  "reinsurer",
  "broker",
  "agent",
  "risk_manager",
  "insured_commercial",
  "insured_personal",
  "tech_ai",
  "other",
] as const;

// Milestone schema for program design / high-value engagements
const _milestoneSchema = z.object({
  label: z.string().min(1).max(100),
  amount_dollars: z.coerce.number().int().min(1),
});

const schema = z.object({
  title: z.string().min(5).max(200),
  summary: z.string().min(20).max(500),
  description: z.string().min(50),
  job_type: z.enum(JOB_TYPE_VALUES),
  requester_type: z.enum(REQUESTER_TYPE_VALUES),
  primary_specialty: z.string().min(1),
  difficulty: z.coerce.number().int().min(1).max(5),
  estimated_hours: z.coerce.number().int().min(1).max(200).optional().nullable(),
  budget_type: z.enum(["hourly", "flat", "volunteer", "per_find", "milestone"]),
  budget_dollars: z.coerce.number().int().min(0).optional().nullable(),
  find_bounty_dollars: z.coerce.number().int().min(1).max(500).optional().nullable(),
  milestones_json: z.string().optional().nullable(),
  sla_hours: z.coerce.number().int().optional().nullable(),
  acquisition_source: z.string().optional().nullable(),
});

export type Result = { ok: true; jobId?: string } | { ok: false; error: string };

export async function postJobAction(
  _prev: Result | null,
  formData: FormData,
): Promise<Result> {
  const parsed = schema.safeParse({
    title: formData.get("title"),
    summary: formData.get("summary"),
    description: formData.get("description"),
    job_type: formData.get("job_type"),
    requester_type: formData.get("requester_type"),
    primary_specialty: formData.get("primary_specialty"),
    difficulty: formData.get("difficulty"),
    estimated_hours: formData.get("estimated_hours") || null,
    budget_type: formData.get("budget_type"),
    budget_dollars: formData.get("budget_dollars") || null,
    find_bounty_dollars: formData.get("find_bounty_dollars") || null,
    milestones_json: formData.get("milestones_json") || null,
    sla_hours: formData.get("sla_hours") || null,
    acquisition_source: formData.get("acquisition_source") || null,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const tier = deriveEngagementTier(parsed.data.requester_type);
  const feeBps = TIER_FEE_BPS[tier];

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  // Parse milestones if provided
  let milestonesJson: { label: string; amount_cents: number; status: string }[] | null = null;
  let milestonesTotalCents: number | null = null;
  if (parsed.data.budget_type === "milestone" && parsed.data.milestones_json) {
    try {
      const raw = JSON.parse(parsed.data.milestones_json) as { label: string; amount_dollars: number }[];
      milestonesJson = raw.map((m) => ({
        label: m.label,
        amount_cents: Math.round(m.amount_dollars * 100),
        status: "pending",
      }));
      milestonesTotalCents = milestonesJson.reduce((s, m) => s + m.amount_cents, 0);
    } catch {
      return { ok: false, error: "Invalid milestone data." };
    }
  }

  // Compute budget_cents
  let budgetCents: number | null = null;
  if (parsed.data.budget_type === "volunteer") {
    budgetCents = 0;
  } else if (parsed.data.budget_type === "milestone") {
    budgetCents = milestonesTotalCents;
  } else if (parsed.data.budget_type === "per_find") {
    // budget_dollars = optional cap on total bounty pool
    budgetCents = parsed.data.budget_dollars ? parsed.data.budget_dollars * 100 : null;
  } else {
    budgetCents = parsed.data.budget_dollars ? parsed.data.budget_dollars * 100 : null;
  }

  const { data, error } = await supabase
    .from("jobs")
    .insert({
      poster_id: user.id,
      title: parsed.data.title,
      summary: parsed.data.summary,
      description: parsed.data.description,
      job_type: parsed.data.job_type as never,
      requester_type: parsed.data.requester_type as never,
      primary_specialty: parsed.data.primary_specialty,
      difficulty: parsed.data.difficulty,
      estimated_hours: parsed.data.estimated_hours ?? null,
      budget_cents: budgetCents,
      budget_type: parsed.data.budget_type,
      find_bounty_cents: parsed.data.find_bounty_dollars
        ? parsed.data.find_bounty_dollars * 100
        : null,
      milestones: milestonesJson,
      status: "open",
      engagement_tier: tier,
      platform_fee_bps: feeBps,
      sla_hours: parsed.data.sla_hours ?? null,
      acquisition_source: parsed.data.acquisition_source ?? null,
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };

  revalidatePath("/jobs");
  revalidatePath("/dashboard/posted");
  redirect(`/jobs/${data.id}`);
}

// ---------------------------------------------------------------------------
// AI job generator
// ---------------------------------------------------------------------------

export type GeneratedJob = {
  title: string;
  summary: string;
  description: string;
  job_type: typeof JOB_TYPE_VALUES[number];
  primary_specialty: string;
  additional_specialties: string[];
  difficulty: number;
  estimated_hours: number | null;
  budget_type: "hourly" | "flat" | "volunteer";
  budget_dollars: number | null;
};

export type GenerateResult =
  | { ok: true; job: GeneratedJob }
  | { ok: false; error: string };

export async function generateJobAction(
  brief: string,
  requesterType: string,
): Promise<GenerateResult> {
  if (!brief || brief.trim().length < 10) {
    return { ok: false, error: "Please write at least a sentence describing what you need." };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { ok: false, error: "AI generation is not configured." };

  const slugList = SPECIALTIES.map((s) => `${s.slug} (${s.label})`).join(", ");

  const requesterContext: Record<string, string> = {
    carrier:           "a carrier looking for independent underwriting analysis on a submission or renewal",
    mga:               "an MGA or program administrator reviewing appetite, pricing, or portfolio fit",
    reinsurer:         "a reinsurer evaluating treaty pricing or loss ratio analysis",
    broker:            "a broker or wholesale intermediary who wants an independent expert opinion for their client",
    agent:             "a retail agent or producer seeking guidance on a client submission",
    risk_manager:      "a corporate risk manager who wants independent analysis before their broker meeting",
    insured_commercial:"a business owner or commercial insured challenging a renewal, non-renewal, or coverage decision",
    insured_personal:  "an individual or homeowner questioning a rate increase, non-renewal, or coverage exclusion",
    tech_ai:           "a technology company or AI lab benchmarking automated underwriting against human expert judgment",
    other:             "a requester seeking independent underwriting expertise",
  };

  const systemPrompt = `You are an expert underwriting job-posting writer for DUG (Decentralized Underwriting Group) — a platform connecting anyone who needs independent underwriting analysis with qualified underwriters.

The requester is ${requesterContext[requesterType] ?? requesterContext.other}.

Your job: turn their rough description into a complete, professional evaluation request that will attract the right underwriter.

You MUST respond with ONLY valid JSON matching this exact shape (no markdown, no explanation, just the JSON object):
{
  "title": "string (5–120 chars, descriptive and specific)",
  "summary": "string (20–200 chars, one punchy sentence an underwriter skims in the job list)",
  "description": "string (150–600 chars, detailed context: situation, key exposures, what analysis is needed, what the requester hopes to understand)",
  "job_type": "renewal_review" | "second_look" | "new_business_advisory" | "audit" | "program_design" | "pre_broker_consult" | "coverage_dispute" | "ai_benchmark" | "pricing_review" | "risk_assessment" | "other",
  "primary_specialty": "one slug from the list below",
  "additional_specialties": ["0–3 slugs from the list below"],
  "difficulty": 1 | 2 | 3 | 4 | 5,
  "estimated_hours": number or null,
  "budget_type": "flat" | "hourly" | "volunteer",
  "budget_dollars": number or null
}

job_type guidance:
- renewal_review: reviewing an expiring policy for changes to pricing or terms
- second_look: sanity-checking a quote or decision already in progress
- new_business_advisory: appetite/pricing opinion on a new account
- audit: coverage gap or program audit
- program_design: building a new coverage program from scratch
- pre_broker_consult: independent view before a meeting with a broker or carrier
- coverage_dispute: challenging a coverage decision, exclusion, or non-renewal
- ai_benchmark: comparing AI underwriting output against human expert judgment
- pricing_review: independent assessment of whether pricing is fair or appropriate
- risk_assessment: general risk evaluation without a specific transaction context
- other: anything else

difficulty guidance (1=simple/vanilla, 5=highly complex/unusual):
- 1–2: standard risk, clean history, known market
- 3: some complexity, minor issues, moderate specialty
- 4: significant complexity, loss history, hard-to-place or emerging risk
- 5: extremely complex, novel exposure, no standard market

budget guidance: if unspecified, infer a reasonable flat fee based on difficulty (~$150–600 for 1–4 hours of expert work). Volunteer only if explicitly requested.

Available specialty slugs: ${slugList}

Pick the closest match. Do not invent new slugs.`;

  const userMessage = `Here is the requester's description:\n\n${brief.trim()}`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Anthropic API error:", err);
      return { ok: false, error: "AI generation failed. Please fill in the form manually." };
    }

    const data = await res.json();
    const raw = data.content?.[0]?.text ?? "";
    const cleaned = raw.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();

    let job: GeneratedJob;
    try {
      job = JSON.parse(cleaned);
    } catch {
      console.error("JSON parse error:", cleaned);
      return { ok: false, error: "Couldn't parse AI response. Try again or fill in manually." };
    }

    const validSlugs = new Set(SPECIALTIES.map((s) => s.slug));
    if (!validSlugs.has(job.primary_specialty)) {
      job.primary_specialty = "general-liability";
    }
    job.additional_specialties = (job.additional_specialties ?? []).filter((s) =>
      validSlugs.has(s)
    );
    job.difficulty = Math.max(1, Math.min(5, Math.round(job.difficulty ?? 3)));

    return { ok: true, job };
  } catch (e) {
    console.error("generateJobAction error:", e);
    return { ok: false, error: "Network error calling AI. Please try again." };
  }
}
