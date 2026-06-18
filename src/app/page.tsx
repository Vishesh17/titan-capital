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
      <IndicornsSpotlight />
      <FounderTestimonial />
      <Footer />
      </main>
    </>
  );
}
