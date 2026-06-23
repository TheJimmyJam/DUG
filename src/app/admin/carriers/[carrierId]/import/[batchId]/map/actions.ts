"use server";

import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import * as XLSX from "xlsx";

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

const CASE_FIELD_SET = new Set([
  "named_insured",
  "line_of_business",
  "exposure_basis_type",
  "exposure_basis_value",
  "construction_type",
  "protection_class",
  "loss_history_summary",
  "coverage_requested",
]);

export async function saveMappingAndImportAction(formData: FormData) {
  const user = await assertAdmin();
  const supabase = await createClient();

  const batchId = formData.get("batchId") as string;
  const carrierId = formData.get("carrierId") as string;

  // Build column mapping from form data
  const columnMapping: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    const match = key.match(/^mapping\[(.+)\]$/);
    if (match && value !== "skip") {
      columnMapping[match[1]] = value as string;
    }
  }

  // Fetch batch
  const { data: batch, error: batchErr } = await supabase
    .from("import_batches")
    .select("id, source_format, raw_file_url, field_mapping")
    .eq("id", batchId)
    .single();

  if (batchErr || !batch) throw new Error("Batch not found");

  // Update field_mapping with column mapping
  const existingMapping = (batch.field_mapping as Record<string, unknown>) ?? {};
  await supabase
    .from("import_batches")
    .update({ field_mapping: { ...existingMapping, columnMapping } })
    .eq("id", batchId);

  // Fetch and parse file
  let rows: Record<string, string>[] = [];

  if (batch.raw_file_url) {
    const fileResponse = await fetch(batch.raw_file_url);
    const buffer = await fileResponse.arrayBuffer();

    if (batch.source_format === "xlsx") {
      const wb = XLSX.read(buffer);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);
      rows = rawRows.map((r) => {
        const mapped: Record<string, string> = {};
        for (const [col, field] of Object.entries(columnMapping)) {
          if (CASE_FIELD_SET.has(field) && r[col] !== undefined) {
            mapped[field] = String(r[col]);
          }
        }
        return mapped;
      });
    } else {
      // CSV
      const text = new TextDecoder().decode(buffer);
      const lines = text.split("\n").filter(Boolean);
      const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""));
        const mapped: Record<string, string> = {};
        headers.forEach((h, idx) => {
          const field = columnMapping[h];
          if (field && CASE_FIELD_SET.has(field)) {
            mapped[field] = values[idx] ?? "";
          }
        });
        rows.push(mapped);
      }
    }
  }

  // Insert carrier_cases
  const cases = rows
    .filter((r) => r.named_insured?.trim())
    .map((r) => ({
      batch_id: batchId,
      carrier_id: carrierId,
      named_insured: r.named_insured,
      line_of_business: r.line_of_business ?? null,
      exposure_basis_type: r.exposure_basis_type ?? null,
      exposure_basis_value: r.exposure_basis_value ? parseFloat(r.exposure_basis_value) : null,
      construction_type: r.construction_type ?? null,
      protection_class: r.protection_class ?? null,
      loss_history_summary: r.loss_history_summary ?? null,
      coverage_requested: r.coverage_requested ?? null,
    }));

  if (cases.length > 0) {
    const { error: insertErr } = await supabase.from("carrier_cases").insert(cases);
    if (insertErr) throw new Error(insertErr.message);
  }

  // Mark batch imported
  await supabase
    .from("import_batches")
    .update({ status: "imported" })
    .eq("id", batchId);

  redirect("/admin/cases");
}
