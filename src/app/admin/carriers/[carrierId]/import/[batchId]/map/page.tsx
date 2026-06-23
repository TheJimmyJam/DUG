import { redirect, notFound } from "next/navigation";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { saveMappingAndImportAction } from "./actions";

export const metadata = { title: "Map Columns — Admin" };

const CASE_FIELDS = [
  { value: "skip", label: "— Skip —" },
  { value: "named_insured", label: "Named insured" },
  { value: "line_of_business", label: "Line of business" },
  { value: "exposure_basis_type", label: "Exposure basis type" },
  { value: "exposure_basis_value", label: "Exposure basis value" },
  { value: "construction_type", label: "Construction type" },
  { value: "protection_class", label: "Protection class" },
  { value: "loss_history_summary", label: "Loss history summary" },
  { value: "coverage_requested", label: "Coverage requested" },
];

export default async function MapColumnsPage({
  params,
}: {
  params: Promise<{ carrierId: string; batchId: string }>;
}) {
  const { carrierId, batchId } = await params;

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_admin) redirect("/dashboard");

  const { data: batch } = await supabase
    .from("import_batches")
    .select("id, source_format, field_mapping, raw_file_url, carrier_id")
    .eq("id", batchId)
    .single();
  if (!batch || batch.carrier_id !== carrierId) notFound();

  const mapping = batch.field_mapping as { headers?: string[] } | null;
  const headers: string[] = mapping?.headers ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Map columns</h1>
        <p className="mt-1 text-[var(--color-muted)]">
          Match each file column to a case field. Columns set to &quot;Skip&quot; will be ignored.
        </p>
      </div>

      {headers.length === 0 ? (
        <div className="rounded-lg border bg-[var(--color-card)] p-6 text-[var(--color-muted)]">
          No columns detected in the uploaded file.
        </div>
      ) : (
        <form action={saveMappingAndImportAction} className="space-y-6">
          <input type="hidden" name="batchId" value={batchId} />
          <input type="hidden" name="carrierId" value={carrierId} />

          <div className="rounded-lg border bg-[var(--color-card)] overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-card)] border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-[var(--color-muted)]">
                    File column
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-[var(--color-muted)]">
                    Maps to
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {headers.map((h, i) => (
                  <tr key={i} className="hover:bg-[var(--color-card)]/50">
                    <td className="px-4 py-3 font-mono text-xs">{h}</td>
                    <td className="px-4 py-3">
                      <select
                        name={`mapping[${h}]`}
                        defaultValue={guessField(h)}
                        className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-1.5 text-sm w-full max-w-xs"
                      >
                        {CASE_FIELDS.map((f) => (
                          <option key={f.value} value={f.value}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="submit"
            className="rounded-md bg-[var(--color-primary)] px-6 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            Import cases
          </button>
        </form>
      )}
    </div>
  );
}

function guessField(header: string): string {
  const h = header.toLowerCase().replace(/[\s_-]/g, "");
  if (h.includes("namedinsured") || h.includes("insuredname") || h === "insured") return "named_insured";
  if (h.includes("line") || h.includes("lob")) return "line_of_business";
  if (h.includes("exposuretype") || h.includes("basistype")) return "exposure_basis_type";
  if (h.includes("exposurevalue") || h.includes("basisvalue")) return "exposure_basis_value";
  if (h.includes("construction")) return "construction_type";
  if (h.includes("protection") || h.includes("class")) return "protection_class";
  if (h.includes("loss") || h.includes("history")) return "loss_history_summary";
  if (h.includes("coverage")) return "coverage_requested";
  return "skip";
}
