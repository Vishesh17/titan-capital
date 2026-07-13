import Hero from "@/components/sections/Hero";
import BackedBefore from "@/components/sections/BackedBefore";
import FeaturedFounderStory from "@/components/sections/FeaturedFounderStory";
import WhatFoundersGet from "@/components/sections/WhatFoundersGet";
import WhatWeBelieve from "@/components/sections/WhatWeBelieve";
import ImpactAtGlance from "@/components/sections/ImpactAtGlance";
import IndicornsSpotlight from "@/components/sections/IndicornSpotlight";
import BackedEarly from "@/components/sections/BackedEarly";
import FounderTestimonial from "@/components/sections/FoundersTestimonial";
import Footer from "@/components/sections/Footer";
export default function Home() {
  return (
    <>
    <main className="relative w-full p-0 m-0">
      <Hero />
      <BackedBefore />
      <WhatFoundersGet />
      <WhatWeBelieve />
      <ImpactAtGlance />
      {/* <FeaturedFounderStory /> */}
      {/* Sticky-reveal pair: Indicorns pins (position: sticky) while
          "What Our Founders Say" scrolls up and covers it — the same
          choreography as Impact ↔ Their Stories above. They share this
          wrapper so Indicorns unpins once the pair is scrolled past. */}
      <div className="relative">
        <IndicornsSpotlight />
        <FounderTestimonial />
      </div>
      <Footer />
      </main>
    </>
  );
}
