"use server";

import { createClient, createServiceClient, getCurrentUser } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
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

export async function createCarrierAction(formData: FormData) {
  await assertAdmin();
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const contact_email = (formData.get("contact_email") as string) || null;

  if (!name?.trim()) throw new Error("Carrier name is required");

  const { error } = await supabase.from("carriers").insert({ name: name.trim(), contact_email });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/carriers");
}

export async function inviteCarrierReviewerAction(formData: FormData) {
  await assertAdmin();

  const email = formData.get("email") as string;
  if (!email?.trim()) throw new Error("Email is required");

  const service = createServiceClient();

  // Invite via Supabase auth
  const { data: invited, error: inviteErr } = await service.auth.admin.inviteUserByEmail(email.trim());
  if (inviteErr) throw new Error(inviteErr.message);

  if (invited?.user) {
    // Upsert profile with is_carrier_reviewer = true
    await service
      .from("profiles")
      .upsert({ id: invited.user.id, is_carrier_reviewer: true }, { onConflict: "id" });
  }

  revalidatePath("/admin/underwriters/invite");
  redirect("/admin/underwriters/invite");
}
