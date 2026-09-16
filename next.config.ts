import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin Turbopack's workspace root to THIS directory so it stops
  // walking up and finding the stray package-lock.json files at
  // ~/ and ~/Desktop/. Without this, Turbopack's persistence cache
  // ends up writing to a nonsense path relative to the wrong root,
  // which is what causes the "Failed to open database — invalid
  // digit found in string" error on start-up.
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: [
      // Sanity CDN — every asset uploaded through /studio resolves here.
      { protocol: "https", hostname: "cdn.sanity.io" },
    ],
    // Next 16 resolves every remote image's hostname and refuses it if any
    // address comes back private — an SSRF guard. On an IPv6-only network
    // (phone hotspot, Jio, some VPNs) DNS64 hands back a synthesised
    // 64:ff9b::/96 address for cdn.sanity.io alongside the real one, and that
    // prefix reads as private, so EVERY Sanity photo 400s with
    // '"url" parameter is not allowed'. It is the same public server, just
    // wearing a NAT64 prefix.
    //
    // Dev only. NODE_ENV is "production" for `next build`, so the guard is
    // fully intact on Vercel and this never ships.
    ...(process.env.NODE_ENV === "development"
      ? { dangerouslyAllowLocalIP: true }
      : {}),
  },
};

export default nextConfig;
