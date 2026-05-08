"use client";

import { useActionState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast";
import { ArrowRight, CheckCircle } from "lucide-react";
import { joinDojoWaitlistAction, type WaitlistResult } from "./actions";

const ROLE_HINTS = [
  { value: "claims_adjuster",   label: "Claims adjuster" },
  { value: "premium_auditor",   label: "Premium auditor" },
  { value: "subject_expert",    label: "Subject matter expert" },
  { value: "career_changer",    label: "Career changer" },
  { value: "junior_uw",         label: "Junior underwriter" },
  { value: "experienced_uw",    label: "Experienced underwriter" },
  { value: "carrier_partner",   label: "Carrier / data partner" },
  { value: "curious",           label: "Just curious" },
];

export function WaitlistForm({ variant = "card" }: { variant?: "card" | "inline" }) {
  const [state, action, pending] = useActionState<WaitlistResult | null, FormData>(
    joinDojoWaitlistAction,
    null,
  );
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && state) {
      if (state.ok) {
        toast({
          kind: "success",
          title: "You're in.",
          message: "We'll email when the Dojo opens.",
        });
        formRef.current?.reset();
      } else {
        toast({
          kind: "error",
          title: "Couldn't add you",
          message: state.error,
        });
      }
    }
    wasPending.current = pending;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending, state]);

  const ok = state?.ok === true;

  if (variant === "inline") {
    return (
      <form
        ref={formRef}
        action={action}
        className="flex w-full max-w-xl flex-col gap-2 sm:flex-row"
      >
        <Input
          name="email"
          type="email"
          required
          placeholder="you@work.com"
          aria-label="Your email"
          className="flex-1 bg-white text-[var(--color-fg)]"
          disabled={pending}
        />
        <input type="hidden" name="referrer" value="/dojo#cta-inline" />
        <Button
          type="submit"
          size="lg"
          className="bg-white text-[var(--color-accent)] hover:bg-white/90"
          disabled={pending}
        >
          {pending ? "Saving…" : ok ? (
            <>
              On the list
              <CheckCircle className="h-4 w-4" />
            </>
          ) : (
            <>
              Join the waitlist
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    );
  }

  return (
    <form
      ref={formRef}
      action={action}
      className="grid gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5"
    >
      <div>
        <label className="mb-1.5 block text-sm font-medium" htmlFor="dojo-email">
          Email
        </label>
        <Input
          id="dojo-email"
          name="email"
          type="email"
          required
          placeholder="you@work.com"
          disabled={pending}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium" htmlFor="dojo-role">
          What best describes you? <span className="text-[var(--color-muted)]">(optional)</span>
        </label>
        <select
          id="dojo-role"
          name="role_hint"
          defaultValue=""
          disabled={pending}
          className="flex h-10 w-full rounded-md border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-fg)] dark:bg-[var(--color-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-1"
        >
          <option value="">Select one…</option>
          {ROLE_HINTS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>
      <input type="hidden" name="referrer" value="/dojo#cta-card" />
      <Button type="submit" size="lg" variant="primary" disabled={pending}>
        {pending
          ? "Saving…"
          : ok
            ? "You're on the list"
            : "Join the Dojo waitlist"}
        {!pending && !ok && <ArrowRight className="h-4 w-4" />}
        {ok && <CheckCircle className="h-4 w-4" />}
      </Button>
      <p className="text-xs text-[var(--color-muted)]">
        We&apos;ll email when the Dojo opens. No spam — just the launch ping.
      </p>
    </form>
  );
}
