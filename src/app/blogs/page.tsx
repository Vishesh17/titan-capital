import BlogsHeroClient from "@/components/sections/BlogsHero";
import BlogsClient from "@/components/sections/BlogsClient";
import Footer from "@/components/sections/Footer";
import { buildMetadata } from "@/sanity/lib/seo";

export async function generateMetadata() {
  return buildMetadata("getinvestment");
}

export default function GetInvestmentPage() {
  return (
    <>
      <main className="relative w-full p-0 m-0">
        <div className="relative z-[2] bg-white">
            <BlogsHeroClient />
            <BlogsClient />
        </div>
        <div className="sticky bottom-0 z-0">
          <Footer />
        </div>
      </main>
    </>
  );
}
