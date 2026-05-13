import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { PostJobForm } from "./post-job-form";
import { SPECIALTIES, SPECIALTY_GROUPS } from "@/lib/specialties";
import { loadPricingConfig } from "@/lib/pricing-config";

export const metadata = { title: "Post an engagement — DUG" };

export default async function PostJobPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/post-engagement");

  const pricingConfig = await loadPricingConfig();

  return (
    <>
      <SiteHeader />
      <main className="container-page py-10">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight">Post an evaluation request</h1>
          <p className="mt-1 text-[var(--color-muted)]">
            DUG is channel-agnostic. Carriers, insureds, brokers, risk managers, and AI labs
            are all welcome. Describe what you need — independent underwriters will respond.
          </p>

          <Card className="mt-6">
            <CardContent className="pt-6">
              <PostJobForm
                specialties={SPECIALTIES}
                specialtyGroups={SPECIALTY_GROUPS}
                pricingConfig={pricingConfig}
              />
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
