"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { upsertSubmissionAction, type Result } from "../actions";
import type { Database } from "@/lib/database.types";

type Submission = Database["public"]["Tables"]["submissions"]["Row"];

const initial: Result | null = null;

export function SubmissionForm({
  jobId,
  existing,
}: {
  jobId: string;
  existing: Submission | null;
}) {
  const action = upsertSubmissionAction.bind(null, jobId);
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <Label>Recommendation</Label>
        <div className="mt-1 grid gap-2 sm:grid-cols-2">
          {(
            [
              ["approve", "Approve / bind"],
              ["quote_with_modifications", "Quote w/ modifications"],
              ["decline", "Decline"],
              ["needs_more_info", "Need more info"],
            ] as const
          ).map(([value, label]) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-2 rounded-md border p-3 text-sm has-[:checked]:border-[var(--color-primary)] has-[:checked]:bg-[var(--color-primary)]/5"
            >
              <input
                type="radio"
                name="recommendation"
                value={value}
                required
                defaultChecked={existing?.recommendation === value}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="rationale">Rationale</Label>
        <Textarea
          id="rationale"
          name="rationale"
          rows={10}
          required
          minLength={50}
          defaultValue={existing?.rationale ?? ""}
          placeholder="Walk through your reasoning. What's the loss profile? What's the appetite? What modifications would tip this from decline to bind?"
        />
        <p className="mt-1 text-xs text-[var(--color-muted)]">
          Minimum 50 characters. Posters use this to decide whether to act on
          your recommendation.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="suggested_premium_cents">
            Suggested premium (USD, optional)
          </Label>
          <Input
            id="suggested_premium_cents"
            name="suggested_premium_cents"
            type="number"
            min={0}
            step={1}
            placeholder="e.g. 8500"
            defaultValue={
              existing?.suggested_premium_cents != null
                ? Math.round(existing.suggested_premium_cents / 100)
                : ""
            }
          />
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            Whole dollars (we store cents).
          </p>
        </div>
        <div>
          <Label htmlFor="confidence">Confidence (1–5)</Label>
          <Input
            id="confidence"
            name="confidence"
            type="number"
            min={1}
            max={5}
            required
            defaultValue={existing?.confidence ?? 3}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="red_flags">Red flags (one per line)</Label>
        <Textarea
          id="red_flags"
          name="red_flags"
          rows={4}
          placeholder={
            "e.g.\nNo documented evacuation plan\nLive actor interactions\nWaiver enforcement is informal"
          }
          defaultValue={(existing?.red_flags ?? []).join("\n")}
        />
      </div>

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
        {pending ? "Submitting…" : existing ? "Update analysis" : "Submit analysis"}
      </Button>

      <p className="text-xs text-[var(--color-muted)]">
        By submitting, you affirm this is advisory analysis only and that you
        are not binding coverage on behalf of any insurer.
      </p>
    </form>
  );
}
