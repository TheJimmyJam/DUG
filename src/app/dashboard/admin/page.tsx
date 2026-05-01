import { redirect } from "next/navigation";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { getAllUsersAction, getAllJobsAction } from "./actions";
import { AdminPanel } from "./admin-panel";

export const metadata = { title: "Admin — DUG" };

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) redirect("/dashboard");

  // Load initial data server-side so first render is populated
  const [users, jobs] = await Promise.all([
    getAllUsersAction(),
    getAllJobsAction(),
  ]);

  return <AdminPanel initialUsers={users} initialJobs={jobs} />;
}
