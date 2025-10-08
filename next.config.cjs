/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // ⛳️ Do not block production builds on lint errors
    ignoreDuringBuilds: true
  },
  experimental: { serverActions: true }
};

module.exports = nextConfig;
