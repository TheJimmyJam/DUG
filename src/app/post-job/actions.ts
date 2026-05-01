"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

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
