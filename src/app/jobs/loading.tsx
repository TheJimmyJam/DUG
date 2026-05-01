import { Card, CardContent } from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";

export default function JobsLoading() {
  return (
    <>
      <SiteHeader />
      <main className="container-page py-10">
        <div className="h-8 w-40 animate-pulse rounded bg-[var(--color-border)]/60" />
        <div className="mt-2 h-4 w-72 animate-pulse rounded bg-[var(--color-border)]/40" />
        <div className="mt-6 h-10 w-full animate-pulse rounded bg-[var(--color-border)]/40" />
        <div className="mt-4 space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-5 pb-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-5 w-1/3 animate-pulse rounded bg-[var(--color-border)]/60" />
                  <div className="h-5 w-16 animate-pulse rounded-full bg-[var(--color-border)]/40" />
                </div>
                <div className="h-3 w-full animate-pulse rounded bg-[var(--color-border)]/30" />
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
