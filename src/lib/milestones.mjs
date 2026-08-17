/**
 * Milestone derivation — the single source of truth.
 *
 * Written as .mjs (not .ts) on purpose: the portfolio detail page imports it
 * for rendering AND scripts/backfill-milestones.mjs imports it to write the
 * same values into Sanity. Node can't load .ts, and duplicating the rules in
 * the script would let the two drift apart silently.
 *
 * Three rules, in order. Each entry is added only when its source data exists:
 *   1. "Founded <foundingYear>"  — from Founding Year
 *   2. "Partnered <YYYY>"        — first 4 chars of Year ("2021-22" → 2021)
 *   3. "IPO"                     — when Tags contains the word "ipo"
 *
 * @typedef {Object} MilestoneSource
 * @property {string | null} [foundingYear]
 * @property {string | null} [year]
 * @property {string | null} [tags]
 */

/**
 * @param {MilestoneSource} c
 * @returns {string[]}
 */
export function deriveMilestones(c) {
  const out = [];

  const founded = (c.foundingYear || "").trim();
  if (founded) out.push(`Founded ${founded}`);

  // Year is stored as a fiscal range like "2021-22"; the milestone shows the
  // starting calendar year only.
  const invested = (c.year || "").trim().slice(0, 4);
  if (invested) out.push(`Partnered ${invested}`);

  // \b so "IPO" matches but words merely containing those letters don't.
  if (c.tags && /\bipo\b/i.test(c.tags)) out.push("IPO");

  return out;
}

/**
 * Split the stored comma-separated Milestones field into entries.
 * Returns [] for null/blank/comma-only input.
 *
 * @param {string | null | undefined} stored
 * @returns {string[]}
 */
export function parseMilestones(stored) {
  if (!stored) return [];
  return stored
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * What the page renders: a value typed in Sanity wins, and the derived list is
 * the default when that field is empty. Backfilling the field (see the script)
 * therefore changes nothing visually — it just makes the Studio show the same
 * milestones the site is already displaying.
 *
 * @param {MilestoneSource & { milestones?: string | null }} c
 * @returns {string[]}
 */
export function resolveMilestones(c) {
  const stored = parseMilestones(c.milestones);
  return stored.length > 0 ? stored : deriveMilestones(c);
}
