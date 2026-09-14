import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/sanity/lib/seo";

// Builds /robots.txt — lets crawlers in, keeps them out of /studio and /api, and points them at the sitemap.
export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = await getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/studio", "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
