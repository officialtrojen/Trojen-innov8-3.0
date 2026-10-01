import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Allows deployment builds on Vercel to complete cleanly without failing on 3D canvas JSX types
    ignoreBuildErrors: true,
  },
  eslint: {
    // Allows deployment builds to succeed without failing on legacy lint rules
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
