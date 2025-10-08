/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Don’t fail production builds on lint issues
  eslint: { ignoreDuringBuilds: true },
  // ✅ Don’t fail production builds on type errors
  typescript: { ignoreBuildErrors: true },

  experimental: { serverActions: true },
};

module.exports = nextConfig;
