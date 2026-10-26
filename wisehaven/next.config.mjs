import withPWA from "@ducanh2912/next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // three.js ships as ESM; Next.js webpack must transpile it
  transpilePackages: ["three"],
};

export default withPWA({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  // Disable SW in development to avoid caching headaches
  disable: process.env.NODE_ENV === "development",
})(nextConfig);
