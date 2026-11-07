import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  output: "standalone",
  typescript: { ignoreBuildErrors: true },
  reactStrictMode: false,
  async headers() {
    return [{ source: '/(.*)', headers: [
      { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate, max-age=0' },
    ]}];
  },
};
export default nextConfig;
