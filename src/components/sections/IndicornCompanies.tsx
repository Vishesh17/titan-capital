"use client";

import { motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE },
  },
};

// Types can match your wrapper definition
export interface PortfolioCompany {
  name: string;
  logoUrl: string;
  description: string;
}

export interface IndicornSpotlightData {
  companies?: PortfolioCompany[];
}

const fallbackData: PortfolioCompany[] = [
  {
    name: "Unicommerce",
    logoUrl: "/images/portfolio_grid/unicommerce-logo.png", // Replace with your logo path
    description:
      "India's leading e-commerce SaaS platform, enabling thousands of brands to manage multi-channel operations.",
  },
  {
    name: "Razorpay",
    logoUrl: "/images/portfolio_grid/razorpay-logo.png", // Replace with your logo path
    description:
      "Razorpay has grown from a simple payment gateway to India's most comprehensive full-stack financial solutions platform.",
  },
  {
    name: "OfBusiness",
    logoUrl: "/images/portfolio_grid/ofbusiness.png", // Replace with your logo path
    description:
      "India's largest B2B marketplace for manufacturing and infrastructure SMEs, offering both raw material procurement and embedded financing",
  },
];

export default function IndicornCompanies({
  data,
}: {
  data?: IndicornSpotlightData | null;
}) {
  const companies = data?.companies?.length ? data.companies : fallbackData;

  return (
    <section
      className="relative flex w-full items-center overflow-hidden bg-[#040e24] font-['Poppins',_sans-serif] max-md:!min-h-[100vh]"
      style={{
        // Sticky-reveal: this section pins to the top of the viewport
        // while the testimonial section below scrolls up and covers it —
        // identical choreography to IndicornSpotlight → FoundersTestimonial
        // on the home page. It must be ~one viewport tall so it pins
        // cleanly, so the content is vertically centred within 100vh.
        position: "sticky",
        top: 0,
        zIndex: 1,
        minHeight: "100vh",
        paddingTop: "var(--section-py)",
        paddingBottom: "var(--section-py)",
        paddingLeft: "var(--section-px-wide)",
        paddingRight: "var(--section-px-wide)",
      }}
    >
      {/* Background ambient glows matching the screenshot */}
      <div className="pointer-events-none absolute top-1/4 -left-[20%] w-[60%] h-[60%] rounded-full bg-[#1e4ebf] opacity-[0.25] blur-[150px] mix-blend-screen" />
      <div className="pointer-events-none absolute bottom-0 -right-[20%] w-[60%] h-[60%] rounded-full bg-[#1e4ebf] opacity-[0.2] blur-[150px] mix-blend-screen" />

      <motion.div
        className="relative z-10 mx-auto max-w-[1440px] flex w-full flex-col"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        {/* Heading */}
        <motion.h2
          variants={itemVariants}
          className="m-0 text-center font-semibold text-white max-md:!text-[clamp(24px,7vw,28px)] max-md:!leading-[120%] max-md:!mb-[clamp(32px,6dvh,48px)]"
          style={{
            fontSize: "min(4.51vw, 6.98vh)",
            lineHeight: "150%",
            marginBottom: "min(5.79vw, 8.95vh)",
          }}
        >
          Our Portfolio Companies
          <br />
          That Became The Indicorns
        </motion.h2>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[clamp(28px,min(3vw,4vh),48px)]">
          {companies.map((company, index) => (
            <motion.div
              key={company.name + index}
              variants={itemVariants}
              className="relative bg-[#FBF7F0] rounded-[2px] flex flex-col shadow-xl"
              style={{ padding: "clamp(28px,min(3vw,4.5vh),48px)", paddingTop: "clamp(40px,min(4vw,6vh),64px)" }}
            >
              {/* Paperclip Image */}
              <div className="absolute -top-[24px] -left-[16px] w-[clamp(56px,6vw,80px)] h-[clamp(56px,6vw,80px)] z-10 pointer-events-none drop-shadow-md">
                <img
                  src="/images/indicorns/clip.png"
                  alt=""
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Logo (No white background box) */}
              <div
                className="w-full flex items-center justify-start"
                style={{ height: "clamp(72px,8vw,100px)", marginBottom: "clamp(16px,min(2vw,2.86vh),28px)" }}
              >
                <img
                  src={company.logoUrl}
                  alt={`${company.name} logo`}
                  className="max-h-full max-w-[clamp(120px,14vw,160px)] object-contain mix-blend-multiply"
                />
              </div>

              {/* Description */}
              <p
                className="m-0 text-[#1a1a1a] max-md:!text-[15px]"
                style={{ fontSize: "min(1.11vw, 1.72vh)", lineHeight: "160%" }}
              >
                {company.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}