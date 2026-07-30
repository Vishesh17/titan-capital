import Footer from "@/components/sections/Footer";
import IndicornCompanies from "@/components/sections/IndicornCompanies";
import IndicornsHero from "@/components/sections/IndicornsHero";
import WhyIndicorns from "@/components/sections/WhyIndicornsClient";
import IndicornTestimonial from "@/components/sections/IndicornTestimonials";
import { buildMetadata } from "@/sanity/lib/seo";

export async function generateMetadata() {
  return buildMetadata("indicorns");
}

export default function IndicornsPage() {
  return (
    <main className="flex min-h-screen w-full flex-col">
      <IndicornsHero />
      <WhyIndicorns />
      {/* Sticky-reveal pair: IndicornCompanies pins (position: sticky)
          while IndicornTestimonials scrolls up and covers it — the same
          choreography as IndicornSpotlight ↔ FoundersTestimonial on the
          home page. They share this wrapper so Companies unpins once the
          pair is scrolled past. */}
      <div className="relative">
        <IndicornCompanies />
        {/* Dwell spacer keeps Companies pinned a beat before Testimonials
            slides over it. */}
        <div aria-hidden className="h-[35vh] w-full" />
        <IndicornTestimonial />
      </div>
      <Footer />
    </main>
  );
}
