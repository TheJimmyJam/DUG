import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";
import { getCarrierUser } from "@/lib/carrier";

export const metadata = { title: "Carrier Dashboard" };

export default async function CarrierDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const carrierUser = await getCarrierUser(user.id);
  if (!carrierUser) redirect("/login");

  const supabase = await createClient();

  // Query via underwriter view to avoid named_insured exposure
  const { data: cases } = await supabase
    .from("carrier_cases_underwriter_view")
    .select(
      "id, line_of_business, status, created_at, assigned_underwriter_id"
    )
    .eq("carrier_id", carrierUser.carrier_id)
    .order("created_at", { ascending: false });

  const totalCases = cases?.length ?? 0;
  const completedCases = cases?.filter((c) => c.status === "completed").length ?? 0;
  const inReviewCases = cases?.filter((c) => c.status === "in_review").length ?? 0;

  const statusColors: Record<string, string> = {
    new: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    in_review: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Carrier dashboard</h1>
        <p className="mt-1 text-[var(--color-muted)]">
          Overview of your submitted cases.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-[var(--color-card)] p-4">
          <div className="text-3xl font-semibold">{totalCases}</div>
          <div className="mt-1 text-sm text-[var(--color-muted)]">Total cases</div>
        </div>
        <div className="rounded-lg border bg-[var(--color-card)] p-4">
          <div className="text-3xl font-semibold">{inReviewCases}</div>
          <div className="mt-1 text-sm text-[var(--color-muted)]">In review</div>
        </div>
        <div className="rounded-lg border bg-[var(--color-card)] p-4">
          <div className="text-3xl font-semibold">{completedCases}</div>
          <div className="mt-1 text-sm text-[var(--color-muted)]">Completed</div>
        </div>
      </div>

      {/* Cases table */}
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-card)] border-b">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-muted)]">
                Line of business
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-muted)]">Status</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-muted)] hidden md:table-cell">
                Submitted
              </th>
              <th className="px-4 py-3 text-right font-medium text-[var(--color-muted)]">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {(!cases || cases.length === 0) && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-[var(--color-muted)]">
                  No cases submitted yet.
                </td>
              </tr>
            )}
            {cases?.map((c) => (
              <tr key={c.id} className="hover:bg-[var(--color-card)] transition-colors">
                <td className="px-4 py-3">{c.line_of_business ?? "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`capitalize rounded px-2 py-0.5 text-xs font-medium ${statusColors[c.status ?? "new"] ?? ""}`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-[var(--color-muted)] hidden md:table-cell">
                  {new Date(c.created_at ?? "").toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/carrier/dashboard/cases/${c.id}`}
                    className="rounded px-3 py-1 text-xs bg-[var(--color-border)] hover:opacity-80 transition-opacity"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
