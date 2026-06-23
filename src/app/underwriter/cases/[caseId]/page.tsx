import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { submitCaseAnalysisAction } from "./actions";

export const metadata = { title: "Review Case — Reviewer" };

export default async function UnderwriterCaseDetailPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_carrier_reviewer")
    .eq("id", user.id)
    .single();
  if (!profile?.is_carrier_reviewer) redirect("/dashboard");

  // Query the underwriter-safe view (no named_insured)
  const { data: caseRow } = await supabase
    .from("carrier_cases_underwriter_view")
    .select(
      "id, carrier_id, line_of_business, exposure_basis_type, exposure_basis_value, construction_type, protection_class, loss_history_summary, coverage_requested, exclusion_reason, status, assigned_underwriter_id, created_at"
    )
    .eq("id", caseId)
    .single();

  if (!caseRow) notFound();
  if (caseRow.assigned_underwriter_id !== user.id) {
    redirect("/underwriter/cases");
  }

  // Fetch carrier name
  const { data: carrier } = await supabase
    .from("carriers")
    .select("name")
    .eq("id", caseRow.carrier_id ?? "")
    .single();

  // Fetch existing analyses
  const { data: analyses } = await supabase
    .from("carrier_case_analyses")
    .select("id, recommendation, key_exposures, missing_information, suggested_price_structure, reasoning, created_at")
    .eq("case_id", caseId)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link
          href="/underwriter/cases"
          className="text-sm text-[var(--color-muted)] hover:text-[var(--color-fg)] transition-colors"
        >
          ← Back to my cases
        </Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Case review — {carrier?.name ?? "Unknown carrier"}
        </h1>
        <p className="mt-1 text-[var(--color-muted)]">
          Status: <span className="capitalize">{caseRow.status}</span>
        </p>
      </div>

      {/* Case details */}
      <div className="rounded-lg border bg-[var(--color-card)] p-6 space-y-4">
        <h2 className="text-lg font-semibold">Case details</h2>
        <dl className="grid gap-3 sm:grid-cols-2 text-sm">
          {[
            ["Line of business", caseRow.line_of_business],
            ["Exposure basis type", caseRow.exposure_basis_type],
            ["Exposure basis value", caseRow.exposure_basis_value?.toString()],
            ["Construction type", caseRow.construction_type],
            ["Protection class", caseRow.protection_class],
            ["Coverage requested", caseRow.coverage_requested],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs text-[var(--color-muted)] mb-0.5">{label}</dt>
              <dd className="font-medium">{value ?? "—"}</dd>
            </div>
          ))}
          {caseRow.loss_history_summary && (
            <div className="sm:col-span-2">
              <dt className="text-xs text-[var(--color-muted)] mb-0.5">Loss history summary</dt>
              <dd className="font-medium whitespace-pre-wrap">{caseRow.loss_history_summary}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Submit analysis */}
      <div className="rounded-lg border bg-[var(--color-card)] p-6 space-y-4">
        <h2 className="text-lg font-semibold">Submit analysis</h2>
        <form action={submitCaseAnalysisAction} className="space-y-4">
          <input type="hidden" name="caseId" value={caseId} />

          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--color-muted)]">
              Recommendation *
            </label>
            <select
              name="recommendation"
              required
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm w-full max-w-xs"
            >
              <option value="">Select...</option>
              <option value="write">Write</option>
              <option value="decline">Decline</option>
              <option value="write_with_modifications">Write with modifications</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--color-muted)]">
              Key exposures
            </label>
            <textarea
              name="key_exposures"
              rows={3}
              placeholder="Describe the key exposure factors..."
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--color-muted)]">
              Missing information
            </label>
            <textarea
              name="missing_information"
              rows={2}
              placeholder="List any missing information needed..."
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--color-muted)]">
              Suggested price structure
            </label>
            <input
              name="suggested_price_structure"
              placeholder="e.g. $45,000 flat premium"
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--color-muted)]">
              Reasoning
            </label>
            <textarea
              name="reasoning"
              rows={4}
              placeholder="Explain your recommendation..."
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            className="rounded-md bg-[var(--color-primary)] px-6 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            Submit analysis
          </button>
        </form>
      </div>

      {/* Previous analyses */}
      {analyses && analyses.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Previous analyses</h2>
          {analyses.map((a) => (
            <div key={a.id} className="rounded-lg border bg-[var(--color-card)] p-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium capitalize">{a.recommendation?.replace(/_/g, " ")}</span>
                <span className="text-xs text-[var(--color-muted)]">
                  {new Date(a.created_at ?? "").toLocaleDateString()}
                </span>
              </div>
              {a.key_exposures && (
                <div>
                  <span className="text-xs text-[var(--color-muted)]">Key exposures: </span>
                  {a.key_exposures}
                </div>
              )}
              {a.reasoning && (
                <div>
                  <span className="text-xs text-[var(--color-muted)]">Reasoning: </span>
                  {a.reasoning}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
