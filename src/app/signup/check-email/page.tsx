import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { Mail } from "lucide-react";

export const metadata = { title: "Check your email" };

export default function CheckEmailPage() {
  return (
    <>
      <SiteHeader />
      <main className="container-page py-12">
        <div className="mx-auto max-w-md">
          <Card>
            <CardContent className="pt-8 pb-8 text-center">
              <Mail className="mx-auto h-10 w-10 text-[var(--color-primary)]" />
              <h1 className="mt-4 text-2xl font-semibold tracking-tight">
                Check your email
              </h1>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                We sent you a confirmation link. Click it to activate your DUG
                profile and you&apos;ll be redirected to your dashboard.
              </p>
              <p className="mt-6 text-sm">
                Didn&apos;t get it?{" "}
                <Link
                  href="/signup"
                  className="font-medium text-[var(--color-primary)] hover:underline"
                >
                  Try again
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
