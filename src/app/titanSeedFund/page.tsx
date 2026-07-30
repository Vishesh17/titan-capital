import Footer from "@/components/sections/Footer";
import FundDetails from "@/components/sections/FundDetails";
import TitanSeedHero from "@/components/sections/TitanSeedHero";
import WhatWeLookFor from "@/components/sections/WhatWeLookFor";
import WhyTitanSeed from "@/components/sections/WhyTitanSeed";
import { buildMetadata } from "@/sanity/lib/seo";

export async function generateMetadata() {
  return buildMetadata("titanSeedFund");
}

export default function TitanSeedFundPage() {
  return (
    <>
      <main className="relative w-full p-0 m-0">
        <div className="relative z-[2] bg-white">
          <TitanSeedHero />
          <WhyTitanSeed />
          <WhatWeLookFor />
          <FundDetails />
        </div>
        <div className="sticky bottom-0 z-0">
          <Footer />
        </div>
      </main>
    </>
  );
}