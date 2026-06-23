"use server";

import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

async function assertAdmin() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_admin) throw new Error("Not authorized — admin only");
  return user;
}

export async function createManualCaseAction(formData: FormData) {
  const user = await assertAdmin();
  const supabase = await createClient();

  const carrierId = formData.get("carrierId") as string;
  const named_insured = (formData.get("named_insured") as string)?.trim();
  if (!named_insured) throw new Error("Named insured is required");

  // Create a manual batch
  const { data: batch, error: batchErr } = await supabase
    .from("import_batches")
    .insert({
      carrier_id: carrierId,
      source_format: "manual",
      imported_by: user.id,
      status: "imported",
    })
    .select("id")
    .single();

  if (batchErr) throw new Error(batchErr.message);

  const exposureValueRaw = formData.get("exposure_basis_value") as string;
  const exposure_basis_value = exposureValueRaw ? parseFloat(exposureValueRaw) : null;

  const { error: caseErr } = await supabase.from("carrier_cases").insert({
    batch_id: batch.id,
    carrier_id: carrierId,
    named_insured,
    line_of_business: (formData.get("line_of_business") as string) || null,
    exposure_basis_type: (formData.get("exposure_basis_type") as string) || null,
    exposure_basis_value: isNaN(exposure_basis_value!) ? null : exposure_basis_value,
    construction_type: (formData.get("construction_type") as string) || null,
    protection_class: (formData.get("protection_class") as string) || null,
    loss_history_summary: (formData.get("loss_history_summary") as string) || null,
    coverage_requested: (formData.get("coverage_requested") as string) || null,
  });

  if (caseErr) throw new Error(caseErr.message);

  redirect("/admin/cases");
}
