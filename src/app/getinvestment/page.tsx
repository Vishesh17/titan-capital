import Footer from "@/components/sections/Footer";
// import GetInvestmentHero from "@/components/sections/GetInvestmentHero";
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
          {/* THE HERO BANNER IS OFF FOR NOW — the page opens straight on the
              form. Commented rather than deleted, with its import above, so it
              is a two-line change to bring back. Nothing else on the page
              depended on it: the form and the FAQ are siblings, not children,
              and the navbar's own Get Investment pill already hides itself on
              this route, so there is no leftover reference to it. */}
          {/* <GetInvestmentHero /> */}
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
