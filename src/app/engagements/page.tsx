import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { JobsBoard, type BoardJob } from "./jobs-board";

export const metadata = { title: "Marketplace — DUG" };

export const revalidate = 30;

export default async function JobsPage() {
  const supabase = await createClient();

  const { data: jobs, error } = await supabase
    .from("jobs")
    .select(
      "id, title, summary, description, primary_specialty, job_type, requester_type, difficulty, budget_cents, budget_type, status, estimated_hours, created_at",
    )
    .in("status", ["open", "claimed"])
    .order("created_at", { ascending: false });

  return (
    <>
      <SiteHeader />
      <main className="container-page py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Marketplace</h1>
            <p className="mt-1 text-[var(--color-muted)]">
              Open evaluation requests from carriers, insureds, brokers, risk managers, and more.
              Claim one, do the work, build your reputation.
            </p>
          </div>
          <Link href="/post-engagement">
            <Button variant="accent">Post an engagement</Button>
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
