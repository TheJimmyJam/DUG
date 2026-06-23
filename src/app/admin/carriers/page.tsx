import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { createCarrierAction } from "./actions";

export const metadata = { title: "Carriers — Admin" };

export default async function AdminCarriersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) redirect("/dashboard");

  const { data: carriers } = await supabase
    .from("carriers")
    .select("id, name, contact_email, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin" className="text-sm text-[var(--color-muted)] hover:text-[var(--color-fg)] transition-colors">
          ← Back to Admin
        </Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Carriers</h1>
        <p className="mt-1 text-[var(--color-muted)]">
          Manage carrier accounts and import cases.
        </p>
      </div>

      {/* Add carrier form */}
      <div className="rounded-lg border bg-[var(--color-card)] p-6 space-y-4">
        <h2 className="text-lg font-semibold">Add carrier</h2>
        <form action={createCarrierAction} className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="mb-1 block text-xs text-[var(--color-muted)]">Name *</label>
            <input
              name="name"
              required
              placeholder="Acme Insurance Co."
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm w-64"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[var(--color-muted)]">Contact email</label>
            <input
              name="contact_email"
              type="email"
              placeholder="contact@carrier.com"
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm w-64"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            Add carrier
          </button>
        </form>
      </div>

      {/* Carriers list */}
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-card)] border-b">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-muted)]">Name</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-muted)] hidden md:table-cell">
                Contact email
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-muted)] hidden lg:table-cell">
                Created
              </th>
              <th className="px-4 py-3 text-right font-medium text-[var(--color-muted)]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {(!carriers || carriers.length === 0) && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-[var(--color-muted)]">
                  No carriers yet. Add one above.
                </td>
              </tr>
            )}
            {carriers?.map((c) => (
              <tr key={c.id} className="hover:bg-[var(--color-card)] transition-colors">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-[var(--color-muted)] hidden md:table-cell">
                  {c.contact_email ?? "—"}
                </td>
                <td className="px-4 py-3 text-[var(--color-muted)] hidden lg:table-cell">
                  {new Date(c.created_at ?? "").toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <Link
                    href={`/admin/carriers/${c.id}/users`}
                    className="rounded px-3 py-1 text-xs bg-[var(--color-border)] hover:opacity-80 transition-opacity"
                  >
                    Users
                  </Link>
                  <Link
                    href={`/admin/carriers/${c.id}/import`}
                    className="rounded px-3 py-1 text-xs bg-[var(--color-border)] hover:opacity-80 transition-opacity"
                  >
                    Import cases
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
