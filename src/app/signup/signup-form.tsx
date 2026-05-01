"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { signUpAction, type ActionResult } from "@/app/auth/actions";

const initial: ActionResult | null = null;

export function SignupForm() {
  const [state, action, pending] = useActionState(signUpAction, initial);

  return (
    <form action={action} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          minLength={8}
          required
          autoComplete="new-password"
        />
        <p className="mt-1 text-xs text-[var(--color-muted)]">
          Minimum 8 characters.
        </p>
      </div>
      <div>
        <Label htmlFor="display_name">Display name</Label>
        <Input
          id="display_name"
          name="display_name"
          type="text"
          required
          minLength={2}
          maxLength={60}
        />
        <p className="mt-1 text-xs text-[var(--color-muted)]">
          Shown on your public profile. Real name or pen name — your call.
        </p>
      </div>

      {state && !state.ok && (
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
        className="w-full"
        disabled={pending}
      >
        {pending ? "Creating account…" : "Create account"}
      </Button>

      <p className="text-center text-xs text-[var(--color-muted)]">
        We&apos;ll email you a confirmation link to verify it&apos;s really you.
      </p>
    </form>
  );
}
