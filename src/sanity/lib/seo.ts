import type { Metadata } from "next";
import { sanityFetch } from "./client";
import { pageSeoByKeyQuery, siteSeoQuery } from "./queries";

type SiteSeo = {
  siteName: string;
  siteUrl: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultShareImage?: string;
  keywords?: string[];
};

type PageSeo = {
  pageKey: string;
  metaTitle?: string;
  metaDescription?: string;
  shareImage?: string;
};


// Used only if Sanity is unreachable — keep it pointing at the live domain.
export const SITE_URL_FALLBACK = "https://titancapital.vc";

// The site's own address from Sanity. Every absolute URL (metadata, sitemap, robots) is built off this.
export async function getSiteUrl(): Promise<string> {
  try {
    const site = await sanityFetch<SiteSeo | null>({
      query: siteSeoQuery,
      tags: ["seo"],
    });
    // Strip the trailing slash so callers can just do `${base}/path`.
    return (site?.siteUrl || SITE_URL_FALLBACK).replace(/\/+$/, "");
  } catch (err) {
    console.error("[seo] siteUrl fetch failed, using fallback:", err);
    return SITE_URL_FALLBACK;
  }
}

export async function buildMetadata(pageKey?: string): Promise<Metadata> {
  // Wrap both fetches in try/catch so a transient network/Sanity blip
  // never crashes generateMetadata for the whole page.
  let site: SiteSeo | null = null;
  try {
    site = await sanityFetch<SiteSeo | null>({
      query: siteSeoQuery,
      tags: ["seo"],
    });
  } catch (err) {
    console.error("[seo] siteSeo fetch failed, using fallback:", err);
  }

  let page: PageSeo | null = null;
  if (pageKey) {
    try {
      page = await sanityFetch<PageSeo | null>({
        query: pageSeoByKeyQuery,
        params: { pageKey },
        tags: ["seo", `seo:${pageKey}`],
      });
    } catch (err) {
      console.error(`[seo] pageSeo fetch failed for "${pageKey}":`, err);
    }
  }

  const siteName = site?.siteName ?? "Titan Capital";
  const siteUrl = (site?.siteUrl || SITE_URL_FALLBACK).replace(/\/+$/, "");
  const title = page?.metaTitle ?? site?.defaultTitle ?? siteName;
  const description = page?.metaDescription ?? site?.defaultDescription ?? "";
  const shareImage = page?.shareImage ?? site?.defaultShareImage;

  return {
    title: pageKey
      ? title
      : { default: title, template: `%s - ${siteName}` },
    description,
    keywords: site?.keywords,
    authors: [{ name: siteName }],
    creator: siteName,
    metadataBase: new URL(siteUrl),
    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large" as const,
      "max-snippet": -1,
      "max-video-preview": -1,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName,
      title,
      description,
      url: siteUrl,
      images: shareImage
        ? [{ url: shareImage, width: 1200, height: 630 }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: shareImage ? [shareImage] : undefined,
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      ],
      apple: "/apple-icon.png",
    },
    manifest: "/site.webmanifest",
    other: {
      "msapplication-TileImage": "/icon-192.png",
    },
  };
}
