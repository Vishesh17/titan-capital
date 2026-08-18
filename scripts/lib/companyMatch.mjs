/**
 * Matching hand-written company names against Sanity `brandName` values.
 *
 * Names drift between the sheet, Sanity and lists typed by hand:
 *   "Cobalt (Refold AI)"  vs  "Refold AI(Cobalt)"
 *   "SuperAgI (Contlo)"   vs  "SuperAGI(Contlo )"
 *   "Fix Health "         (trailing space)
 *   "Park+"               vs  "Park +"
 *
 * Strategy: normalise to bare alphanumerics, and index each parenthetical
 * alias separately so either half resolves. Deliberately NOT fuzzy — a near
 * match could assign the wrong sector or status silently, so anything that
 * doesn't resolve exactly is reported to the caller instead of guessed.
 */

export const norm = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

/** "Blitz (Growsimplee)" → ["blitzgrowsimplee", "blitz", "growsimplee"] */
export function keysFor(name) {
  const keys = new Set([norm(name)]);
  const outside = name.replace(/\([^)]*\)/g, " ").trim();
  const inside = [...name.matchAll(/\(([^)]*)\)/g)].map((m) => m[1]);
  if (outside) keys.add(norm(outside));
  inside.forEach((i) => i.trim() && keys.add(norm(i)));
  // Alias order can be inverted between sources.
  if (outside && inside.length === 1) keys.add(norm(inside[0] + outside));
  return [...keys].filter(Boolean);
}

/** Build a lookup of every key a Sanity company answers to → its array index. */
export function indexCompanies(companies) {
  const byKey = new Map();
  companies.forEach((c, i) => {
    keysFor(c.brandName || "").forEach((k) => {
      if (!byKey.has(k)) byKey.set(k, i);
    });
  });
  return byKey;
}

/**
 * Resolve one listed name to a company index, or undefined.
 * @param {string} name       as written in the hand-typed list
 * @param {Map} byKey         from indexCompanies()
 * @param {Record<string,string>} aliases  listed name → Sanity brandName
 */
export function resolveCompany(name, byKey, aliases = {}) {
  for (const k of keysFor(name)) {
    if (byKey.has(k)) return byKey.get(k);
  }
  const mapped = aliases[name];
  if (mapped) return byKey.get(norm(mapped));
  return undefined;
}
