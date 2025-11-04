import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  /* config options here */
  // Explicitly configure for webpack since next-pwa requires it
  webpack: (config, { isServer }) => {
    return config;
  },
  // Silence Turbopack warning since we're using webpack
  turbopack: {},
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
})(nextConfig);
