"use server";

import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function submitCaseAnalysisAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_carrier_reviewer")
    .eq("id", user.id)
    .single();
  if (!profile?.is_carrier_reviewer) throw new Error("Not authorized");

  const caseId = formData.get("caseId") as string;

  // Verify this case is assigned to the current user (query view)
  const { data: caseRow } = await supabase
    .from("carrier_cases_underwriter_view")
    .select("id, assigned_underwriter_id")
    .eq("id", caseId)
    .single();

  if (!caseRow || caseRow.assigned_underwriter_id !== user.id) {
    throw new Error("Not authorized to review this case");
  }

  const { error: analysisErr } = await supabase.from("carrier_case_analyses").insert({
    case_id: caseId,
    underwriter_id: user.id,
    key_exposures: (formData.get("key_exposures") as string) || null,
    missing_information: (formData.get("missing_information") as string) || null,
    recommendation: (formData.get("recommendation") as string) || null,
    suggested_price_structure: (formData.get("suggested_price_structure") as string) || null,
    reasoning: (formData.get("reasoning") as string) || null,
  });

  if (analysisErr) throw new Error(analysisErr.message);

  // Update case status
  await supabase
    .from("carrier_cases")
    .update({ status: "in_review" })
    .eq("id", caseId);

  revalidatePath(`/underwriter/cases/${caseId}`);
  revalidatePath("/underwriter/cases");
  redirect("/underwriter/cases");
}
