import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { PostJobForm } from "./post-job-form";
import { SPECIALTIES, SPECIALTY_GROUPS } from "@/lib/specialties";

export const metadata = { title: "Post a job" };

export default async function PostJobPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/post-job");

  return (
    <>
      <SiteHeader />
      <main className="container-page py-10">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight">Post a job</h1>
          <p className="mt-1 text-[var(--color-muted)]">
            Describe the risk and what you need analyzed. Underwriters in the
            network will respond.
          </p>

          <Card className="mt-6">
            <CardContent className="pt-6">
              <PostJobForm
                specialties={SPECIALTIES}
                specialtyGroups={SPECIALTY_GROUPS}
              />
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
