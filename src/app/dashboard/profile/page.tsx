import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { ProfileForm } from "./profile-form";
import {
  SPECIALTIES,
  SPECIALTY_GROUPS,
  type SpecialtyGroup,
} from "@/lib/specialties";

export const metadata = { title: "Edit profile" };

export default async function EditProfilePage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = await createClient();

  const [{ data: profile }, { data: specialtyRows }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase
      .from("profile_specialties")
      .select("specialty_slug")
      .eq("profile_id", user.id),
  ]);

  const selectedSpecialties = (specialtyRows ?? []).map((r) => r.specialty_slug);

  // Group the specialty list for the form
  const grouped: Record<SpecialtyGroup, typeof SPECIALTIES> = {
    Property: [],
    Liability: [],
    Specialty: [],
    Emerging: [],
    Personal: [],
    Other: [],
  };
  for (const s of SPECIALTIES) grouped[s.group].push(s);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-semibold tracking-tight">Your profile</h1>
      <p className="mt-1 text-[var(--color-muted)]">
        Public-facing. Posters see this when deciding whether to work with you.
      </p>

      <Card className="mt-6">
        <CardContent className="pt-6">
          <ProfileForm
            profile={profile}
            selectedSpecialties={selectedSpecialties}
            specialtyGroups={SPECIALTY_GROUPS}
            grouped={grouped}
          />
        </CardContent>
      </Card>
    </div>
  );
}
