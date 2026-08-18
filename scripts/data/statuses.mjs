/**
 * Status assignments, transcribed verbatim from the list supplied on
 * 2026-08-18. Consumed by scripts/backfill-statuses.mjs.
 *
 * Every company NOT listed here gets its status cleared — "Active" is no
 * longer a value, and an unset status is how an active company is now
 * represented. See src/lib/portfolioFilters.mjs for the two allowed values.
 */

export const STATUS_ASSIGNMENTS = {
  Exited: [
    "Aisle",
    "Beardo",
    "Bewakoof",
    "Bira",
    "Fynd",
    "IndusOS",
    "Logipe",
    "Mosaic Wellness",
    "Netmeds",
    "RazorPay",
    "Visit",
    "Volt",
  ],

  // Singular — matches the dropdown value in src/lib/portfolioFilters.mjs.
  "Recent Investment": [
    "The Croffle Guys",
    "Luzo",
    "Kyoora",
    "Xstep",
    "Savr",
    "Pruf",
    "Bruno Milano",
    "Spring Street",
    "Sandowitch",
    "Echovane",
    "Open Metal",
    "Bucketlistt",
    "Hundo Pizza",
    "Eluno",
    "Peeko",
    "Homerun",
    "Sookti AI",
    "Gimi Michi",
    "Aroleap",
    "Instafix",
    "Elevate Now",
    "Omli Kids",
    "For Real",
    "Nester Home",
    "&Done",
    "Laani",
    "RidEV",
    "Lane",
  ],
};

/** Listed name → Sanity brandName, for names that don't resolve on their own. */
export const ALIASES = {};

/**
 * Listed under Recent Investment but no such company exists in Sanity yet —
 * new investments that were never added to the portfolio. Named here so the
 * script reports them as pending instead of blocking the run, while a genuine
 * typo in any OTHER name still halts it.
 *
 * Delete a name from this list once its company is created in the Studio, and
 * re-run to give it its status.
 */
export const NOT_YET_IN_SANITY = [
  "Luzo",
  "Kyoora",
  "Xstep",
  "Savr",
  "Pruf",
  "Bruno Milano",
  "Spring Street",
  "Sandowitch",
  "Open Metal",
  "Bucketlistt",
  "Hundo Pizza",
];

/**
 * Tag values that survive when a company falls into the "active" bucket.
 *
 * The card ribbon reads `tags` (PortfolioGrid.tsx), so flattening every
 * unlisted company to "Active" would drop the IPO ribbon from Mamaearth, Ola,
 * Shadowfax, Unicommerce and Urban Company, and the Acquired ribbon from
 * OZiva. Those say something the Status field cannot, so they are kept.
 * Pass --flatten-tags to overwrite them with "Active" anyway.
 */
export const PRESERVED_TAGS = ["IPO", "Acquired"];
