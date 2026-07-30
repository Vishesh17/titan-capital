import BackedEarly from "@/components/sections/BackedEarly";
import PortfolioStats from "@/components/sections/PortfolioStats";
import PortfolioGrid from "@/components/sections/PortfolioGrid";
import Footer from "@/components/sections/Footer";
import JoinPortfolioCTA from "@/components/sections/JoinPortfolio";
import { buildMetadata } from "@/sanity/lib/seo";

export async function generateMetadata() {
  return buildMetadata("portfolio");
}

export default function PortfolioPage() {
    return (
      <>
        <main className="relative w-full p-0 m-0">
          <div className="relative z-[2] bg-white">
            <BackedEarly />
            <PortfolioStats />
            <PortfolioGrid />
            <JoinPortfolioCTA />
          </div>
          <div className="sticky bottom-0 z-0">
            <Footer />
          </div>
        </main>
      </>
    );
  }