import type { CSSProperties } from "react";

/**
 * The site's navy glass — one material, shared by the navbar and the menu
 * panel so the bar can't drift away from the panel that slides out under it.
 *
 * Anchored on #001A4D, the brand navy (the navbar pill, the CTAs, and the
 * outer stop of the hero's glow all use it). Note the home hero's own canvas
 * is #00112E, a darker navy — this material is deliberately the #001A4D
 * family, not the hero background.
 *
 * Three things have to hold at once, and they pull against each other:
 *
 *   TRANSLUCENT — you should see the page moving behind it. That's the whole
 *     point of glass, so the fill sits at 0.82–0.90 rather than opaque.
 *   DARK — but translucency is also what made an earlier version look washed
 *     out: over a white page, whatever shows through lifts the whole surface
 *     toward grey. The fix isn't more opacity, it's knocking the backdrop
 *     down BEFORE the navy lands. brightness() does that, so the material
 *     reads the same over the dark hero and the white detail pages, while
 *     saturate(1.7) keeps real colour coming through rather than grey.
 *   GLOSSY — a gradient through the navy for body, plus a short specular.
 *
 * The specular is measured in PIXELS, not percentages. The navbar is ~72px
 * tall and the panel is the full viewport; a percentage highlight would be a
 * hairline on one and a broad band across the other — that band was what read
 * as a pale border across the panel's header. In px they match exactly.
 */

/** Gloss + the navy gradient. Layered topmost-first, as CSS expects. */
export const GLASS_NAVY_BACKGROUND = [
  "linear-gradient(180deg, rgba(255,255,255,0.075) 0px, rgba(255,255,255,0.022) 6px, rgba(255,255,255,0) 22px)",
  "linear-gradient(180deg, rgba(0,32,92,0.46) 0%, rgba(0,26,77,0.50) 55%, rgba(0,18,56,0.56) 100%)",
].join(", ");

/* alpha and brightness move TOGETHER — thin the fill without dropping the
   brightness and a white page behind pulls the whole surface up to grey,
   which is the failure this material started with. At 0.50/0.28 a white
   backdrop lands near rgb(36,49,74) through the glass and a dark one near
   rgb(0,15,45): the surface genuinely takes on what's behind it, which is
   the point of glass.

   White type stays comfortably legible on it — ~13:1 against the lightest
   composite, well past WCAG AA — so translucency can go here without
   costing readability.

   Worth knowing if the colour is ever revisited: this composites lighter
   than the solid #001A4D cards in What We Believe, so the bar reads as a
   related navy rather than the identical one. That gap is the price of the
   see-through; closing it means alpha toward 0.78 and brightness toward
   0.14. Kept translucent here by preference. */
export const GLASS_NAVY_BACKDROP = "blur(44px) saturate(1.75) brightness(0.28)";

/** Shared base. Add the lit edge per surface — the panel is lit down its
 *  trailing edge, the navbar along its bottom, since that's where each one
 *  actually catches light. */
export const GLASS_NAVY: CSSProperties = {
  background: GLASS_NAVY_BACKGROUND,
  backdropFilter: GLASS_NAVY_BACKDROP,
  WebkitBackdropFilter: GLASS_NAVY_BACKDROP,
};

/** The slide-out menu: lit trailing edge, inner bloom, and a cast shadow. */
export const GLASS_NAVY_PANEL: CSSProperties = {
  ...GLASS_NAVY,
  boxShadow: [
    "inset -1px 0 0 0 rgba(160,200,255,0.20)",
    "inset 0 0 130px 0 rgba(30,80,190,0.10)",
    "0 0 70px rgba(0,0,0,0.62)",
  ].join(", "),
};

/** The navbar: same material, lit along the bottom edge instead. Tinted blue
 *  rather than white — a white hairline sits *on* the glass and reads as a
 *  drawn border; a blue one reads as the edge catching light. */
export const GLASS_NAVY_BAR: CSSProperties = {
  ...GLASS_NAVY,
  boxShadow: [
    "inset 0 -1px 0 0 rgba(160,200,255,0.16)",
    "0 6px 26px rgba(0,0,0,0.30)",
  ].join(", "),
};
