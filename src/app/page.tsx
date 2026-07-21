import Hero from "@/components/sections/Hero";
import BackedBefore from "@/components/sections/BackedBefore";
import WhatFoundersGet from "@/components/sections/WhatFoundersGet";
import WhatWeBelieve from "@/components/sections/WhatWeBelieve";
import ImpactAtGlance from "@/components/sections/ImpactAtGlance";
import IndicornsSpotlight from "@/components/sections/IndicornSpotlight";
import FounderTestimonial from "@/components/sections/FoundersTestimonial";
import Footer from "@/components/sections/Footer";
import HeroBackedBg from "@/components/sections/HeroBackedBg";
export default function Home() {
  return (
    <>
    <main className="relative w-full p-0 m-0">
      {/* Raised content layer (z-2) — sits ON TOP of the footer and
          scrolls UP off it to reveal it, then covers it again on
          scroll-up. The mirror image of the Indicorns sticky-reveal. */}
      <div className="relative z-[2] bg-white">
        {/* Cappen-style pinned, staged background transition: the hero pins
            and its content fades out, then the whole screen crossfades
            navy → white (Backed Before) → beige (How We Show Up). All three
            sections ride transparently on the one backdrop. */}
        <HeroBackedBg
          hero={<Hero />}
          backed={<BackedBefore />}
          howWeShow={<WhatFoundersGet />}
        />
        <WhatWeBelieve />
        <ImpactAtGlance />
        {/* Sticky-reveal pair: Indicorns pins (position: sticky) while
            "What Our Founders Say" scrolls up and covers it — the same
            choreography as Impact ↔ Their Stories above. They share this
            wrapper so Indicorns unpins once the pair is scrolled past. */}
        <div className="relative">
          <IndicornsSpotlight />
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
