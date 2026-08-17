/**
 * The three portfolio filters and their allowed values — ONE source of truth.
 *
 * Imported by:
 *   - src/sanity/schemaTypes/portfolioGrid.ts  → renders these as dropdowns,
 *     so an editor can only pick a valid value instead of free-typing.
 *   - src/app/api/portfolio/route.ts           → builds the sidebar's filter
 *     options from these lists.
 *
 * The API used to derive the options from whatever strings happened to be in
 * the data (`distinctValues`). That is why "Active" showed up as a Status
 * filter: some rows carry status "Active", so it became an option. Driving
 * the options from these lists instead means a stray or legacy value can
 * never appear as a filter again — it simply won't match anything.
 *
 * Order matters: the sidebar lists values in the order written here, which is
 * why Stage no longer needs the ad-hoc STAGE_ORDER sort it used to carry.
 */

export const SECTORS = [
  "B2B Services",
  "Consumer Brand",
  "Consumer Tech",
  "FinTech",
  "HealthTech",
  "AI & SaaS",
] as const;

export const STAGES = ["Seed", "Series A", "Series B"] as const;

export const STATUSES = ["Recent Investment", "Exited"] as const;

/** Shape Sanity's `options.list` expects. */
export const asSanityList = (values: readonly string[]) =>
  values.map((v) => ({ title: v, value: v }));
