"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

const profileSchema = z.object({
  handle: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[a-zA-Z0-9_-]+$/, "Letters, numbers, _ and - only"),
  display_name: z.string().min(2).max(60),
  bio: z.string().max(2000).optional().nullable(),
  location_city: z.string().max(80).optional().nullable(),
  location_state: z.string().max(80).optional().nullable(),
  years_experience: z
    .union([z.coerce.number().int().min(0).max(60), z.null()])
    .optional(),
  role: z.enum(["underwriter", "poster", "both"]),
  specialties: z.array(z.string()).default([]),
});

export type ProfileActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function saveProfileAction(
  _prev: ProfileActionResult | null,
  formData: FormData,
): Promise<ProfileActionResult> {
  try {
    const specialties = formData.getAll("specialties").map(String);

    const yearsRaw = formData.get("years_experience");
    const yearsValue =
      yearsRaw === null || yearsRaw === "" ? null : yearsRaw;

    const parsed = profileSchema.safeParse({
      handle: formData.get("handle"),
      display_name: formData.get("display_name"),
      bio: formData.get("bio") || null,
      location_city: formData.get("location_city") || null,
      location_state: formData.get("location_state") || null,
      years_experience: yearsValue,
      role: formData.get("role"),
      specialties,
    });

    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0].message };
    }

    const user = await getCurrentUser();
    if (!user) return { ok: false, error: "Not authenticated" };
    const supabase = await createClient();

    const { error: upErr } = await supabase
      .from("profiles")
      .update({
        handle: parsed.data.handle,
        display_name: parsed.data.display_name,
        bio: parsed.data.bio ?? null,
        location_city: parsed.data.location_city ?? null,
        location_state: parsed.data.location_state ?? null,
        years_experience: parsed.data.years_experience ?? null,
        role: parsed.data.role,
      })
      .eq("id", user.id);

    if (upErr) {
      // Common cases: handle already taken (unique violation) → friendlier copy.
      const msg =
        upErr.code === "23505"
          ? "That handle is already taken. Pick another."
          : upErr.message;
      return { ok: false, error: msg };
    }

    // Replace specialties: delete + insert. Small set, simpler than diff.
    const { error: delErr } = await supabase
      .from("profile_specialties")
      .delete()
      .eq("profile_id", user.id);
    if (delErr) return { ok: false, error: delErr.message };

    if (parsed.data.specialties.length > 0) {
      const rows = parsed.data.specialties.map((slug) => ({
        profile_id: user.id,
        specialty_slug: slug,
      }));
      const { error: insErr } = await supabase
        .from("profile_specialties")
        .insert(rows);
      if (insErr) return { ok: false, error: insErr.message };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/profile");
    revalidatePath(`/u/${parsed.data.handle}`);
    revalidatePath("/underwriters");
    return { ok: true };
  } catch (err) {
    // Any unexpected throw becomes a structured error instead of a 500.
    const message =
      err instanceof Error ? err.message : "Unknown error saving profile";
    console.error("[saveProfileAction] unexpected:", err);
    return { ok: false, error: message };
  }
}
