import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { SubmissionForm } from "./submission-form";

export const metadata = { title: "Submit analysis" };

type PageProps = { params: Promise<{ id: string }> };

export default async function SubmitPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/jobs/${id}/submit`);

  const { data: job } = await supabase
    .from("jobs")
    .select("id, title, summary, claimed_by, status")
    .eq("id", id)
    .maybeSingle();

  if (!job) notFound();
  if (job.claimed_by !== user.id) {
    redirect(`/jobs/${id}`);
  }

  const { data: existing } = await supabase
    .from("submissions")
    .select("*")
    .eq("job_id", id)
    .eq("underwriter_id", user.id)
    .maybeSingle();

  return (
    <>
      <SiteHeader />
      <main className="container-page py-10">
        <div className="mx-auto max-w-2xl">
          <Link
            href={`/jobs/${id}`}
            className="text-sm text-[var(--color-muted)] hover:text-[var(--color-primary)]"
          >
            ← Back to job
          </Link>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Submit your analysis
          </h1>
          <p className="mt-1 text-[var(--color-muted)]">
            For: <span className="font-medium text-[var(--color-fg)]">{job.title}</span>
          </p>
          <Badge variant="outline" className="mt-3">
            Advisory only — never bind. Posters always make the final call.
          </Badge>

          <Card className="mt-6">
            <CardContent className="pt-6">
              <SubmissionForm jobId={id} existing={existing} />
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
