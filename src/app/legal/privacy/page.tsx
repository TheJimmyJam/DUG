import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="container-page py-12">
        <article className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Placeholder — final privacy policy drafted before public launch.
          </p>
          <div className="mt-6 space-y-4 text-[var(--color-fg)]/90 leading-relaxed text-sm">
            <p>
              We collect: account information you provide (email, profile
              data), submission content you create, and basic platform usage
              metrics.
            </p>
            <p>
              We do not sell user data. Posters and underwriters see each
              other&apos;s relevant profile data within a job; everything else
              stays private to the user.
            </p>
            <p>
              When carriers eventually share submission data through the
              platform, that data is logically isolated per carrier and never
              cross-pollinated.
            </p>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
