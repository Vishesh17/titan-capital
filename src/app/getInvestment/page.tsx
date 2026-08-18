import Footer from "@/components/sections/Footer";
import GetInvestmentHero from "@/components/sections/GetInvestmentHero";
import GetInvestmentForm from "@/components/sections/GetInvestmentFormServer";
import GetInvestmentFAQ from "@/components/sections/GetInvestmentFAQ";
import { buildMetadata } from "@/sanity/lib/seo";

export async function generateMetadata() {
  return buildMetadata("getInvestment");
}

export default function GetInvestmentPage() {
  return (
    <>
      <main className="relative w-full p-0 m-0">
        <div className="relative z-[2] bg-white">
          <GetInvestmentHero />
          <GetInvestmentForm />
          <GetInvestmentFAQ />
        </div>
        <div className="sticky bottom-0 z-0">
          <Footer />
        </div>
      </main>
    </>
  );
}
