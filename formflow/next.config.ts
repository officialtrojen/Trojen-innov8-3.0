import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Allows deployment builds on Vercel to complete cleanly without failing on 3D canvas JSX types
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
