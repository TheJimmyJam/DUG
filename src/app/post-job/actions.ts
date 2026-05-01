"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { SPECIALTIES } from "@/lib/specialties";

// ---------------------------------------------------------------------------
// Post job
// ---------------------------------------------------------------------------

const schema = z.object({
  title: z.string().min(5).max(200),
  summary: z.string().min(20).max(500),
  description: z.string().min(50),
  job_type: z.enum([
    "renewal_review",
    "second_look",
    "new_business_advisory",
    "audit",
    "program_design",
    "other",
  ]),
  primary_specialty: z.string().min(1),
  difficulty: z.coerce.number().int().min(1).max(5),
  estimated_hours: z.coerce.number().int().min(1).max(200).optional().nullable(),
  budget_type: z.enum(["hourly", "flat", "volunteer"]),
  budget_dollars: z.coerce.number().int().min(0).optional().nullable(),
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
    primary_specialty: formData.get("primary_specialty"),
    difficulty: formData.get("difficulty"),
    estimated_hours: formData.get("estimated_hours") || null,
    budget_type: formData.get("budget_type"),
    budget_dollars: formData.get("budget_dollars") || null,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("jobs")
    .insert({
      poster_id: user.id,
      title: parsed.data.title,
      summary: parsed.data.summary,
      description: parsed.data.description,
      job_type: parsed.data.job_type,
      primary_specialty: parsed.data.primary_specialty,
      difficulty: parsed.data.difficulty,
      estimated_hours: parsed.data.estimated_hours ?? null,
      budget_cents:
        parsed.data.budget_type === "volunteer"
          ? 0
          : parsed.data.budget_dollars
            ? parsed.data.budget_dollars * 100
            : null,
      budget_type: parsed.data.budget_type,
      status: "open",
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
  job_type: "renewal_review" | "second_look" | "new_business_advisory" | "audit" | "program_design" | "other";
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

export async function generateJobAction(brief: string): Promise<GenerateResult> {
  if (!brief || brief.trim().length < 10) {
    return { ok: false, error: "Please write at least a sentence describing what you need." };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { ok: false, error: "AI generation is not configured." };

  const slugList = SPECIALTIES.map((s) => `${s.slug} (${s.label})`).join(", ");

  const systemPrompt = `You are an expert insurance underwriting job-posting writer for DUG (Decentralized Underwriting Group) — a marketplace connecting MGAs, carriers, and brokers with independent underwriters.

Your job: turn a client's rough description into a complete, professional job posting that will attract the right underwriter.

You MUST respond with ONLY valid JSON matching this exact shape (no markdown, no explanation, just the JSON object):
{
  "title": "string (5–120 chars, descriptive and specific)",
  "summary": "string (20–200 chars, one punchy sentence an underwriter skims in the job list)",
  "description": "string (150–600 chars, detailed risk description: what it is, key exposures, loss history if mentioned, what analysis is needed)",
  "job_type": "renewal_review" | "second_look" | "new_business_advisory" | "audit" | "program_design" | "other",
  "primary_specialty": "one slug from the list below",
  "additional_specialties": ["0–3 slugs from the list below"],
  "difficulty": 1 | 2 | 3 | 4 | 5,
  "estimated_hours": number or null,
  "budget_type": "flat" | "hourly" | "volunteer",
  "budget_dollars": number or null
}

job_type guidance:
- renewal_review: reviewing an expiring policy for changes
- second_look: sanity-checking a quote or submission already in progress
- new_business_advisory: appetite/pricing opinion on a new account
- audit: coverage gap or program audit
- program_design: building a new coverage program from scratch
- other: anything else

difficulty guidance (1=simple/vanilla, 5=highly complex/unusual):
- 1–2: standard commercial lines, clean history, known market
- 3: some complexity, minor loss history, moderate specialty
- 4: significant complexity, loss history, emerging or hard-to-place risk
- 5: extremely complex, no standard market, novel exposure

budget guidance: if unspecified, infer a reasonable flat fee based on difficulty and estimated hours (roughly $75–150/hr equivalent). Volunteer only if the client explicitly asks for it.

Available specialty slugs: ${slugList}

Pick the closest match. Do not invent new slugs.`;

  const userMessage = `Here is the client's brief description of what they need underwritten:\n\n${brief.trim()}`;

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

    // Strip any accidental markdown fences
    const cleaned = raw.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();

    let job: GeneratedJob;
    try {
      job = JSON.parse(cleaned);
    } catch {
      console.error("JSON parse error:", cleaned);
      return { ok: false, error: "Couldn't parse AI response. Try again or fill in manually." };
    }

    // Validate specialty slugs against known list
    const validSlugs = new Set(SPECIALTIES.map((s) => s.slug));
    if (!validSlugs.has(job.primary_specialty)) {
      // Fall back to first specialty if invalid
      job.primary_specialty = "general-liability";
    }
    job.additional_specialties = (job.additional_specialties ?? []).filter((s) =>
      validSlugs.has(s)
    );

    // Clamp difficulty
    job.difficulty = Math.max(1, Math.min(5, Math.round(job.difficulty ?? 3)));

    return { ok: true, job };
  } catch (e) {
    console.error("generateJobAction error:", e);
    return { ok: false, error: "Network error calling AI. Please try again." };
  }
}
