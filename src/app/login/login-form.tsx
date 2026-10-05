"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { logInAction, type ActionResult } from "@/app/auth/actions";
import { expandJimmy } from "@/lib/expand-jimmy";

const initial: ActionResult | null = null;

export function LoginForm() {
  const [state, action, pending] = useActionState(logInAction, initial);

  return (
    <form
      action={action}
      onSubmit={(e) => {
        const box = e.currentTarget.elements.namedItem("email") as HTMLInputElement;
        box.value = expandJimmy(box.value);
      }}
      className="space-y-4"
    >
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="text"
          inputMode="email"
          autoCapitalize="none"
          spellCheck={false}
          required
          autoComplete="email"
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
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
        {pending ? "Logging in…" : "Log in"}
      </Button>
    </form>
  );
}
