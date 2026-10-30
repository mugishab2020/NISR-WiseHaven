import withPWA from "@ducanh2912/next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // three.js ships as ESM; Next.js webpack must transpile it
  transpilePackages: ["three"],

  // ── Security headers ──────────────────────────────────────────────────────
  // Applied to all authenticated app routes. Prevents caching of financial
  // pages in shared/public caches, clickjacking, and MIME sniffing.
  async headers() {
    return [
      {
        // Authenticated app shell and all sub-routes
        source: "/(dashboard|envelopes|vault|deposit|activity|notifications|settings)(.*)",
        headers: [
          { key: "Cache-Control",           value: "no-store, max-age=0" },
          { key: "Pragma",                  value: "no-cache" },
          { key: "X-Content-Type-Options",  value: "nosniff" },
          { key: "X-Frame-Options",         value: "DENY" },
          { key: "Referrer-Policy",         value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        // Sign-in / sign-up pages should also not be cached
        source: "/(sign-in|sign-up)(.*)",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
          { key: "Pragma",        value: "no-cache" },
        ],
      },
      {
        // Public landing page — allow short-lived caching but no sensitive data
        source: "/",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options",        value: "DENY" },
          { key: "Referrer-Policy",        value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

// Only wrap with PWA in production — the plugin interferes with route
// resolution in development even when disable:true is set.
const isDev = process.env.NODE_ENV === "development";

export default isDev
  ? nextConfig
  : withPWA({
      dest: "public",
      cacheOnFrontEndNav: true,
      aggressiveFrontEndNavCaching: true,
      reloadOnOnline: true,
      disable: false,
      // Exclude API proxy routes and authenticated page data from SW cache
      // The SW should never cache financial data responses.
      runtimeCaching: [
        {
          // Backend API calls — never cache
          urlPattern: /^https?:\/\/.*\/api\/.*/i,
          handler: "NetworkOnly",
        },
        {
          // Static assets (fonts, icons, images) — cache-first is fine
          urlPattern: /\.(?:png|jpg|jpeg|svg|gif|ico|woff2?|ttf|otf)$/i,
          handler: "CacheFirst",
          options: {
            cacheName: "wisehaven-static-assets",
            expiration: { maxEntries: 64, maxAgeSeconds: 30 * 24 * 60 * 60 },
          },
        },
        {
          // Next.js static chunks — stale-while-revalidate
          urlPattern: /^\/_next\/static\/.*/i,
          handler: "StaleWhileRevalidate",
          options: {
            cacheName: "wisehaven-next-static",
          },
        },
      ],
    })(nextConfig);
