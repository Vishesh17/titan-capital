/**
 * Investment Stage assignments, transcribed verbatim from the list supplied on
 * 2026-08-18. Consumed by scripts/backfill-investment-stage.mjs.
 *
 * Only the non-default stages are listed. Every company not named here gets
 * DEFAULT_STAGE ("Seed"), which also sweeps up the legacy "Pre-Seed",
 * "Pre Seed" and "Pre-Series A" values that are no longer in the dropdown.
 */

export const DEFAULT_STAGE = "Seed";

export const STAGE_ASSIGNMENTS = {
  "Series A": [
    "91sqft.com",
    "Dealshare",
    "Dotpe",
    "Fae Beauty",
    "Fleetx",
    "Fynd",
    "Geniebook",
    "Jupiter",
    "Khatabook",
    "Moengage",
    "Mosaic Wellness",
    "Nester Home",
    "Ninety One",
    "OfBusiness",
    "Oziva",
    "Park+",
    "Stable Money",
    "Yellow Messenger",
  ],

  "Series B": ["Cart.com"],
};

/** Listed name → Sanity brandName, for names that don't resolve on their own. */
export const ALIASES = {};

/** Listed but not yet created in Sanity — reported, not blocking. */
export const NOT_YET_IN_SANITY = [];
