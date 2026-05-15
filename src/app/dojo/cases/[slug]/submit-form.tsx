"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Honeypot } from "@/components/honeypot";
import { useToast } from "@/components/toast";
import { submitDojoAnalysisAction, type SubmitResult } from "./actions";
import { ArrowRight } from "lucide-react";

const initial: SubmitResult | null = null;

export function SubmitForm({
  caseId,
  caseSlug,
  redFlagOptions,
}: {
  caseId: string;
  caseSlug: string;
  redFlagOptions: string[];
}) {
  const action = submitDojoAnalysisAction.bind(null, { caseId, caseSlug });
  const [state, formAction, pending] = useActionState(action, initial);
  const { toast } = useToast();
  const router = useRouter();
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && state) {
      if (state.ok) {
        toast({ kind: "success", title: "Submitted.", message: "Loading your scoring…" });
        router.push(`/dojo/cases/${caseSlug}/result`);
      } else {
        toast({ kind: "error", title: "Couldn't submit", message: state.error });
      }
    }
    wasPending.current = pending;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending, state]);

  return (
    <form
      action={formAction}
      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5"
    >
      <Honeypot />
      <div className="text-sm font-semibold">Your analysis</div>
      <p className="mt-1 text-xs text-[var(--color-muted)]">
        One submission per rep. Make it count — but don&apos;t overthink it.
      </p>

      <div className="mt-5 space-y-4">
        <div>
          <Label>Recommendation</Label>
          <div className="mt-1 grid gap-2 sm:grid-cols-2">
            {(
              [
                ["approve", "Approve / bind"],
                ["quote_with_modifications", "Quote w/ mods"],
                ["decline", "Decline"],
                ["needs_more_info", "Need more info"],
              ] as const
            ).map(([value, label]) => (
              <label
                key={value}
                className="flex cursor-pointer items-center gap-2 rounded-md border border-[var(--color-border)] p-2.5 text-sm has-[:checked]:border-[var(--color-primary)] has-[:checked]:bg-[var(--color-primary)]/5"
              >
                <input type="radio" name="recommendation" value={value} required />
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
            rows={8}
            required
            minLength={30}
            maxLength={5000}
            placeholder="Walk through the risk, your pricing read, key concerns, and recommendation."
          />
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            Min 30 chars, up to 5,000. Mention the factors you think matter — the grader is
            looking for breadth.
          </p>
        </div>

        <div>
          <Label htmlFor="premium_dollars">Suggested annual premium ($)</Label>
          <Input
            id="premium_dollars"
            name="premium_dollars"
            type="number"
            min={1}
            step={1000}
            required
            placeholder="2210000"
          />
        </div>

        {redFlagOptions.length > 0 && (
          <div>
            <Label>Red flags ({redFlagOptions.length} options — pick the ones that apply)</Label>
            <div className="mt-1 grid gap-1.5">
              {redFlagOptions.map((flag) => (
                <label
                  key={flag}
                  className="flex cursor-pointer items-start gap-2 rounded-md border border-[var(--color-border)] p-2 text-sm has-[:checked]:border-[var(--color-warning)] has-[:checked]:bg-[var(--color-warning)]/5"
                >
                  <input
                    type="checkbox"
                    name="red_flags"
                    value={flag}
                    className="mt-0.5"
                  />
                  <span>{flag}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div>
          <Label htmlFor="confidence">Confidence (1–5)</Label>
          <select
            id="confidence"
            name="confidence"
            required
            defaultValue="3"
            disabled={pending}
            className="flex h-10 w-full rounded-md border border-[var(--color-border)] bg-white dark:bg-[var(--color-bg)] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-1"
          >
            <option value="1">1 — guessing</option>
            <option value="2">2 — low</option>
            <option value="3">3 — medium</option>
            <option value="4">4 — high</option>
            <option value="5">5 — very high</option>
          </select>
        </div>
      </div>

      <Button type="submit" size="lg" variant="primary" className="mt-6 w-full" disabled={pending}>
        {pending ? "Scoring…" : "Submit for scoring"}
        {!pending && <ArrowRight className="h-4 w-4" />}
      </Button>
      {state && !state.ok && (
        <p className="mt-3 text-sm text-[var(--color-danger)]">{state.error}</p>
      )}
    </form>
  );
}
