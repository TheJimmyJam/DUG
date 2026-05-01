"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { postJobAction, type Result } from "./actions";
import type { Specialty, SpecialtyGroup } from "@/lib/specialties";

const initial: Result | null = null;

const JOB_TYPES = [
  ["renewal_review", "Renewal review"],
  ["second_look", "Second look"],
  ["new_business_advisory", "New business advisory"],
  ["audit", "Audit"],
  ["program_design", "Program design"],
  ["other", "Other"],
] as const;

export function PostJobForm({
  specialties,
  specialtyGroups,
}: {
  specialties: Specialty[];
  specialtyGroups: SpecialtyGroup[];
}) {
  const [state, action, pending] = useActionState(postJobAction, initial);
  const [budgetType, setBudgetType] = useState<"hourly" | "flat" | "volunteer">(
    "flat",
  );

  return (
    <form action={action} className="space-y-5">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          required
          minLength={5}
          maxLength={200}
          placeholder="e.g. Indoor trampoline park — second look on GL pricing"
        />
      </div>

      <div>
        <Label htmlFor="summary">One-line summary</Label>
        <Input
          id="summary"
          name="summary"
          required
          minLength={20}
          maxLength={500}
          placeholder="A sentence that helps the right underwriter spot it."
        />
      </div>

      <div>
        <Label htmlFor="description">Full risk description</Label>
        <Textarea
          id="description"
          name="description"
          rows={8}
          required
          minLength={50}
          placeholder="Operations, exposure, loss history, what specifically you want analyzed."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="job_type">Type</Label>
          <select
            id="job_type"
            name="job_type"
            required
            className="mt-0 flex h-10 w-full rounded-md border bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          >
            {JOB_TYPES.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="primary_specialty">Primary specialty</Label>
          <select
            id="primary_specialty"
            name="primary_specialty"
            required
            className="mt-0 flex h-10 w-full rounded-md border bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          >
            <option value="">Select…</option>
            {specialtyGroups.map((g) => {
              const items = specialties.filter((s) => s.group === g);
              if (items.length === 0) return null;
              return (
                <optgroup key={g} label={g}>
                  {items.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.label}
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="difficulty">Difficulty (1-5)</Label>
          <Input
            id="difficulty"
            name="difficulty"
            type="number"
            min={1}
            max={5}
            defaultValue={3}
            required
          />
        </div>
        <div>
          <Label htmlFor="estimated_hours">Estimated hours</Label>
          <Input
            id="estimated_hours"
            name="estimated_hours"
            type="number"
            min={1}
            max={200}
            placeholder="e.g. 4"
          />
        </div>
        <div>
          <Label htmlFor="budget_type">Budget type</Label>
          <select
            id="budget_type"
            name="budget_type"
            value={budgetType}
            onChange={(e) =>
              setBudgetType(e.target.value as typeof budgetType)
            }
            className="mt-0 flex h-10 w-full rounded-md border bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          >
            <option value="flat">Flat fee</option>
            <option value="hourly">Hourly</option>
            <option value="volunteer">Volunteer / portfolio</option>
          </select>
        </div>
      </div>

      {budgetType !== "volunteer" && (
        <div>
          <Label htmlFor="budget_dollars">
            Budget ({budgetType === "hourly" ? "$/hr" : "total $"})
          </Label>
          <Input
            id="budget_dollars"
            name="budget_dollars"
            type="number"
            min={0}
            placeholder="e.g. 500"
          />
        </div>
      )}

      {state?.ok === false && (
        <div
          role="alert"
          className="rounded-md border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 p-3 text-sm text-[var(--color-danger)]"
        >
          {state.error}
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={pending}
        className="w-full sm:w-auto"
      >
        {pending ? "Posting…" : "Post job"}
      </Button>
    </form>
  );
}
