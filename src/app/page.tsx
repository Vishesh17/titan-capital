import type { Metadata } from "next";
import Hero from "@/components/sections/Hero";
import WhatFoundersGet from "@/components/sections/WhatFoundersGet";
import WhatWeBelieve from "@/components/sections/WhatWeBelieve";
import ImpactAtGlance from "@/components/sections/ImpactAtGlance";
import IndicornsSpotlight from "@/components/sections/IndicornSpotlight";
import FounderTestimonial from "@/components/sections/FoundersTestimonial";
import Footer from "@/components/sections/Footer";
import HeroBackedBg from "@/components/sections/HeroBackedBg";

/* THE HOMEPAGE CANONICAL, and only the homepage's.
   The rest of the site self-references through `alternates: { canonical: "./" }`
   in buildMetadata, which Next resolves against the route's own path — correct
   everywhere except here. The app-router root page is "/index" internally, so
   "./" resolved to https://titancapital.vc/index, a URL that does not exist and
   that Google would treat as the preferred version of the home page.
   Overriding just this one route keeps every other canonical self-referencing;
   putting "/" in the shared helper instead would declare that EVERY page is the
   homepage and drop the blogs, portfolio and team pages out of the index. */
export async function generateMetadata(): Promise<Metadata> {
  return { alternates: { canonical: "/" } };
}

export default function Home() {
  return (
    <>
    <main className="relative w-full p-0 m-0">
      {/* Raised content layer (z-2) — sits ON TOP of the footer and
          scrolls UP off it to reveal it, then covers it again on
          scroll-up. The mirror image of the Indicorns sticky-reveal. */}
      <div className="relative z-[2] bg-white">
        {/* The first screen pins while How We Show Up climbs over it.
            BACKED BEFORE IS NOT LISTED HERE ANY MORE — it is rendered inside
            the hero section itself (see Hero.tsx), which is what lets the two
            share a single unbroken background. */}
        <HeroBackedBg hero={<Hero />} howWeShow={<WhatFoundersGet />} />
        <WhatWeBelieve />
        <ImpactAtGlance />
        {/* Sticky-reveal pair: Indicorns pins (position: sticky) while
            "What Our Founders Say" scrolls up and covers it — the same
            choreography as Impact ↔ Their Stories above. They share this
            wrapper so Indicorns unpins once the pair is scrolled past. */}
        <div className="relative">
          <IndicornsSpotlight />
          {/* Dwell spacer — Indicorns is sticky and fills the viewport, so
              this extra scroll height keeps it PINNED (a brief pause) before
              the testimonial section scrolls up over it. Kept short so the
              Indicorns dwell doesn't feel too long. */}
          <div aria-hidden className="h-[35vh] w-full" />
          <FounderTestimonial />
        </div>
      </div>
      {/* Footer pinned to the viewport bottom (z-0), revealed as the
          content layer above slides off it on scroll-down. */}
      <div className="sticky bottom-0 z-0">
        <Footer />
      </div>
      </main>
    </>
  );
}
