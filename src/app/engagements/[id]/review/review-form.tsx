"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Label, Textarea } from "@/components/ui/input";
import { reviewSubmissionAction, type Result } from "../actions";

const initial: Result | null = null;

export function ReviewForm({ jobId }: { jobId: string }) {
  const action = reviewSubmissionAction.bind(null, jobId);
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label>Rating</Label>
        <div className="mt-1 flex gap-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <label
              key={n}
              className="cursor-pointer rounded-md border px-4 py-2 text-sm font-medium has-[:checked]:border-[var(--color-primary)] has-[:checked]:bg-[var(--color-primary)] has-[:checked]:text-[var(--color-primary-fg)]"
            >
              <input
                type="radio"
                name="rating"
                value={n}
                required
                className="sr-only"
              />
              {n}
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="feedback">Feedback (optional)</Label>
        <Textarea
          id="feedback"
          name="feedback"
          rows={5}
          maxLength={2000}
          placeholder="What was useful? What would you want different next time?"
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

      <Button type="submit" variant="primary" size="lg" disabled={pending}>
        {pending ? "Submitting…" : "Submit review and complete job"}
      </Button>
    </form>
  );
}
