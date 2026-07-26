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
    <main className="flex min-h-screen w-full flex-col">
      <TitanSeedHero />
      <WhyTitanSeed />
      <WhatWeLookFor />
      <FundDetails />
      <Footer />   
      {/* You can add your next sections below here later */}
    </main>
  );
}