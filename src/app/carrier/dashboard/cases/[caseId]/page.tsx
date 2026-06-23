import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getCurrentUser, createClient } from "@/lib/supabase/server";
import { getCarrierUser } from "@/lib/carrier";

export const metadata = { title: "Case Details — Carrier" };

export default async function CarrierCaseDetailPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const carrierUser = await getCarrierUser(user.id);
  if (!carrierUser) redirect("/login");

  const supabase = await createClient();

  // Query view — no named_insured
  const { data: caseRow } = await supabase
    .from("carrier_cases_underwriter_view")
    .select(
      "id, carrier_id, line_of_business, exposure_basis_type, exposure_basis_value, construction_type, protection_class, loss_history_summary, coverage_requested, exclusion_reason, status, created_at"
    )
    .eq("id", caseId)
    .single();

  if (!caseRow) notFound();

  // Verify this case belongs to the carrier user's carrier
  if (caseRow.carrier_id !== carrierUser.carrier_id) {
    redirect("/carrier/dashboard");
  }

  // Fetch analyses, join reviewer credential fields (no name/identity)
  const { data: analyses } = await supabase
    .from("carrier_case_analyses")
    .select(
      "id, recommendation, key_exposures, missing_information, suggested_price_structure, reasoning, created_at, profiles!underwriter_id(linkedin_url, is_cpcu)"
    )
    .eq("case_id", caseId)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link
          href="/carrier/dashboard"
          className="text-sm text-[var(--color-muted)] hover:text-[var(--color-fg)] transition-colors"
        >
          ← Back to dashboard
        </Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Case details</h1>
        <p className="mt-1 text-[var(--color-muted)]">
          Status: <span className="capitalize">{caseRow.status}</span>
        </p>
      </div>

      {/* Case details — no named_insured */}
      <div className="rounded-lg border bg-[var(--color-card)] p-6 space-y-4">
        <h2 className="text-lg font-semibold">Case information</h2>
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

      {/* Underwriter analyses */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">
          Analyses {analyses && analyses.length > 0 ? `(${analyses.length})` : ""}
        </h2>
        {(!analyses || analyses.length === 0) ? (
          <p className="text-sm text-[var(--color-muted)]">
            No analyses submitted yet. Check back soon.
          </p>
        ) : (
          analyses.map((a) => (
            <div
              key={a.id}
              className="rounded-lg border bg-[var(--color-card)] p-5 space-y-3 text-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="font-semibold capitalize text-base">
                  {a.recommendation?.replace(/_/g, " ") ?? "—"}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {(a.profiles as { is_cpcu: boolean | null; linkedin_url: string | null } | null)?.is_cpcu && (
                    <span className="rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-0.5 text-xs font-medium">
                      CPCU
                    </span>
                  )}
                  {(a.profiles as { is_cpcu: boolean | null; linkedin_url: string | null } | null)?.linkedin_url && (
                    <span className="rounded-full bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300 px-2 py-0.5 text-xs font-medium">
                      LinkedIn ✓
                    </span>
                  )}
                  <span className="text-xs text-[var(--color-muted)]">
                    {new Date(a.created_at ?? "").toLocaleDateString()}
                  </span>
                </div>
              </div>
              {a.key_exposures && (
                <div>
                  <div className="text-xs text-[var(--color-muted)] mb-1">Key exposures</div>
                  <p>{a.key_exposures}</p>
                </div>
              )}
              {a.missing_information && (
                <div>
                  <div className="text-xs text-[var(--color-muted)] mb-1">Missing information</div>
                  <p>{a.missing_information}</p>
                </div>
              )}
              {a.suggested_price_structure && (
                <div>
                  <div className="text-xs text-[var(--color-muted)] mb-1">Suggested price structure</div>
                  <p className="font-medium">{a.suggested_price_structure}</p>
                </div>
              )}
              {a.reasoning && (
                <div>
                  <div className="text-xs text-[var(--color-muted)] mb-1">Reasoning</div>
                  <p className="whitespace-pre-wrap">{a.reasoning}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
