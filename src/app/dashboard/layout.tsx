import { redirect } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getCurrentUser, createClient } from "@/lib/supabase/server";
import { logOutAction } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // getCurrentUser is request-memoized, so this resolves instantly when child
  // pages call it again. Reads cookies, no network round-trip.
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Check if user is admin (lightweight select, no join)
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.is_admin ?? false;

  const links = [
    { href: "/dashboard", label: "Overview" },
    { href: "/dashboard/jobs", label: "My jobs" },
    { href: "/dashboard/posted", label: "Posted by me" },
    { href: "/dashboard/profile", label: "Profile" },
    ...(isAdmin ? [{ href: "/dashboard/admin", label: "⚙ Admin" }] : []),
  ];

  return (
    <>
      <SiteHeader />
      <div className="border-b bg-[var(--color-card)]">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
          <nav className="flex flex-wrap gap-1">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={`rounded-md px-3 py-1.5 text-[var(--color-fg)] hover:bg-[var(--color-border)]/50 ${
                  item.href === "/dashboard/admin"
                    ? "font-medium text-amber-700 dark:text-amber-400"
                    : ""
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <form action={logOutAction}>
            <Button type="submit" variant="ghost" size="sm">
              Log out
            </Button>
          </form>
        </div>
      </div>
      <main className="container-page py-8">{children}</main>
      <SiteFooter />
    </>
  );
}
