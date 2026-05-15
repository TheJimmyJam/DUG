"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isHoneypotTripped } from "@/lib/honeypot";
import { checkRateLimit, rateLimitErrorMessage } from "@/lib/rate-limit";

const RECOMMENDATIONS = [
  "approve",
  "decline",
  "quote_with_modifications",
  "needs_more_info",
] as const;

const schema = z.object({
  rationale: z.string().min(30, "Rationale must be at least 30 characters.").max(5000),
  premium_dollars: z.coerce.number().int().min(1, "Premium must be a positive number."),
  recommendation: z.enum(RECOMMENDATIONS),
  red_flags: z.array(z.string()).max(20),
  confidence: z.coerce.number().int().min(1).max(5),
});

export type SubmitResult = { ok: true; submissionId: string } | { ok: false; error: string };

type KeyFactor = {
  label: string;
  match: string[];
  weight?: number;
};

/**
 * Score the rationale's coverage of the model key factors.
 * Returns 0..50, plus the matched/missed labels for the result page.
 */
function scoreFactors(
  rationale: string,
  keyFactors: KeyFactor[],
): { score: number; matched: string[]; missed: string[] } {
  if (!keyFactors.length) return { score: 50, matched: [], missed: [] };
  const haystack = rationale.toLowerCase();

  const matched: string[] = [];
  const missed: string[] = [];
  let weightSum = 0;
  let weightHit = 0;

  for (const factor of keyFactors) {
    const w = factor.weight ?? 1;
    weightSum += w;
    const hit = factor.match.some((needle) =>
      haystack.includes(needle.toLowerCase()),
    );
    if (hit) {
      matched.push(factor.label);
      weightHit += w;
    } else {
      missed.push(factor.label);
    }
  }

  const score = Math.round((weightHit / Math.max(1, weightSum)) * 50);
  return { score, matched, missed };
}

/**
 * Score the user's premium suggestion against the model band.
 * 50 points if inside the band, scaled down to 0 outside.
 */
function scorePremium(
  premiumCents: number,
  modelLow: number,
  modelHigh: number,
): number {
  if (premiumCents >= modelLow && premiumCents <= modelHigh) return 50;

  const mid = (modelLow + modelHigh) / 2;
  const halfBand = Math.max(1, (modelHigh - modelLow) / 2);
  const distance = Math.abs(premiumCents - mid);
  // Inside half-band → 50; 2× outside → 25; 4× outside → 0.
  const ratio = distance / halfBand;
  if (ratio <= 1) return 50;
  if (ratio >= 4) return 0;
  // Smooth fall-off from 50 at ratio=1 to 0 at ratio=4
  return Math.max(0, Math.round(50 - ((ratio - 1) / 3) * 50));
}

export async function submitDojoAnalysisAction(
  ctx: { caseId: string; caseSlug: string },
  _prev: SubmitResult | null,
  formData: FormData,
): Promise<SubmitResult> {
  // Honeypot — silent success.
  if (isHoneypotTripped(formData)) {
    return { ok: true, submissionId: "honeypot" };
  }

  // Pull all `red_flags` checkbox values
  const redFlags = formData.getAll("red_flags").map((v) => String(v));

  const parsed = schema.safeParse({
    rationale: formData.get("rationale"),
    premium_dollars: formData.get("premium_dollars"),
    recommendation: formData.get("recommendation"),
    red_flags: redFlags,
    confidence: formData.get("confidence"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in to submit." };

  // Rate-limit Dojo submissions: 10 per user per hour. The DB-level unique
  // constraint already enforces 1-per-case-per-user, but this caps the
  // total submission rate (defense against brute-force scoring attempts).
  const rl = await checkRateLimit({
    action: "dojo_submit",
    scope: "user",
    identifier: user.id,
    maxCount: 10,
    windowSeconds: 3600,
  });
  if (!rl.allowed) {
    return { ok: false, error: rateLimitErrorMessage(rl) };
  }

  // Fetch the answer key with the service client so RLS doesn't tease it
  // (we're computing the score server-side; the user never sees it raw).
  const service = createServiceClient();
  const { data: dojoCase, error: caseErr } = await service
    .from("dojo_cases")
    .select(
      "id, status, model_premium_low_cents, model_premium_high_cents, key_factors, model_red_flags",
    )
    .eq("id", ctx.caseId)
    .maybeSingle();

  if (caseErr || !dojoCase) {
    return { ok: false, error: "Case not found." };
  }
  if (dojoCase.status !== "published") {
    return { ok: false, error: "This case isn't open for submissions." };
  }

  const premiumCents = parsed.data.premium_dollars * 100;
  const premiumScore = scorePremium(
    premiumCents,
    Number(dojoCase.model_premium_low_cents),
    Number(dojoCase.model_premium_high_cents),
  );

  const factors = scoreFactors(
    parsed.data.rationale,
    (dojoCase.key_factors as unknown as KeyFactor[]) ?? [],
  );

  const totalScore = Math.max(0, Math.min(100, premiumScore + factors.score));

  // Insert (RLS allows user-owned insert)
  const { data: inserted, error: insertErr } = await supabase
    .from("dojo_submissions")
    .insert({
      case_id: ctx.caseId,
      user_id: user.id,
      rationale: parsed.data.rationale,
      premium_cents: premiumCents,
      recommendation: parsed.data.recommendation,
      red_flags: parsed.data.red_flags,
      confidence: parsed.data.confidence,
      score: totalScore,
      premium_score: premiumScore,
      factors_score: factors.score,
      matched_factors: factors.matched,
      missed_factors: factors.missed,
    })
    .select("id")
    .single();

  if (insertErr) {
    const code = (insertErr as { code?: string }).code;
    if (code === "23505") {
      return { ok: false, error: "You've already submitted this case. Refresh to see your score." };
    }
    console.error("[dojo submit] insert error:", insertErr);
    return { ok: false, error: "Couldn't save your submission. Try again." };
  }

  revalidatePath(`/dojo/cases/${ctx.caseSlug}`);
  revalidatePath(`/dojo/cases/${ctx.caseSlug}/result`);
  return { ok: true, submissionId: inserted.id };
}
