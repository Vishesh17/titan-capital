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
  },
};

export default nextConfig;
