"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type Result = { ok: true } | { ok: false; error: string };

/* -------------------------------------------------------------------------- */
/* Claim                                                                       */
/* -------------------------------------------------------------------------- */
export async function claimJobAction(jobId: string): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  // The RLS policy enforces: status=open, claimed_by null, and that the
  // updater sets claimed_by = themselves. The trigger flips status -> claimed.
  const { error } = await supabase
    .from("jobs")
    .update({ claimed_by: user.id, status: "claimed" })
    .eq("id", jobId)
    .eq("status", "open")
    .is("claimed_by", null);

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/jobs/${jobId}`);
  revalidatePath(`/jobs`);
  revalidatePath(`/dashboard/jobs`);
  return { ok: true };
}

/* -------------------------------------------------------------------------- */
/* Submit / update analysis                                                    */
/* -------------------------------------------------------------------------- */
const submissionSchema = z.object({
  recommendation: z.enum([
    "approve",
    "decline",
    "quote_with_modifications",
    "needs_more_info",
  ]),
  rationale: z.string().min(50, "Rationale must be at least 50 characters."),
  suggested_premium_cents: z.coerce
    .number()
    .int()
    .min(0)
    .optional()
    .nullable(),
  red_flags: z
    .string()
    .optional()
    .transform((s) =>
      (s ?? "")
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean),
    ),
  confidence: z.coerce.number().int().min(1).max(5),
});

export async function upsertSubmissionAction(
  jobId: string,
  _prev: Result | null,
  formData: FormData,
): Promise<Result> {
  const parsed = submissionSchema.safeParse({
    recommendation: formData.get("recommendation"),
    rationale: formData.get("rationale"),
    suggested_premium_cents: formData.get("suggested_premium_cents") || null,
    red_flags: formData.get("red_flags"),
    confidence: formData.get("confidence"),
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  // Upsert keyed on (job_id, underwriter_id) — DB constraint enforces uniqueness.
  const { error: subErr } = await supabase
    .from("submissions")
    .upsert(
      {
        job_id: jobId,
        underwriter_id: user.id,
        recommendation: parsed.data.recommendation,
        rationale: parsed.data.rationale,
        suggested_premium_cents: parsed.data.suggested_premium_cents ?? null,
        red_flags: parsed.data.red_flags,
        confidence: parsed.data.confidence,
      },
      { onConflict: "job_id,underwriter_id" },
    );

  if (subErr) return { ok: false, error: subErr.message };

  // Move the job to "submitted" so the poster sees the review CTA.
  await supabase
    .from("jobs")
    .update({ status: "submitted" })
    .eq("id", jobId)
    .eq("claimed_by", user.id);

  revalidatePath(`/jobs/${jobId}`);
  revalidatePath(`/dashboard/jobs`);
  redirect(`/jobs/${jobId}`);
}

/* -------------------------------------------------------------------------- */
/* Poster review                                                               */
/* -------------------------------------------------------------------------- */
const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  feedback: z.string().max(2000).optional().nullable(),
});

export async function reviewSubmissionAction(
  jobId: string,
  _prev: Result | null,
  formData: FormData,
): Promise<Result> {
  const parsed = reviewSchema.safeParse({
    rating: formData.get("rating"),
    feedback: formData.get("feedback") || null,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  // Look up the submission for this job
  const { data: sub } = await supabase
    .from("submissions")
    .select("id, underwriter_id")
    .eq("job_id", jobId)
    .maybeSingle();
  if (!sub) return { ok: false, error: "No submission to review yet." };

  const { error } = await supabase.from("reviews").insert({
    job_id: jobId,
    submission_id: sub.id,
    poster_id: user.id,
    underwriter_id: sub.underwriter_id,
    rating: parsed.data.rating,
    feedback: parsed.data.feedback,
  });
  if (error) return { ok: false, error: error.message };

  // Mark job completed
  await supabase
    .from("jobs")
    .update({ status: "completed" })
    .eq("id", jobId)
    .eq("poster_id", user.id);

  revalidatePath(`/jobs/${jobId}`);
  revalidatePath(`/u/${sub.underwriter_id}`);
  redirect(`/jobs/${jobId}`);
}
