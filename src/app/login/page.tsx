import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { DugMark } from "@/components/dug-mark";
import { LoginForm } from "./login-form";

export const metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <>
      <SiteHeader />
      <main className="container-page py-12">
        <div className="mx-auto max-w-md">
          <DugMark className="h-12 w-12 mb-4" />
          <h1 className="text-3xl font-semibold tracking-tight">Log in</h1>
          <p className="mt-1 text-[var(--color-muted)]">Welcome back.</p>

          <Card className="mt-6">
            <CardContent className="pt-6">
              <LoginForm />
              <p className="mt-6 text-center text-sm text-[var(--color-muted)]">
                New here?{" "}
                <Link
                  href="/signup"
                  className="font-medium text-[var(--color-primary)] hover:underline"
                >
                  Create an account
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
