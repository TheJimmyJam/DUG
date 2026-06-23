import { redirect } from "next/navigation";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { getAllUsersAction, getAllJobsAction } from "@/app/dashboard/admin/actions";
import { AdminPanel } from "@/app/dashboard/admin/admin-panel";
import { loadPricingConfig } from "@/lib/pricing-config";

export const metadata = { title: "Admin — DUG" };

export default async function AdminIndexPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) redirect("/dashboard");

  const [users, jobs, pricingConfig] = await Promise.all([
    getAllUsersAction(),
    getAllJobsAction(),
    loadPricingConfig(),
  ]);

  return <AdminPanel initialUsers={users} initialJobs={jobs} initialPricingConfig={pricingConfig} />;
}
