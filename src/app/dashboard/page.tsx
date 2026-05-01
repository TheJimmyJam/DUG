import Link from "next/link";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const displayName = profile?.display_name ?? user.email ?? "there";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Welcome back, {displayName}.
        </h1>
        <p className="mt-1 text-[var(--color-muted)]">
          Here&apos;s where your portfolio lives.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-semibold">
              {profile?.completed_job_count ?? 0}
            </div>
            <div className="mt-1 text-sm text-[var(--color-muted)]">
              Jobs completed
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-semibold">
              {profile?.rating ? Number(profile.rating).toFixed(2) : "—"}
            </div>
            <div className="mt-1 text-sm text-[var(--color-muted)]">
              Avg rating ({profile?.rating_count ?? 0} reviews)
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-semibold">
              {profile?.is_verified ? "Verified" : "Unverified"}
            </div>
            <div className="mt-1 text-sm text-[var(--color-muted)]">
              Identity status
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Badge variant="primary" className="mb-3">
            Get started
          </Badge>
          <h2 className="text-xl font-semibold">
            Finish your profile, then claim a job.
          </h2>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Add specialty tags so we can match you to the right work. Browse
            open jobs and submit your first analysis to start building your
            credibility score.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/dashboard/profile">
              <Button variant="primary">Edit profile</Button>
            </Link>
            <Link href="/jobs">
              <Button variant="secondary">Browse jobs</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
