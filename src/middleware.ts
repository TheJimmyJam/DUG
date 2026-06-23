import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Only run auth middleware on routes that actually require a session:
     * - /dashboard and all sub-pages
     * - /post-job
     * - /jobs/[id]/submit and /jobs/[id]/review (auth-gated actions)
     * - /auth (callback / sign-out routes)
     * - /admin/carriers, /underwriter/cases, /carrier (carrier ingestion MVP)
     *
     * Public pages (/jobs, /underwriters, /, /about, /u/[handle], etc.)
     * are intentionally excluded so they never pay the Supabase getUser()
     * network round-trip on every navigation.
     */
    "/dashboard/:path*",
    "/post-engagement/:path*",
    "/engagements/:id/submit/:path*",
    "/engagements/:id/review/:path*",
    "/auth/:path*",
    "/reset-password/:path*",
    "/admin/carriers/:path*",
    "/underwriter/cases/:path*",
    "/carrier/:path*",
  ],
};
