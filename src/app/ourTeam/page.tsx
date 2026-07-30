import Footer from "@/components/sections/Footer";
import LedByFoundersPage from "@/components/sections/LedByFounders";
import OurTeam from "@/components/sections/OurTeam";
import OurTeamHero from "@/components/sections/OurTeamHero";
import { buildMetadata } from "@/sanity/lib/seo";

export async function generateMetadata() {
  return buildMetadata("ourteam");
}

export default function OurTeamPage() {
  return (
    <>
      <main className="relative w-full p-0 m-0">
        <div className="relative z-[2] bg-white">
          <OurTeamHero />
          <LedByFoundersPage />
          <OurTeam />
        </div>
        <div className="sticky bottom-0 z-0">
          <Footer />
        </div>
      </main>
    </>
  );
}