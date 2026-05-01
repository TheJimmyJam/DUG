import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { DugMark } from "@/components/dug-mark";
import { SignupForm } from "./signup-form";

export const metadata = { title: "Create your profile" };

export default function SignupPage() {
  return (
    <>
      <SiteHeader />
      <main className="container-page py-12">
        <div className="mx-auto max-w-md">
          <DugMark className="h-12 w-12 mb-4" />
          <h1 className="text-3xl font-semibold tracking-tight">Join DUG</h1>
          <p className="mt-1 text-[var(--color-muted)]">
            Create your underwriter profile in under a minute.
          </p>

          <Card className="mt-6">
            <CardContent className="pt-6">
              <SignupForm />
              <p className="mt-6 text-center text-sm text-[var(--color-muted)]">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-[var(--color-primary)] hover:underline"
                >
                  Log in
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
