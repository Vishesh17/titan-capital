import Image from "next/image";
import Link from "next/link";

import Footer from "@/components/sections/Footer";
import FoundersStoryCTA from "@/components/sections/FoundersStoryCTA";
import { buildMetadata } from "@/sanity/lib/seo";

/* ─────────────────────────────────────────────────────────
   Content model — one entry per founder story. Only "mamaearth"
   is populated for now (content provided). Add more slugs here and
   they render with the same template. Unknown slugs fall back to
   the mamaearth entry so links never dead-end.
   ───────────────────────────────────────────────────────── */
type Block =
  | { type: "quote"; text: string; attribution?: string }
  | { type: "heading"; text: string }
  | { type: "body"; text: string; bold?: string }
  | { type: "image"; src: string; alt: string }
  | { type: "stats"; stats: { num: string; label: string }[] };

interface Story {
  name: string;
  heroImage: string;
  heroAlt: string;
  blocks: Block[];
  ctaText: string;
}

// NOTE: heroImage is a placeholder (couple cut-out). Replace
// public/images/FoundersStory/mamaearth-founders.webp with the real
// marble-wall founders photo — the page will pick it up automatically.
const MAMAEARTH_IMAGE = "/images/FoundersStory/mamaearth-founders.webp";

const MAMAEARTH_BODY =
  "In Late 2015, Ghazal And Varun Alagh's First Son, Agastya, Developed Severe Skin Allergies. They Did What Every New Parent Does — Went Looking For Safe, Toxin-Free Baby Products. What They Found Was A Market That Didn't Have Them. Every Product They Tried Was Loaded With Chemicals That Weren't Safe For A Baby's Sensitive Skin. Varun Was A Senior Marketer At Coca-Cola, Where He'd Built The Brand Across India, Nepal, Bangladesh, And Sri Lanka. Ghazal Had Spent Years In Technology And Art. Neither Had Built A Consumer Brand. Both Decided That Didn't Matter.\nIn November 2016, They Walked Away From Their Careers And Launched Mamaearth From Their Home In Gurugram — ";

const MAMAEARTH_BODY_BOLD =
  "With ₹25 Lakhs, Seven Products, And The Conviction That Indian Parents Deserved Better.";

const STATS = [
  { num: "300+", label: "Companies Backed" },
  { num: "7", label: "Unicorns" },
  { num: "4", label: "IPOs" },
  { num: "$4B+", label: "Capital raised by portfolio" },
];

const STORIES: Record<string, Story> = {
  mamaearth: {
    name: "Mamaearth",
    heroImage: MAMAEARTH_IMAGE,
    heroAlt: "Ghazal and Varun Alagh, founders of Mamaearth",
    ctaText:
      "Every company above started with a single conversation. An idea, a problem, and a founder who was obsessed enough to not let it go. If you're building something real, we want to hear about it",
    blocks: [
      {
        type: "quote",
        text: "Every Product They Tried Was Loaded With Chemicals That Weren't Safe For A Baby's Sensitive Skin.",
        attribution: "Ghazal And Varun Alagh's",
      },
      { type: "heading", text: "Backing Consumer Brands In India." },
      { type: "body", text: MAMAEARTH_BODY, bold: MAMAEARTH_BODY_BOLD },
      { type: "image", src: MAMAEARTH_IMAGE, alt: "Mamaearth founders" },
      { type: "stats", stats: STATS },
      { type: "heading", text: "Backing Consumer Brands In India." },
      { type: "body", text: MAMAEARTH_BODY, bold: MAMAEARTH_BODY_BOLD },
      {
        type: "quote",
        text: "Every Product They Tried Was Loaded With Chemicals That Weren't Safe For A Baby's Sensitive Skin.",
      },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(STORIES).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const base = await buildMetadata("foundersstory");
  const story = STORIES[slug] ?? STORIES.mamaearth;
  return { ...base, title: `The Story Of ${story.name}` };
}

/* ── Small dark quote mark for the cream quote blocks ── */
function QuoteMark() {
  return (
    <svg
      viewBox="0 0 42 33"
      fill="none"
      aria-hidden
      style={{ width: "clamp(24px, 2.4vw, 34px)", height: "auto" }}
    >
      <path
        d="M24.5946 22.5385C24.5946 15.948 26.7387 9.90141 31.027 4.3987C33.7387 1.07148 35.9144 -0.368185 37.5541 0.0797102C39.0676 0.655575 39.8243 1.51937 39.8243 2.6711C39.8243 3.75885 39.3198 4.91058 38.3108 6.12629C37.3649 7.34201 36.6081 8.33378 36.0405 9.1016C35.473 9.86942 35 10.7012 34.6216 11.597C33.7387 13.3886 33.2973 15.5641 33.2973 18.1235C34.8108 17.6756 36.3243 17.8675 37.8378 18.6994C40.6126 20.299 42 22.3465 42 24.8419C42 27.2733 41.2432 29.2569 39.7297 30.7925C38.2793 32.2642 36.2613 33 33.6757 33C31.0901 33 28.9144 32.0082 27.1486 30.0247C25.4459 27.9772 24.5946 25.4818 24.5946 22.5385ZM0 22.5385C0 15.6921 2.11261 9.64547 6.33784 4.3987C9.55405 0.495613 12.2342 -0.68811 14.3784 0.84753C14.8198 1.16746 15.0405 1.67934 15.0405 2.38317C15.0405 3.66287 14.5676 4.91058 13.6216 6.12629C12.7387 7.34201 12.0135 8.33378 11.4459 9.1016C10.8784 9.86942 10.4054 10.7012 10.027 11.597C9.14414 13.3886 8.7027 15.5641 8.7027 18.1235C10.2162 17.6756 11.6982 17.8675 13.1486 18.6994C15.8604 20.299 17.2162 22.3465 17.2162 24.8419C17.2162 27.2733 16.491 29.2569 15.0405 30.7925C13.5901 32.2642 11.5721 33 8.98649 33C6.4009 33 4.25676 32.0082 2.55405 30.0247C0.851351 27.9772 0 25.4818 0 22.5385Z"
        fill="#001A4D"
      />
    </svg>
  );
}

const CREAM_BLOCK: React.CSSProperties = {
  background: "#FBF7F0",
  borderLeft: "3px solid #0E0E0E",
  borderRadius: "2px",
  padding: "clamp(20px, min(2.36vw, 3.45vh), 40px)",
};

function renderBlock(block: Block, i: number) {
  switch (block.type) {
    case "quote":
      return (
        <div key={i} style={CREAM_BLOCK} className="flex flex-col">
          <QuoteMark />
          <p
            className="m-0 font-['Poppins',_sans-serif] font-semibold text-black max-md:!text-[18px]"
            style={{
              fontSize: "clamp(18px, min(1.9vw, 2.8vh), 28px)",
              lineHeight: "150%",
              marginTop: "clamp(10px, 1.2vw, 18px)",
            }}
          >
            {block.text}
          </p>
          {block.attribution && (
            <p
              className="m-0 font-['Poppins',_sans-serif] font-normal text-[#6b6b6b] max-md:!text-[13px]"
              style={{
                fontSize: "clamp(13px, min(1.1vw, 1.6vh), 16px)",
                lineHeight: "150%",
                marginTop: "clamp(10px, 1.2vw, 18px)",
              }}
            >
              {block.attribution}
            </p>
          )}
        </div>
      );

    case "heading":
      return (
        <h2
          key={i}
          className="m-0 font-['Poppins',_sans-serif] font-semibold text-black max-md:!text-[20px]"
          style={{ fontSize: "clamp(20px, min(2vw, 2.9vh), 30px)", lineHeight: "150%" }}
        >
          {block.text}
        </h2>
      );

    case "body":
      return (
        <p
          key={i}
          className="m-0 whitespace-pre-line font-['Poppins',_sans-serif] font-normal text-[#1a1a1a] max-md:!text-[15px]"
          style={{ fontSize: "clamp(15px, min(1.35vw, 2vh), 20px)", lineHeight: "175%" }}
        >
          {block.text}
          {block.bold && <strong className="font-semibold text-black">{block.bold}</strong>}
        </p>
      );

    case "image":
      return (
        <div
          key={i}
          className="relative w-full overflow-hidden bg-[#f0f0f0]"
          style={{ aspectRatio: "2 / 1", borderRadius: "2px" }}
        >
          <Image
            src={block.src}
            alt={block.alt}
            fill
            sizes="(max-width: 768px) 100vw, 1040px"
            className="object-cover object-center"
          />
        </div>
      );

    case "stats":
      return (
        <div
          key={i}
          style={CREAM_BLOCK}
          className="grid grid-cols-4 gap-[clamp(12px,2vw,32px)] max-md:!grid-cols-2 max-md:!gap-y-[28px]"
        >
          {block.stats.map((s, j) => (
            <div key={j} className="flex flex-col items-start text-left">
              <span
                className="font-['Poppins',_sans-serif] font-medium text-black max-md:!text-[28px]"
                style={{ fontSize: "clamp(28px, min(3vw, 4.4vh), 44px)", lineHeight: "120%" }}
              >
                {s.num}
              </span>
              <span
                className="font-['Poppins',_sans-serif] font-normal text-[#4a4a4a] max-md:!text-[12px]"
                style={{ fontSize: "clamp(12px, min(1vw, 1.5vh), 15px)", lineHeight: "150%", marginTop: "6px" }}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
      );
  }
}

export default async function FoundersStoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = STORIES[slug] ?? STORIES.mamaearth;

  return (
    <main className="flex min-h-screen w-full flex-col bg-white">
      <section
        className="relative flex w-full flex-col"
        style={{
          paddingTop: "clamp(78px, min(8.33vw, 12.22vh), 140px)",
          paddingBottom: "clamp(40px, min(5vw, 7vh), 96px)",
          paddingLeft: "var(--section-px-wide, 5%)",
          paddingRight: "var(--section-px-wide, 5%)",
        }}
      >
        <div className="mx-auto flex w-full max-w-[1040px] flex-col">
          {/* ── Top bar: Back  ⟂  Founder Stories / Name ── */}
          <div className="flex w-full flex-row items-center justify-between">
            <Link
              href="/foundersstory"
              aria-label="Back to founder stories"
              className="group inline-flex items-center transition-transform duration-300 hover:scale-105 hover:opacity-80"
            >
              <span
                className="font-['Poppins',_sans-serif] font-light text-black"
                style={{ fontSize: "clamp(14px, min(1.25vw, 1.83vh), 18px)", lineHeight: "150%" }}
              >
                Back
              </span>
            </Link>

            <p
              className="m-0 font-['Poppins',_sans-serif] text-black"
              style={{ fontSize: "clamp(14px, min(1.25vw, 1.83vh), 18px)", lineHeight: "150%" }}
            >
              <Link
                href="/foundersstory"
                className="font-light transition-opacity duration-200 hover:opacity-70"
              >
                Founder Stories
              </Link>
              <span className="font-light"> / </span>
              <span className="font-medium">{story.name}</span>
            </p>
          </div>

          {/* ── Hero image ── */}
          <div
            className="relative w-full overflow-hidden bg-[#f0f0f0]"
            style={{
              marginTop: "clamp(24px, min(2.6vw, 3.8vh), 48px)",
              aspectRatio: "2 / 1",
              borderRadius: "2px",
            }}
          >
            <Image
              src={story.heroImage}
              alt={story.heroAlt}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 1040px"
              className="object-cover object-center"
            />
          </div>

          {/* ── Title ── */}
          <h1
            className="m-0 font-['Poppins',_sans-serif] font-semibold text-[#0E0E0E] max-md:!text-[28px]"
            style={{
              fontSize: "clamp(28px, min(3.33vw, 4.88vh), 48px)",
              lineHeight: "140%",
              marginTop: "clamp(20px, min(2.2vw, 3.2vh), 40px)",
            }}
          >
            The Story Of {story.name}
          </h1>

          {/* ── Content blocks ── */}
          <div
            className="flex w-full flex-col"
            style={{ gap: "clamp(24px, min(2.6vw, 3.8vh), 44px)", marginTop: "clamp(24px, min(2.6vw, 3.8vh), 44px)" }}
          >
            {story.blocks.map((block, i) => renderBlock(block, i))}
          </div>
        </div>
      </section>

      {/* ── Closing CTA (JoinPortfolio background) ── */}
      <FoundersStoryCTA text={story.ctaText} />

      <Footer />
    </main>
  );
}
