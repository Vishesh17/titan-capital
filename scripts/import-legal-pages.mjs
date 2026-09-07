/**
 * Import the Privacy Policy and Grievance Redressal pages into Sanity.
 *
 *   USAGE (dev server must be running on :3000):
 *     node --env-file=.env.local scripts/import-legal-pages.mjs --dry
 *     node --env-file=.env.local scripts/import-legal-pages.mjs
 *     node --env-file=.env.local scripts/import-legal-pages.mjs --force
 *
 * IT READS THE RENDERED PAGES, not a transcription. The copy is thousands of
 * words of legal text; retyping it into this file would be one long
 * opportunity to drop a clause. Instead it fetches the two routes, parses the
 * <article>, and converts the DOM to Portable Text — so what lands in Sanity
 * is exactly what the site is serving today, links and all.
 *
 * REFUSES TO OVERWRITE. If a document already has a body it is left alone
 * unless --force, so running this twice cannot flatten edits made in Studio.
 */

import { createClient } from "@sanity/client";
import { parse } from "node-html-parser";

const DRY = process.argv.includes("--dry");
const FORCE = process.argv.includes("--force");
const ORIGIN = process.env.SITE_ORIGIN || "http://localhost:3000";

const token = process.env.SANITY_API_WRITE_TOKEN;
if (!token) {
  console.error("✗ SANITY_API_WRITE_TOKEN missing. Run with --env-file=.env.local");
  process.exit(1);
}

const client = createClient({
  projectId: "suel5z6g",
  dataset: "production",
  apiVersion: "2026-06-19",
  token,
  useCdn: false,
  perspective: "raw",
});

let counter = 0;
const key = () => `imp${(counter++).toString(36)}`;

/** Inline run of one block: spans, their marks, and any link annotations. */
function inlineOf(node) {
  const children = [];
  const markDefs = [];

  const walk = (n, marks) => {
    for (const c of n.childNodes) {
      // nodeType 3 === text
      if (c.nodeType === 3) {
        const text = c.rawText
          ? c.text.replace(/\s+/g, " ")
          : (c.text || "").replace(/\s+/g, " ");
        if (text) children.push({ _type: "span", _key: key(), text, marks: [...marks] });
        continue;
      }
      if (c.nodeType !== 1) continue;
      const tag = c.rawTagName?.toLowerCase();
      if (tag === "a") {
        const dk = key();
        markDefs.push({ _type: "link", _key: dk, href: c.getAttribute("href") });
        walk(c, [...marks, dk]);
      } else if (tag === "strong" || tag === "b") walk(c, [...marks, "strong"]);
      else if (tag === "em" || tag === "i") walk(c, [...marks, "em"]);
      else if (tag === "u") walk(c, [...marks, "underline"]);
      else walk(c, marks);
    }
  };
  walk(node, []);

  // Adjacent spans carrying the same marks are one span.
  const merged = [];
  for (const s of children) {
    const prev = merged[merged.length - 1];
    if (prev && JSON.stringify(prev.marks) === JSON.stringify(s.marks)) prev.text += s.text;
    else merged.push(s);
  }
  if (merged.length) {
    merged[0].text = merged[0].text.replace(/^\s+/, "");
    merged[merged.length - 1].text = merged[merged.length - 1].text.replace(/\s+$/, "");
  }
  const kept = merged.filter((s) => s.text.length);
  const used = new Set(kept.flatMap((s) => s.marks));
  return { children: kept, markDefs: markDefs.filter((d) => used.has(d._key)) };
}

/** Which of the legalText styles this paragraph is, read off how it is styled. */
function paragraphStyle(el) {
  const style = el.getAttribute("style") || "";
  const cls = el.getAttribute("class") || "";
  if (/letter-spacing/.test(style)) return "h4"; // the small grey spaced eyebrow
  if (/font-medium/.test(cls)) return "h5"; // the "Note:" lead-in
  return "normal";
}

function blocksFrom(root) {
  const blocks = [];
  const push = (style, el, listItem) => {
    const { children, markDefs } = inlineOf(el);
    if (!children.length) return;
    const b = { _type: "block", _key: key(), style, markDefs, children };
    if (listItem) b.listItem = listItem;
    blocks.push(b);
  };
  const visit = (node) => {
    for (const el of node.childNodes) {
      if (el.nodeType !== 1) continue;
      const tag = el.rawTagName?.toLowerCase();
      if (tag === "p") push(paragraphStyle(el), el);
      else if (tag === "h2") push("h2", el);
      else if (tag === "h3") continue; // fund-card titles — captured separately
      else if (tag === "ul") {
        for (const li of el.childNodes) {
          if (li.nodeType === 1 && li.rawTagName?.toLowerCase() === "li") push("normal", li, "bullet");
        }
      } else if (tag === "div") {
        // A fund card owns an <h3>; its rows are structured fields, not prose.
        if (el.querySelector("h3")) continue;
        visit(el);
      } else visit(el);
    }
  };
  visit(root);
  return blocks;
}

/** The white compliance cards at the foot of the Grievance page. */
function fundsFrom(root) {
  const LABEL_TO_FIELD = {
    "Fund Name": "fundName",
    "Effective Date": "effectiveDate",
    "Registration Number": "registrationNumber",
    "Registered office of the Fund": "registeredOffice",
    "Investment Manager": "investmentManager",
    Trustee: "trustee",
    "Sponsor to the Fund": "sponsor",
  };
  const cards = root.querySelectorAll("div").filter((d) => {
    const h3 = d.querySelector("h3");
    return h3 && h3.parentNode === d;
  });
  return cards.map((c) => {
    const out = { _type: "legalFundCard", _key: key(), title: c.querySelector("h3").text.trim() };
    for (const row of c.querySelectorAll("div")) {
      const spans = row.childNodes.filter(
        (n) => n.nodeType === 1 && n.rawTagName?.toLowerCase() === "span"
      );
      if (spans.length !== 2) continue;
      const field = LABEL_TO_FIELD[spans[0].text.trim()];
      if (!field) continue;
      const value = spans[1].text.trim();
      // An em dash is what an empty Effective Date renders as — store empty.
      out[field] = value === "—" ? "" : value;
    }
    return out;
  });
}

async function articleOf(path) {
  const res = await fetch(`${ORIGIN}${path}`);
  if (!res.ok) throw new Error(`${path} returned ${res.status}`);
  const html = await res.text();
  const m = html.match(/<article[^>]*>([\s\S]*?)<\/article>/);
  if (!m) throw new Error(`no <article> found on ${path}`);
  return parse(m[1]);
}

const TARGETS = [
  {
    path: "/privacy-policy",
    _id: "privacyPolicy-singleton",
    _type: "privacyPolicy",
    heading: "Privacy Policy",
    tabLabel: "Privacy Policy",
    withFunds: false,
  },
  {
    path: "/grievance-redressal",
    _id: "grievanceRedressal-singleton",
    _type: "grievanceRedressal",
    heading: "Grievance Redressal",
    tabLabel: "Grievance Redressal",
    withFunds: true,
  },
];

for (const t of TARGETS) {
  console.log(`\n─── ${t.path} → ${t._id} ───`);
  const root = await articleOf(t.path);
  const body = blocksFrom(root);
  const funds = t.withFunds ? fundsFrom(root) : null;

  const styles = body.reduce((m, b) => {
    const k = (b.listItem ? "bullet " : "") + b.style;
    m[k] = (m[k] || 0) + 1;
    return m;
  }, {});
  const links = body.flatMap((b) => b.markDefs).length;
  const chars = body.reduce((n, b) => n + b.children.reduce((x, c) => x + c.text.length, 0), 0);

  console.log(`  blocks: ${body.length}   ${JSON.stringify(styles)}`);
  console.log(`  links:  ${links}`);
  console.log(`  chars:  ${chars}`);
  if (funds) console.log(`  funds:  ${funds.length} — ${funds.map((f) => f.registrationNumber).join(", ")}`);

  if (!body.length) {
    console.error("  ✗ no blocks parsed — refusing to write an empty policy");
    process.exitCode = 1;
    continue;
  }

  const existing = await client.fetch(`*[_id == $id][0]{ _id, body }`, { id: t._id });
  if (existing?.body?.length && !FORCE) {
    console.log("  • already has a body — skipped (use --force to overwrite)");
    continue;
  }

  const doc = {
    _id: t._id,
    _type: t._type,
    heading: t.heading,
    tabLabel: t.tabLabel,
    body,
    ...(funds ? { funds } : {}),
  };

  if (DRY) console.log("  [dry] would write");
  else {
    await client.createOrReplace(doc);
    console.log("  ✓ written");
  }
}

console.log(DRY ? "\nDry run complete — re-run without --dry to apply." : "\nDone.");
