"use client";

import Image from "next/image";

const founders = [
  {
    name: "Bhavish Aggarwal",
    role: "Founder and CEO of OLA",
    image: "/images/team/founders/Kunal-Bahl-Titan-Capital-Team-Page.webp",
    size: "large" as const,
  },
  {
    name: "Ritesh Agarwal",
    role: "Founder and CEO of OYO Rooms",
    image: "/images/team/winners-fund/Shiv-kapoor-1.webp",
    size: "small" as const,
  },
  {
    name: "Bhavish Aggarwal",
    role: "Co-founder of Ola Electric",
    image: "/images/team/founders/Rohit-Bansal358-x-276-px-2.webp",
    size: "small" as const,
  },
  {
    name: "Bhavish Aggarwal",
    role: "Co-founder of OLA Electric",
    image: "/images/team/winners-fund/Untitlred-design.webp",
    size: "small" as const,
  },
  {
    name: "Bhavish Aggarwal",
    role: "Founder and CEO of OLA",
    image: "/images/team/seed/Chiragh-Cariappa.webp",
    size: "large" as const,
  },
];

export default function FoundersCarousel() {
  return (
    <section className="founders">
      <div className="founders__grid">
        {founders.map((founder, i) => (
          <div
            key={i}
            className={`founders__card founders__card--${founder.size}`}
          >
            <div className={`founders__card-img founders__card-img--${founder.size}`}>
              <Image
                src={founder.image}
                alt={`Titan Capital - ${founder.name}`}
                fill
                style={{ objectFit: "cover" }}
                sizes={founder.size === "large" ? "251px" : "211px"}
              />
            </div>
            <div className="founders__card-info">
              <p className={`founders__card-name founders__card-name--${founder.size}`}>
                {founder.name}
              </p>
              <p className={`founders__card-role founders__card-role--${founder.size}`}>
                {founder.role}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
