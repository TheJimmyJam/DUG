import { Card, CardContent } from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";

export default function UnderwritersLoading() {
  return (
    <>
      <SiteHeader />
      <main className="container-page py-10">
        <div className="h-8 w-48 animate-pulse rounded bg-[var(--color-border)]/60" />
        <div className="mt-2 h-4 w-64 animate-pulse rounded bg-[var(--color-border)]/40" />
        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-[var(--color-border)]/60" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/2 animate-pulse rounded bg-[var(--color-border)]/60" />
                    <div className="h-3 w-1/3 animate-pulse rounded bg-[var(--color-border)]/40" />
                    <div className="h-3 w-full animate-pulse rounded bg-[var(--color-border)]/40" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
