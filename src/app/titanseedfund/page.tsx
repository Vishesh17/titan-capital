/* ═══════════════════════════════════════════════════════════════════
   THIS PAGE IS OFF.

   `notFound()` rather than an empty render: the route was returning 200
   with real content, so it was reachable by anyone with the URL and fully
   indexable — leaving the sections commented out but the route alive would
   have served a blank 200, which is worse for search than a clean 404.
   A 404 is also what tells Google to drop it from the index.

   Everything below is intact, just commented. To bring the page back,
   delete the `notFound()` line, uncomment the imports and the body, and
   restore its entry in STATIC_ROUTES in src/app/sitemap.ts.
   ═══════════════════════════════════════════════════════════════════ */
import { notFound } from "next/navigation";

// import Footer from "@/components/sections/Footer";
// import FundDetails from "@/components/sections/FundDetails";
// import TitanSeedHero from "@/components/sections/TitanSeedHero";
// import WhatWeLookFor from "@/components/sections/WhatWeLookFor";
// import WhyTitanSeed from "@/components/sections/WhyTitanSeed";
// import { buildMetadata } from "@/sanity/lib/seo";
//
// export async function generateMetadata() {
//   return buildMetadata("titanSeedFund");
// }
//
// export default function TitanSeedFundPage() {
//   return (
//     <>
//       <main className="relative w-full p-0 m-0">
//         <div className="relative z-[2] bg-white">
//           <TitanSeedHero />
//           <WhyTitanSeed />
//           <WhatWeLookFor />
//           <FundDetails />
//         </div>
//         <div className="sticky bottom-0 z-0">
//           <Footer />
//         </div>
//       </main>
//     </>
//   );
// }

export default function TitanSeedFundPage() {
  notFound();
}
