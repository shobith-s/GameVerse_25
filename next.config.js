/** @type {import('next').NextConfig} */
const nextConfig = {
  // don’t fail the Vercel build on lint or type errors
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
