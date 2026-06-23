import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { createManualCaseAction } from "./actions";

export const metadata = { title: "Manual Case Entry — Admin" };

export default async function ManualCasePage({
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
  if (!carrier) notFound();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link
          href={`/admin/carriers/${carrierId}/import`}
          className="text-sm text-[var(--color-muted)] hover:text-[var(--color-fg)] transition-colors"
        >
          ← Back to import
        </Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Manual case entry — {carrier.name}
        </h1>
      </div>

      <form action={createManualCaseAction} className="rounded-lg border bg-[var(--color-card)] p-6 space-y-4">
        <input type="hidden" name="carrierId" value={carrierId} />

        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--color-muted)]">
            Named insured *
          </label>
          <input
            name="named_insured"
            required
            placeholder="Acme Corp"
            className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--color-muted)]">
              Line of business
            </label>
            <input
              name="line_of_business"
              placeholder="Commercial Property"
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--color-muted)]">
              Exposure basis type
            </label>
            <input
              name="exposure_basis_type"
              placeholder="TIV"
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--color-muted)]">
              Exposure basis value
            </label>
            <input
              name="exposure_basis_value"
              type="number"
              step="any"
              placeholder="1000000"
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--color-muted)]">
              Construction type
            </label>
            <input
              name="construction_type"
              placeholder="Frame"
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--color-muted)]">
              Protection class
            </label>
            <input
              name="protection_class"
              placeholder="3"
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--color-muted)]">
            Loss history summary
          </label>
          <textarea
            name="loss_history_summary"
            rows={3}
            placeholder="No losses in the past 5 years..."
            className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--color-muted)]">
            Coverage requested
          </label>
          <textarea
            name="coverage_requested"
            rows={3}
            placeholder="$5M property, $2M GL..."
            className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          className="rounded-md bg-[var(--color-primary)] px-6 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
        >
          Create case
        </button>
      </form>
    </div>
  );
}
