import { redirect } from "next/navigation";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { updateReviewerProfileAction } from "./actions";

export const metadata = { title: "My Profile — Reviewer" };

export default async function ReviewerProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_carrier_reviewer, display_name, linkedin_url, is_cpcu")
    .eq("id", user.id)
    .single();

  if (!profile?.is_carrier_reviewer) redirect("/dashboard");

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <a
          href="/underwriter/cases"
          className="text-sm text-[var(--color-muted)] hover:text-[var(--color-fg)] transition-colors"
        >
          ← My cases
        </a>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">My profile</h1>
        <p className="mt-1 text-[var(--color-muted)]">
          Adding your credentials helps carriers trust the analyses you submit.
          Your name is never shown — only credential badges appear on the carrier dashboard.
        </p>
      </div>

      <div className="rounded-lg border bg-[var(--color-card)] p-6">
        <form action={updateReviewerProfileAction} className="space-y-5">

          <div>
            <label className="mb-1 block text-sm font-medium">
              LinkedIn profile URL
            </label>
            <input
              name="linkedin_url"
              type="url"
              defaultValue={profile.linkedin_url ?? ""}
              placeholder="https://www.linkedin.com/in/your-handle"
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              Adds a "LinkedIn Verified" badge to your analyses.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <input
              id="is_cpcu"
              name="is_cpcu"
              type="checkbox"
              defaultChecked={profile.is_cpcu ?? false}
              className="mt-0.5 h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-primary)]"
            />
            <div>
              <label htmlFor="is_cpcu" className="text-sm font-medium cursor-pointer">
                I hold a CPCU designation
              </label>
              <p className="text-xs text-[var(--color-muted)] mt-0.5">
                Adds a "CPCU" badge to your analyses. Self-reported — we may verify at a later stage.
              </p>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              className="rounded-md bg-[var(--color-primary)] px-5 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
            >
              Save
            </button>
            <a
              href="/underwriter/cases"
              className="text-sm text-[var(--color-muted)] hover:text-[var(--color-fg)] transition-colors"
            >
              Cancel
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
