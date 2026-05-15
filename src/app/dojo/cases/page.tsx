import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { CasesBoard, type BoardCase } from "./cases-board";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Dojo cases — DUG",
  description:
    "Browse practice underwriting cases across 22 lines of insurance. Pick one, submit your analysis, get scored.",
};

// Re-fetch every 60s; cases don't change frequently in MVP.
export const revalidate = 60;

export default async function DojoCasesIndexPage() {
  const supabase = await createClient();

  const { data: cases, error } = await supabase
    .from("dojo_cases")
    .select(
      "id, code, slug, title, summary, primary_specialty, additional_specialties, difficulty, time_limit_minutes, created_at",
    )
    .eq("status", "published")
    .order("created_at", { ascending: false });

  return (
    <>
      <SiteHeader />
      <main className="container-page py-10">
        <Link
          href="/dojo"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-fg)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to the Dojo
        </Link>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Practice cases</h1>
            <p className="mt-1 max-w-2xl text-[var(--color-muted)]">
              Pick a case in your specialty — or one that stretches you. Each one
              comes with a structured submission packet and gets scored against the
              model rationale and key-factor coverage.
            </p>
          </div>
          <Link href="/dojo#how-it-works">
            <Button variant="secondary">How scoring works</Button>
          </Link>
        </div>

        <div className="mt-8">
          {error ? (
            <div className="rounded-md border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 p-4 text-sm text-[var(--color-danger)]">
              {error.message}
            </div>
          ) : (
            <CasesBoard cases={(cases ?? []) as BoardCase[]} />
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
