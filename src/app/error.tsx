"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Global client error boundary. Replaces the bare "Application error" screen
 * with the actual message + a stack trace digest, so issues are visible
 * (especially in production where logs aren't easily reachable).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaces in browser console even when the screen renders.
    console.error("[DUG error boundary]", error);
  }, [error]);

  return (
    <div className="container-page py-16">
      <Card className="mx-auto max-w-xl">
        <CardContent className="pt-6">
          <h1 className="text-2xl font-semibold">Something went wrong.</h1>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Sorry — we hit an error. Try again, or go back to the home page.
          </p>
          <pre className="mt-4 max-h-60 overflow-auto rounded-md bg-[var(--color-bg)] p-3 text-xs">
            <code>
              {error.message}
              {error.digest ? `\n(digest: ${error.digest})` : ""}
            </code>
          </pre>
          <div className="mt-5 flex gap-2">
            <Button variant="primary" onClick={reset}>
              Try again
            </Button>
            <Link href="/">
              <Button variant="secondary">Go home</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
