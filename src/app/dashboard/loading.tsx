import { Card, CardContent } from "@/components/ui/card";

/**
 * Instant skeleton shown while the next dashboard page is fetching server-side.
 * Prevents the "stuck on the old page for 500ms" feeling.
 */
export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-2/3 max-w-md animate-pulse rounded bg-[var(--color-border)]/60" />
        <div className="h-4 w-1/2 max-w-sm animate-pulse rounded bg-[var(--color-border)]/40" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="h-8 w-16 animate-pulse rounded bg-[var(--color-border)]/60" />
              <div className="mt-2 h-3 w-24 animate-pulse rounded bg-[var(--color-border)]/40" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="pt-6 space-y-3">
          <div className="h-5 w-1/3 animate-pulse rounded bg-[var(--color-border)]/60" />
          <div className="h-4 w-full animate-pulse rounded bg-[var(--color-border)]/40" />
          <div className="h-4 w-4/5 animate-pulse rounded bg-[var(--color-border)]/40" />
        </CardContent>
      </Card>
    </div>
  );
}
