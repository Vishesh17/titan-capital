import type { MetadataRoute } from "next";
import { sanityFetch } from "@/sanity/lib/client";
import {
  allTeamMemberSlugsQuery,
  blogPostSlugsQuery,
  founderStoryPageSlugsQuery,
  portfolioGridQuery,
} from "@/sanity/lib/queries";
import { getSiteUrl } from "@/sanity/lib/seo";

// Same 60s the rest of the site uses, so a newly published post shows up here within the minute.
export const revalidate = 60;

/* ── The pages that are actually live ──
   Not every folder in app/ — a sitemap is a request to index, so a page only goes in once
   it's finished. /winnersfund, /titanseedfund and /beyondthecheque are deliberately still
   out. `priority` is just relative importance within our own site. */
const STATIC_ROUTES: { path: string; priority: number }[] = [
  { path: "/", priority: 1.0 },
  { path: "/portfolio", priority: 0.9 },
  { path: "/blogs", priority: 0.9 },
  { path: "/ourstory", priority: 0.8 },
  { path: "/foundersstory", priority: 0.8 },
  { path: "/ourteam", priority: 0.8 },
  { path: "/indicorns", priority: 0.8 },
  { path: "/titanecosystem", priority: 0.7 },
  { path: "/getinvestment", priority: 0.7 },
  { path: "/privacy-policy", priority: 0.2 },
  { path: "/grievance-redressal", priority: 0.2 },
];

// Grabs slugs for one section. Returns [] if the fetch dies, so one bad query can't empty the whole sitemap.
async function slugsOrNone(query: string, tags?: string[]): Promise<string[]> {
  try {
    const slugs = await sanityFetch<string[] | null>({ query, revalidate, tags });
    return (slugs ?? []).filter(Boolean);
  } catch (err) {
    console.error("[sitemap] slug fetch failed, section omitted:", err);
    return [];
  }
}


// Portfolio has no slug field, so URLs come from the brand name. Must match companySlug in portfolio/[slug]/page.tsx or these 404.
function companySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Same idea as slugsOrNone, but the portfolio needs the whole grid doc to get at the brand names.
async function portfolioSlugs(): Promise<string[]> {
  try {
    const result = await sanityFetch<{ companies?: { brandName?: string }[] } | null>({
      query: portfolioGridQuery,
      revalidate,
    });
    return (result?.companies ?? [])
      .map((c) => (c?.brandName ? companySlug(c.brandName) : ""))
      .filter(Boolean);
  } catch (err) {
    console.error("[sitemap] portfolio fetch failed, section omitted:", err);
    return [];
  }
}

// Builds /sitemap.xml from Sanity, so publishing in the Studio adds the page here on its own.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = await getSiteUrl();

  // All four together, not one after another — this runs on every revalidation.
  const [blogs, stories, team, companies] = await Promise.all([
    slugsOrNone(blogPostSlugsQuery, ["blogsPage"]),
    slugsOrNone(founderStoryPageSlugsQuery, ["foundersStoryPage"]),
    slugsOrNone(allTeamMemberSlugsQuery, ["ourTeam"]),
    portfolioSlugs(),
  ]);


  // One timestamp for the lot. Google treats per-page dates as a weak hint anyway.
  const now = new Date();

  const entry = (path: string, priority: number) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority,
  });

  return [
    ...STATIC_ROUTES.map((r) => entry(r.path, r.priority)),
    ...blogs.map((slug) => entry(`/blogs/${slug}`, 0.7)),
    ...companies.map((slug) => entry(`/portfolio/${slug}`, 0.6)),
    ...team.map((slug) => entry(`/ourteam/${slug}`, 0.5)),
    // The individual stories, under the /foundersstory listing above.
    ...stories.map((slug) => entry(`/foundersstory/${slug}`, 0.5)),
  ];
}
