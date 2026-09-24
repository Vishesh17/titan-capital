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
// import WinnersHero from "@/components/sections/WinnersHero";
// import AboutTheFund from "@/components/sections/AboutTheFund";
// import PortfolioWinnerFund from "@/components/sections/PortfolioWinnerFund";
// import FundDetails from "@/components/sections/FundDetails";
// import { buildMetadata } from "@/sanity/lib/seo";
//
// export async function generateMetadata() {
//   return buildMetadata("winnersFund");
// }
//
// export default function TitanWinnersFundPage() {
//   return (
//     <main className="flex min-h-screen w-full flex-col">
//       <WinnersHero />
//       <AboutTheFund />
//       <PortfolioWinnerFund />
//       <FundDetails />
//       <Footer />
//     </main>
//   );
// }

export default function TitanWinnersFundPage() {
  notFound();
}
