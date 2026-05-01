import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Jobs I posted" };

export default async function PostedJobsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = await createClient();

  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, title, status, primary_specialty, created_at, claimed_by")
    .eq("poster_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Jobs I posted
          </h1>
          <p className="mt-1 text-[var(--color-muted)]">
            Track who&apos;s working on what.
          </p>
        </div>
        <Link href="/post-job">
          <Button variant="accent">Post a job</Button>
        </Link>
      </div>

      <div className="mt-6 grid gap-3">
        {(jobs ?? []).length === 0 ? (
          <Card>
            <CardContent className="pt-6 pb-6">
              <CardTitle>You haven&apos;t posted anything yet.</CardTitle>
              <CardDescription className="mt-2">
                Post a job to get expert eyes on a risk you&apos;re wrestling
                with.
              </CardDescription>
            </CardContent>
          </Card>
        ) : (
          (jobs ?? []).map((job) => (
            <Card key={job.id}>
              <CardContent className="pt-5 pb-5">
                <div className="font-medium">{job.title}</div>
                <div className="mt-1 text-xs text-[var(--color-muted)]">
                  {job.primary_specialty} · {job.status}
                  {job.claimed_by ? " · claimed" : " · open"}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
