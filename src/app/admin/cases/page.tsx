import { redirect } from "next/navigation";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { assignCaseAction, markBatchReadyAction } from "./actions";
import type { Database } from "@/lib/database.types";

type CarrierCaseStatus = Database["public"]["Enums"]["carrier_case_status"];

export const metadata = { title: "Cases — Admin" };

export default async function AdminCasesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; carrierId?: string }>;
}) {
  const { status: filterStatus, carrierId: filterCarrier } = await searchParams;

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_admin) redirect("/dashboard");

  // Fetch all cases with carrier name and underwriter name
  let query = supabase
    .from("carrier_cases")
    .select(
      "id, named_insured, line_of_business, status, assigned_underwriter_id, batch_id, carrier_id, created_at, carriers(name), profiles!assigned_underwriter_id(display_name)"
    )
    .order("created_at", { ascending: false });

  if (filterStatus) query = query.eq("status", filterStatus as CarrierCaseStatus);
  if (filterCarrier) query = query.eq("carrier_id", filterCarrier);

  const { data: cases } = await query;

  // Fetch all reviewers for assign dropdown
  const { data: reviewers } = await supabase
    .from("profiles")
    .select("id, display_name")
    .eq("is_carrier_reviewer", true)
    .order("display_name");

  // Fetch carriers for filter
  const { data: carriers } = await supabase
    .from("carriers")
    .select("id, name")
    .order("name");

  // Fetch unique batch ids for "mark ready" actions
  const batchIds = [...new Set((cases ?? []).map((c) => c.batch_id).filter(Boolean))];

  const statusColors: Record<string, string> = {
    new: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    in_review: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Cases</h1>
          <p className="mt-1 text-[var(--color-muted)]">
            All carrier cases. Assign reviewers and mark batches ready.
          </p>
        </div>

        {/* Filters */}
        <form className="flex flex-wrap gap-2">
          <select
            name="status"
            defaultValue={filterStatus ?? ""}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-1.5 text-sm"
          >
            <option value="">All statuses</option>
            <option value="new">New</option>
            <option value="in_review">In review</option>
            <option value="completed">Completed</option>
          </select>
          <select
            name="carrierId"
            defaultValue={filterCarrier ?? ""}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-1.5 text-sm"
          >
            <option value="">All carriers</option>
            {carriers?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm hover:bg-[var(--color-border)]/30 transition-colors"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Mark batch ready actions */}
      {batchIds.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {batchIds.map((batchId) => (
            <form key={batchId} action={markBatchReadyAction}>
              <input type="hidden" name="batchId" value={batchId!} />
              <button
                type="submit"
                className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs hover:bg-[var(--color-border)]/30 transition-colors"
              >
                Mark batch {batchId!.slice(0, 8)}… ready
              </button>
            </form>
          ))}
        </div>
      )}

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-card)] border-b">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-muted)]">Named insured</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-muted)] hidden md:table-cell">
                Carrier
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-muted)] hidden lg:table-cell">
                LOB
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-muted)]">Status</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-muted)]">Assign reviewer</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {(!cases || cases.length === 0) && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[var(--color-muted)]">
                  No cases found.
                </td>
              </tr>
            )}
            {cases?.map((c) => {
              const carrier = c.carriers as { name: string } | null;
              const underwriter = c.profiles as { display_name: string } | null;
              return (
                <tr key={c.id} className="hover:bg-[var(--color-card)] transition-colors">
                  <td className="px-4 py-3 font-medium">{c.named_insured}</td>
                  <td className="px-4 py-3 text-[var(--color-muted)] hidden md:table-cell">
                    {carrier?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-muted)] hidden lg:table-cell">
                    {c.line_of_business ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`capitalize rounded px-2 py-0.5 text-xs font-medium ${statusColors[c.status ?? "new"] ?? ""}`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <form action={assignCaseAction} className="flex gap-2 items-center">
                      <input type="hidden" name="caseId" value={c.id} />
                      <select
                        name="underwriterId"
                        defaultValue={c.assigned_underwriter_id ?? ""}
                        className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1 text-xs"
                      >
                        <option value="">Unassigned</option>
                        {reviewers?.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.display_name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="rounded px-2 py-1 text-xs bg-[var(--color-border)] hover:opacity-80 transition-opacity"
                      >
                        Save
                      </button>
                    </form>
                    {underwriter && (
                      <div className="mt-1 text-xs text-[var(--color-muted)]">
                        {underwriter.display_name}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
