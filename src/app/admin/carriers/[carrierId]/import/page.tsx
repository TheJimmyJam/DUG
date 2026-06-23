import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

export const metadata = { title: "Import Cases — Admin" };

export default async function CarrierImportPage({
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
    .select("id, name, contact_email")
    .eq("id", carrierId)
    .single();
  if (!carrier) notFound();

  const { data: batches } = await supabase
    .from("import_batches")
    .select("id, source_format, status, created_at")
    .eq("carrier_id", carrierId)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/carriers"
          className="text-sm text-[var(--color-muted)] hover:text-[var(--color-fg)] transition-colors"
        >
          ← Back to carriers
        </Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Import cases — {carrier.name}
        </h1>
        <p className="mt-1 text-[var(--color-muted)]">
          Upload a CSV or XLSX file, or enter cases manually.
        </p>
      </div>

      {/* Upload form */}
      <div className="rounded-lg border bg-[var(--color-card)] p-6 space-y-4">
        <h2 className="text-lg font-semibold">Upload file</h2>
        <form
          method="POST"
          encType="multipart/form-data"
          action={`/api/admin/carriers/${carrierId}/import`}
          className="space-y-3"
        >
          <div>
            <label className="mb-1 block text-xs text-[var(--color-muted)]">
              File (CSV or XLSX)
            </label>
            <input
              name="file"
              type="file"
              accept=".csv,.xlsx,.xls"
              required
              className="block text-sm file:mr-3 file:rounded file:border-0 file:bg-[var(--color-border)] file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:opacity-80"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            Upload and map columns
          </button>
        </form>
      </div>

      {/* Manual entry */}
      <div className="rounded-lg border bg-[var(--color-card)] p-6">
        <h2 className="text-lg font-semibold mb-2">Manual entry</h2>
        <p className="text-sm text-[var(--color-muted)] mb-4">
          Enter a single case manually without uploading a file.
        </p>
        <Link
          href={`/admin/carriers/${carrierId}/import/manual`}
          className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-medium hover:bg-[var(--color-border)]/30 transition-colors"
        >
          Enter case manually
        </Link>
      </div>

      {/* Existing batches */}
      {batches && batches.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Import batches</h2>
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-card)] border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-[var(--color-muted)]">Format</th>
                  <th className="px-4 py-3 text-left font-medium text-[var(--color-muted)]">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-[var(--color-muted)] hidden md:table-cell">
                    Created
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-[var(--color-muted)]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {batches.map((b) => (
                  <tr key={b.id} className="hover:bg-[var(--color-card)] transition-colors">
                    <td className="px-4 py-3 uppercase text-xs font-medium">{b.source_format}</td>
                    <td className="px-4 py-3">
                      <span className="capitalize rounded px-2 py-0.5 text-xs bg-[var(--color-border)]">
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-muted)] hidden md:table-cell">
                      {new Date(b.created_at ?? "").toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {b.status === "mapping" && (
                        <Link
                          href={`/admin/carriers/${carrierId}/import/${b.id}/map`}
                          className="rounded px-3 py-1 text-xs bg-[var(--color-primary)] text-white hover:opacity-80 transition-opacity"
                        >
                          Map columns
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
