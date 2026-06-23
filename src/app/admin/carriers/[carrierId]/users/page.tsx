import { redirect } from "next/navigation";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { createCarrierUserAction } from "./actions";

export const metadata = { title: "Carrier Users — Admin" };

export default async function CarrierUsersPage({
  params,
}: {
  params: Promise<{ carrierId: string }>;
}) {
  const { carrierId } = await params;

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_admin) redirect("/dashboard");

  const { data: carrier } = await supabase
    .from("carriers")
    .select("id, name")
    .eq("id", carrierId)
    .single();
  if (!carrier) redirect("/admin/carriers");

  const { data: carrierUsers } = await supabase
    .from("carrier_users")
    .select("id, email, created_at")
    .eq("carrier_id", carrierId)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <a href="/admin/carriers" className="text-sm text-[var(--color-muted)] hover:underline">
          ← All carriers
        </a>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{carrier.name}</h1>
        <p className="mt-1 text-[var(--color-muted)]">
          Carrier dashboard users — each gets a login scoped to this carrier only.
        </p>
      </div>

      {/* Add user form */}
      <div className="rounded-lg border bg-[var(--color-card)] p-6 space-y-4">
        <h2 className="text-lg font-semibold">Add carrier user</h2>
        <p className="text-sm text-[var(--color-muted)]">
          Enter the contact&apos;s email. They&apos;ll receive a Supabase invite link to set their password
          and will land on the carrier dashboard when they log in.
        </p>
        <form action={createCarrierUserAction} className="flex flex-wrap gap-3 items-end">
          <input type="hidden" name="carrierId" value={carrierId} />
          <div>
            <label className="mb-1 block text-xs text-[var(--color-muted)]">Email *</label>
            <input
              name="email"
              type="email"
              required
              placeholder="contact@carrier.com"
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm w-72"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            Invite user
          </button>
        </form>
      </div>

      {/* Existing users */}
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-card)] border-b">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-muted)]">Email</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-muted)] hidden md:table-cell">Added</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {(!carrierUsers || carrierUsers.length === 0) && (
              <tr>
                <td colSpan={2} className="px-4 py-8 text-center text-[var(--color-muted)]">
                  No users yet. Invite one above.
                </td>
              </tr>
            )}
            {carrierUsers?.map((u) => (
              <tr key={u.id} className="hover:bg-[var(--color-card)] transition-colors">
                <td className="px-4 py-3 font-medium">{u.email}</td>
                <td className="px-4 py-3 text-[var(--color-muted)] hidden md:table-cell">
                  {new Date(u.created_at ?? "").toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
