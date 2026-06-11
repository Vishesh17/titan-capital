/*
  API Route: /api/portfolio
  Fetches the public Google Sheet as CSV, parses it, and returns structured JSON.
  Caches for 5 minutes via Next.js revalidation to avoid hammering the sheet.

  Sheet: https://docs.google.com/spreadsheets/d/1LvHYkFm6HUzlXJbr_3Xuhs7k5YxtSUcDw6aiyZ8X8G4
  Columns (0-indexed):
    0: Brand Name | 1: Year | 2: Sector | 3: Status | 4: Tags |
    5: Investment Stage | 6: Fund Type | 7: Logo

  Row 0 is a proper header row and is skipped during parsing.
*/

const SHEET_ID = "1LvHYkFm6HUzlXJbr_3Xuhs7k5YxtSUcDw6aiyZ8X8G4";
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

export interface PortfolioCompany {
  brandName: string;
  year: string;
  sector: string;
  status: string;
  tags: string;
  investmentStage: string;
  fundType: string;
  logo: string;
}

/** Title-case a string, handling hyphens (e.g. "pre-seed" → "Pre-Seed"). */
function titleCase(s: string): string {
  return s.replace(/[a-zA-Z]+/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

/** Simple CSV parser that handles quoted fields. */
function parseCSVRow(row: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < row.length && row[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      fields.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

function rowToCompany(fields: string[]): PortfolioCompany | null {
  const get = (idx: number) => (fields[idx] || "").trim();

  const brandName = get(0);
  if (!brandName) return null;

  return {
    brandName,
    year: get(1),
    sector: get(2),
    status: get(3),
    tags: get(4),
    investmentStage: titleCase(get(5)),
    fundType: get(6),
    logo: get(7),
  };
}

function parseCSV(csv: string): PortfolioCompany[] {
  const lines = csv.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const companies: PortfolioCompany[] = [];

  // Skip row 0 (header row)
  for (let i = 1; i < lines.length; i++) {
    const fields = parseCSVRow(lines[i]);
    const company = rowToCompany(fields);
    if (company) companies.push(company);
  }

  return companies;
}

/** Extract unique non-empty values for a given key. */
function distinctValues(
  companies: PortfolioCompany[],
  key: keyof PortfolioCompany
): string[] {
  const set = new Set<string>();
  for (const c of companies) {
    const val = c[key];
    if (typeof val === "string" && val.trim()) set.add(val.trim());
  }
  return Array.from(set).sort();
}

/** Determine "recently invested" companies (last 2 financial years). */
function getRecentYears(companies: PortfolioCompany[]): Set<string> {
  const years = companies
    .map((c) => c.year)
    .filter(Boolean)
    .sort()
    .reverse();

  const uniqueYears = [...new Set(years)];
  return new Set(uniqueYears.slice(0, 2)); // top-2 most recent year bands
}

export async function GET() {
  try {
    const res = await fetch(CSV_URL, { next: { revalidate: 300 } });
    if (!res.ok) {
      return Response.json(
        { error: "Failed to fetch Google Sheet" },
        { status: 502 }
      );
    }

    const csvText = await res.text();
    const companies = parseCSV(csvText);
    const recentYears = getRecentYears(companies);

    // Tag each company with isRecent
    const enriched = companies.map((c) => ({
      ...c,
      isRecent: recentYears.has(c.year),
    }));

    const filters = {
      sector: distinctValues(companies, "sector"),
      year: distinctValues(companies, "year"),
      status: distinctValues(companies, "status"),
      tags: distinctValues(companies, "tags"),
      investmentStage: distinctValues(companies, "investmentStage"),
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
