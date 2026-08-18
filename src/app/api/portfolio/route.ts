/*
  API Route: /api/portfolio
  Fetches portfolio grid companies from the "portfolioGrid" singleton in Sanity.
*/

import { sanityFetch } from "@/sanity/lib/client";
import { portfolioGridQuery } from "@/sanity/lib/queries";
import { SECTORS, STAGES, STATUSES } from "@/lib/portfolioFilters.mjs";

interface SanityGridCompany {
  brandName: string;
  year: string | null;
  sector: string | null;
  status: string | null;
  tags: string | null;
  investmentStage: string | null;
  fundType: string | null;
  logo: string | null;
  founderImage: string | null;
  foundingYear: string | null;
  oneLiner: string | null;
  about: string | null;
  website: string | null;
  founders: { name: string; linkedin: string | null }[] | null;
}

export interface PortfolioCompany {
  brandName: string;
  year: string;
  sector: string;
  status: string;
  tags: string;
  investmentStage: string;
  fundType: string;
  logo: string;
  founderImage: string;
  isRecent: boolean;
}

function getRecentYears(companies: SanityGridCompany[]): Set<string> {
  const years = companies
    .map((c) => c.year || "")
    .filter(Boolean)
    .sort()
    .reverse();
  const uniqueYears = [...new Set(years)];
  return new Set(uniqueYears.slice(0, 2));
}

function distinctValues(companies: SanityGridCompany[], key: keyof SanityGridCompany): string[] {
  const set = new Set<string>();
  for (const c of companies) {
    const val = c[key];
    if (typeof val === "string" && val.trim()) set.add(val.trim());
  }
  return Array.from(set).sort();
}

export async function GET() {
  try {
    const result = await sanityFetch<{ companies: SanityGridCompany[] } | null>({
      query: portfolioGridQuery,
      revalidate: 60,
    });

    const companies = result?.companies || [];

    if (companies.length === 0) {
      return Response.json({
        companies: [],
        filters: { sector: [...SECTORS], year: [], status: [...STATUSES], tags: [], investmentStage: [...STAGES], fundType: [] },
      });
    }

    const recentYears = getRecentYears(companies);

    const enriched: PortfolioCompany[] = companies.map((c) => ({
      brandName: c.brandName || "",
      year: c.year || "",
      sector: c.sector || "",
      status: c.status || "",
      tags: c.tags || "",
      investmentStage: c.investmentStage || "",
      fundType: c.fundType || "",
      logo: c.logo || "",
      founderImage: c.founderImage || "",
      isRecent: recentYears.has(c.year || ""),
    }));

    /* The three real filters come from the canonical lists, NOT from the
       data. Deriving them from the data is what surfaced "Active" as a
       Status option — a value some rows still carry. Sourcing them here
       means only the three sanctioned sets can ever appear in the sidebar.
       year / tags / fundType stay derived: nothing filters on them, they are
       returned only for other consumers. */
    const filters = {
      sector: [...SECTORS],
      status: [...STATUSES],
      investmentStage: [...STAGES],
      year: distinctValues(companies, "year"),
      tags: distinctValues(companies, "tags"),
      fundType: distinctValues(companies, "fundType"),
    };

    return Response.json({ companies: enriched, filters });
  } catch (err) {
    console.error("Portfolio API error:", err);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
