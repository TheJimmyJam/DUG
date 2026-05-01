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
     *
     * Public pages (/jobs, /underwriters, /, /about, /u/[handle], etc.)
     * are intentionally excluded so they never pay the Supabase getUser()
     * network round-trip on every navigation.
     */
    "/dashboard/:path*",
    "/post-job/:path*",
    "/jobs/:id/submit/:path*",
    "/jobs/:id/review/:path*",
    "/auth/:path*",
  ],
};
