import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export const metadata = { title: "My jobs" };

export default async function MyJobsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = await createClient();

  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, title, status, primary_specialty, created_at")
    .eq("claimed_by", user.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">My jobs</h1>
      <p className="mt-1 text-[var(--color-muted)]">
        Jobs you&apos;ve claimed.
      </p>

      <div className="mt-6 grid gap-3">
        {(jobs ?? []).length === 0 ? (
          <Card>
            <CardContent className="pt-6 pb-6">
              <CardTitle>No claimed jobs yet.</CardTitle>
              <CardDescription className="mt-2">
                Head to <Link href="/jobs" className="underline">browse jobs</Link>{" "}
                and pick one in your specialty.
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
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
