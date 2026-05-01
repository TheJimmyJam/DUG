import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { JobsBoard, type BoardJob } from "./jobs-board";

export const metadata = { title: "Open jobs" };

// Cache this page for 30 seconds. Navigating here will be near-instant for
// repeat visitors; a background revalidation fires after the window expires.
export const revalidate = 30;

export default async function JobsPage() {
  const supabase = await createClient();

  const { data: jobs, error } = await supabase
    .from("jobs")
    .select(
      "id, title, summary, description, primary_specialty, job_type, difficulty, budget_cents, budget_type, status, estimated_hours, created_at",
    )
    .in("status", ["open", "claimed"])
    .order("created_at", { ascending: false });

  return (
    <>
      <SiteHeader />
      <main className="container-page py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Open jobs</h1>
            <p className="mt-1 text-[var(--color-muted)]">
              Grouped by specialty. Search, sort, expand a job for the full
              brief, and click through to claim.
            </p>
          </div>
          <Link href="/post-job">
            <Button variant="accent">Post a job</Button>
          </Link>
        </div>

        <div className="mt-8">
          {error ? (
            <div className="rounded-md border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 p-4 text-sm text-[var(--color-danger)]">
              {error.message}
            </div>
          ) : (
            <JobsBoard jobs={(jobs ?? []) as BoardJob[]} />
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
