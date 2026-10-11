/**
 * PortfolioStats — server wrapper.
 *
 * THE BAR WAS NEVER WIRED TO SANITY. The four figures lived in a
 * `const stats = [...]` at the top of the component, so "300+ Companies
 * Backed" could only be changed by editing code and deploying.
 *
 * This is the split the rest of the codebase already uses — Hero/HeroClient,
 * Footer/FooterClient, SixFiftyFoundersSection/SixFiftyFounders. The page
 * keeps importing `PortfolioStats` and needs no change of its own; the fetch
 * happens here and the values are handed down.
 */
import { sanityFetch } from "@/sanity/lib/client";
import { portfolioStatsQuery } from "@/sanity/lib/queries";
import PortfolioStatsClient, {
  type PortfolioStatsData,
} from "./PortfolioStatsClient";

async function getData(): Promise<PortfolioStatsData | null> {
  try {
    return await sanityFetch<PortfolioStatsData | null>({
      query: portfolioStatsQuery,
      revalidate: 60,
    });
  } catch (err) {
    /* The client falls back to the four figures the bar shipped with, so a
       failed fetch renders it unchanged rather than empty. */
    console.error("[PortfolioStats] Sanity fetch failed, using fallback:", err);
    return null;
  }
}

export default async function PortfolioStats() {
  return <PortfolioStatsClient data={await getData()} />;
}
