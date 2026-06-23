"use server";

import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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

export async function assignCaseAction(formData: FormData) {
  await assertAdmin();
  const supabase = await createClient();

  const caseId = formData.get("caseId") as string;
  const underwriterId = (formData.get("underwriterId") as string) || null;

  const { error } = await supabase
    .from("carrier_cases")
    .update({ assigned_underwriter_id: underwriterId, status: underwriterId ? "in_review" : "new" })
    .eq("id", caseId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/cases");
}

export async function markBatchReadyAction(formData: FormData) {
  await assertAdmin();
  const supabase = await createClient();

  const batchId = formData.get("batchId") as string;

  const { error } = await supabase
    .from("import_batches")
    .update({ status: "ready_for_review" })
    .eq("id", batchId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/cases");
}
