import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { inviteCarrierReviewerAction } from "@/app/admin/carriers/actions";

export const metadata = { title: "Invite Reviewers — Admin" };

export default async function InviteReviewersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_admin) redirect("/dashboard");

  const { data: reviewers } = await supabase
    .from("profiles")
    .select("id, display_name, handle, created_at")
    .eq("is_carrier_reviewer", true)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link href="/admin" className="text-sm text-[var(--color-muted)] hover:text-[var(--color-fg)] transition-colors">
          ← Back to Admin
        </Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Invite reviewers</h1>
        <p className="mt-1 text-[var(--color-muted)]">
          Invite a user as a carrier reviewer. They will receive an email to set up their account.
        </p>
      </div>

      <div className="rounded-lg border bg-[var(--color-card)] p-6 space-y-4">
        <h2 className="text-lg font-semibold">Send invitation</h2>
        <form action={inviteCarrierReviewerAction} className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-[var(--color-muted)]">
              Email address *
            </label>
            <input
              name="email"
              type="email"
              required
              placeholder="reviewer@example.com"
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            Send invite
          </button>
        </form>
      </div>

      {/* Existing reviewers */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Existing reviewers</h2>
        {(!reviewers || reviewers.length === 0) ? (
          <p className="text-sm text-[var(--color-muted)]">No reviewers yet.</p>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-card)] border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-[var(--color-muted)]">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-[var(--color-muted)]">Handle</th>
                  <th className="px-4 py-3 text-left font-medium text-[var(--color-muted)]">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {reviewers.map((r) => (
                  <tr key={r.id} className="hover:bg-[var(--color-card)] transition-colors">
                    <td className="px-4 py-3 font-medium">{r.display_name ?? "—"}</td>
                    <td className="px-4 py-3 text-[var(--color-muted)]">@{r.handle ?? "—"}</td>
                    <td className="px-4 py-3 text-[var(--color-muted)]">
                      {new Date(r.created_at ?? "").toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
