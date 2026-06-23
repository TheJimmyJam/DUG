import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

export const metadata = { title: "My Cases — Reviewer" };

export default async function UnderwriterCasesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_carrier_reviewer, display_name, linkedin_url, is_cpcu")
    .eq("id", user.id)
    .single();

  if (!profile?.is_carrier_reviewer) redirect("/dashboard");

  const credentialsComplete = profile.linkedin_url || profile.is_cpcu;

  // Query the underwriter-safe view
  const { data: cases } = await supabase
    .from("carrier_cases_underwriter_view")
    .select("id, carrier_id, line_of_business, status, created_at")
    .eq("assigned_underwriter_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch carrier names
  const carrierIds = [...new Set((cases ?? []).map((c) => c.carrier_id).filter((id): id is string => id !== null))];
  let carrierMap: Record<string, string> = {};
  if (carrierIds.length > 0) {
    const { data: carriers } = await supabase
      .from("carriers")
      .select("id, name")
      .in("id", carrierIds);
    carrierMap = Object.fromEntries((carriers ?? []).map((c) => [c.id, c.name]));
  }

  const statusColors: Record<string, string> = {
    new: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    in_review: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">My cases</h1>
          <p className="mt-1 text-[var(--color-muted)]">
            Cases assigned to you for review.
          </p>
        </div>
        <a
          href="/underwriter/profile"
          className="shrink-0 rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--color-card)] transition-colors"
        >
          My profile
        </a>
      </div>

      {!credentialsComplete && (
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20 px-4 py-3 text-sm flex items-start gap-3">
          <span className="text-yellow-600 dark:text-yellow-400 mt-0.5">⚠</span>
          <div>
            <span className="font-medium text-yellow-800 dark:text-yellow-300">Add your credentials</span>
            <span className="text-yellow-700 dark:text-yellow-400">
              {" "}— Carriers see a credibility badge on your analyses when you add a LinkedIn URL or CPCU designation.{" "}
            </span>
            <a href="/underwriter/profile" className="font-medium underline text-yellow-800 dark:text-yellow-300 hover:opacity-80">
              Set up now →
            </a>
          </div>
        </div>
      )}

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-card)] border-b">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-muted)]">Carrier</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-muted)] hidden md:table-cell">
                Line of business
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-muted)]">Status</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-muted)] hidden lg:table-cell">
                Received
              </th>
              <th className="px-4 py-3 text-right font-medium text-[var(--color-muted)]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {(!cases || cases.length === 0) && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[var(--color-muted)]">
                  No cases assigned to you yet.
                </td>
              </tr>
            )}
            {cases?.map((c) => (
              <tr key={c.id} className="hover:bg-[var(--color-card)] transition-colors">
                <td className="px-4 py-3 font-medium">
                  {carrierMap[c.carrier_id ?? ""] ?? "—"}
                </td>
                <td className="px-4 py-3 text-[var(--color-muted)] hidden md:table-cell">
                  {c.line_of_business ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`capitalize rounded px-2 py-0.5 text-xs font-medium ${statusColors[c.status ?? "new"] ?? ""}`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-[var(--color-muted)] hidden lg:table-cell">
                  {new Date(c.created_at ?? "").toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/underwriter/cases/${c.id}`}
                    className="rounded px-3 py-1 text-xs bg-[var(--color-border)] hover:opacity-80 transition-opacity"
                  >
                    Review
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
