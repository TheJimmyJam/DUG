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

export async function createCarrierUserAction(formData: FormData) {
  await assertAdmin();

  const email = (formData.get("email") as string)?.trim();
  const carrierId = formData.get("carrierId") as string;
  if (!email) throw new Error("Email is required");
  if (!carrierId) throw new Error("Carrier ID is required");

  const service = createServiceClient();

  // Check if a user with this email already exists in auth
  const { data: existingUsers } = await service.auth.admin.listUsers();
  const existing = existingUsers?.users?.find((u) => u.email === email);

  let authId: string;

  if (existing) {
    authId = existing.id;
  } else {
    // Send invite — they'll get a magic link to set their password
    const { data: invited, error: inviteErr } = await service.auth.admin.inviteUserByEmail(email);
    if (inviteErr) throw new Error(inviteErr.message);
    authId = invited.user.id;
  }

  // Insert into carrier_users (ignore conflict if already exists for this carrier)
  const { error: insertErr } = await service
    .from("carrier_users")
    .insert({ carrier_id: carrierId, email, auth_id: authId });

  if (insertErr) {
    // Unique constraint on email — user already added to this carrier
    if (insertErr.code === "23505") {
      throw new Error("This email is already a user for this carrier.");
    }
    throw new Error(insertErr.message);
  }

  revalidatePath(`/admin/carriers/${carrierId}/users`);
  redirect(`/admin/carriers/${carrierId}/users`);
}
