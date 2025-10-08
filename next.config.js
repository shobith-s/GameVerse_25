/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  experimental: {
    serverActions: {}, // <-- object (or delete this whole 'experimental' block)
  },
};
module.exports = nextConfig;
