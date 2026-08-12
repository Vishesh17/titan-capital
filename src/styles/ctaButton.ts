import type { CSSProperties } from "react";

/**
 * Shared geometry for the primary "Get Investment" CTA.
 *
 * The navbar pill and the Founders-Testimonial CTA are the same control at the
 * same size — only the skin differs (navbar is outlined, the testimonial one is
 * filled navy). Measurements live here so the two can't drift apart again.
 *
 * Skin — background, border, text colour, weight — stays with each button.
 */
export const CTA_BUTTON_STYLE: CSSProperties = {
  width: "min(12.15vw, 18.8vh)",
  height: "min(3.36vw, 5.19vh)",
  // Level 6. Width/height stay here; only the label size is shared.
  fontSize: "clamp(12px, min(1.26vw, 2.00vh), 17px)",
  borderRadius: "53px",
};

/**
 * Mobile overrides. These carry `!` because Tailwind's `!important` is what
 * lets a class beat the inline `style` above — without it the desktop values
 * would win at every viewport.
 */
export const CTA_BUTTON_MOBILE_CLASS =
  "max-md:!w-[clamp(130px,35vw,160px)] max-md:!h-[clamp(38px,6dvh,44px)]";
