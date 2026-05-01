import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { createClient } from "@/lib/supabase/server";
import { UnderwritersBoard } from "./underwriters-board";

export const metadata = { title: "Underwriters" };

// Cache for 60 seconds — underwriter profiles change infrequently.
export const revalidate = 60;

export default async function UnderwritersPage() {
  const supabase = await createClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*, profile_specialties(specialty_slug)")
    .in("role", ["underwriter", "both"])
    .order("rating", { ascending: false })
    .order("completed_job_count", { ascending: false })
    .limit(200);

  return (
    <>
      <SiteHeader />
      <main className="container-page py-10">
        <h1 className="text-3xl font-semibold tracking-tight">Underwriters</h1>
        <p className="mt-1 mb-8 text-[var(--color-muted)]">
          Browse the network. Search or filter by specialty.
        </p>
        <UnderwritersBoard profiles={profiles ?? []} />
      </main>
      <SiteFooter />
    </>
  );
}
