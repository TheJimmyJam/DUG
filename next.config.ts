import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Re-enable once you're running locally — gives you compile-time validation
  // of every <Link href> string. Disabled here because the sandbox where
  // Claude is doing build-verification can't load the SWC binary.
  typedRoutes: false,

  async redirects() {
    return [
      // Legacy job URLs → engagements
      { source: "/jobs", destination: "/engagements", permanent: true },
      { source: "/jobs/:id", destination: "/engagements/:id", permanent: true },
      { source: "/jobs/:id/submit", destination: "/engagements/:id/submit", permanent: true },
      { source: "/jobs/:id/review", destination: "/engagements/:id/review", permanent: true },
      { source: "/post-job", destination: "/post-engagement", permanent: true },
      { source: "/dashboard/jobs", destination: "/dashboard/engagements", permanent: true },
    ];
  },
};

export default nextConfig;
