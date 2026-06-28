import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    // ignoreBuildErrors is true because Frontend re-exports backend types
    // that don't exist at build time. Set to false once backend types are published.
    ignoreBuildErrors: true,
  },
  // reactStrictMode false because some shadcn/ui components
  // have known double-mount side effects in dev.
  reactStrictMode: false,
  allowedDevOrigins: ['host.docker.internal'],
};

export default nextConfig;
