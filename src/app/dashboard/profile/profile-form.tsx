"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { useToastOnAction } from "@/components/toast";
import { saveProfileAction, type ProfileActionResult } from "./actions";
import type { Specialty, SpecialtyGroup } from "@/lib/specialties";
import type { Database } from "@/lib/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"] | null;

type Props = {
  profile: Profile;
  selectedSpecialties: string[];
  specialtyGroups: SpecialtyGroup[];
  grouped: Record<SpecialtyGroup, Specialty[]>;
};

const initial: ProfileActionResult | null = null;

export function ProfileForm({
  profile,
  selectedSpecialties,
  specialtyGroups,
  grouped,
}: Props) {
  const [state, action, pending] = useActionState(saveProfileAction, initial);
  useToastOnAction(state, pending, {
    success: {
      title: "Profile saved",
      message: "Your changes are live on your public profile.",
    },
    errorTitle: "Couldn't save profile",
  });
  const selected = new Set(selectedSpecialties ?? []);
  const safeGroups = specialtyGroups ?? [];
  const safeGrouped = grouped ?? ({} as Record<SpecialtyGroup, Specialty[]>);

  return (
    <form action={action} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="handle">Handle</Label>
          <Input
            id="handle"
            name="handle"
            defaultValue={profile?.handle ?? ""}
            required
            minLength={3}
            maxLength={32}
            pattern="[a-zA-Z0-9_-]+"
          />
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            Your public URL: dug.app/u/{profile?.handle ?? "your-handle"}
          </p>
        </div>
        <div>
          <Label htmlFor="display_name">Display name</Label>
          <Input
            id="display_name"
            name="display_name"
            defaultValue={profile?.display_name ?? ""}
            required
            minLength={2}
            maxLength={60}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          name="bio"
          rows={5}
          defaultValue={profile?.bio ?? ""}
          placeholder="Brief bio. Specialties, years of experience, types of risks you've handled. Posters scan this when deciding whether to work with you."
          maxLength={2000}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="location_city">City</Label>
          <Input
            id="location_city"
            name="location_city"
            defaultValue={profile?.location_city ?? ""}
            maxLength={80}
          />
        </div>
        <div>
          <Label htmlFor="location_state">State</Label>
          <Input
            id="location_state"
            name="location_state"
            defaultValue={profile?.location_state ?? ""}
            maxLength={80}
          />
        </div>
        <div>
          <Label htmlFor="years_experience">Years of experience</Label>
          <Input
            id="years_experience"
            name="years_experience"
            type="number"
            min={0}
            max={60}
            defaultValue={profile?.years_experience ?? ""}
          />
        </div>
      </div>

      <div>
        <Label>Role</Label>
        <div className="mt-1 flex flex-wrap gap-3 text-sm">
          {(["underwriter", "both", "poster"] as const).map((r) => (
            <label key={r} className="flex items-center gap-2">
              <input
                type="radio"
                name="role"
                value={r}
                defaultChecked={(profile?.role ?? "underwriter") === r}
              />
              <span className="capitalize">{r}</span>
            </label>
          ))}
        </div>
        <p className="mt-1 text-xs text-[var(--color-muted)]">
          Underwriters claim and analyze jobs. Posters submit them. &ldquo;Both&rdquo; lets
          you do either.
        </p>
      </div>

      <div>
        <Label>Specialties</Label>
        <p className="mt-0.5 mb-3 text-xs text-[var(--color-muted)]">
          Tag the areas you can confidently analyze. We use these for matching.
        </p>
        <div className="space-y-4">
          {safeGroups.map((group) => {
            const items = safeGrouped[group] ?? [];
            if (items.length === 0) return null;
            return (
              <fieldset key={group}>
                <legend className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                  {group}
                </legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {items.map((s) => {
                    const isOn = selected.has(s.slug);
                    return (
                      <label
                        key={s.slug}
                        className="cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          name="specialties"
                          value={s.slug}
                          defaultChecked={isOn}
                          className="peer sr-only"
                        />
                        <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors peer-checked:bg-[var(--color-primary)] peer-checked:text-[var(--color-primary-fg)] peer-checked:border-[var(--color-primary)] hover:bg-[var(--color-border)]/50">
                          {s.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? "Saving…" : "Save profile"}
        </Button>
      </div>
    </form>
  );
}
