"use server";

import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateReviewerProfileAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_carrier_reviewer")
    .eq("id", user.id)
    .single();
  if (!profile?.is_carrier_reviewer) throw new Error("Not authorized");

  const linkedin_url = (formData.get("linkedin_url") as string)?.trim() || null;
  const is_cpcu = formData.get("is_cpcu") === "on";

  // Basic LinkedIn URL validation
  if (linkedin_url && !linkedin_url.startsWith("https://www.linkedin.com/") && !linkedin_url.startsWith("https://linkedin.com/")) {
    throw new Error("Please enter a valid LinkedIn URL (https://www.linkedin.com/in/...)");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ linkedin_url, is_cpcu })
    .eq("id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/underwriter/profile");
  revalidatePath("/underwriter/cases");
  redirect("/underwriter/cases");
}
