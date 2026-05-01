import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Re-enable once you're running locally — gives you compile-time validation
  // of every <Link href> string. Disabled here because the sandbox where
  // Claude is doing build-verification can't load the SWC binary.
  typedRoutes: false,
};

export default nextConfig;
