import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import Footer from "@/components/sections/Footer";

/* ─────────────────────────────────────────────────────────
   Data shape for the detail page.
   This shape is the contract between the page and whatever
   data source feeds it. Tomorrow we replace `getCompany()`
   below with a Hygraph GraphQL fetch — the JSX never changes
   as long as the CMS query returns this shape.
   ───────────────────────────────────────────────────────── */
type LinkType = "website" | "linkedin" | "instagram" | "youtube" | "twitter";

interface CompanyLink {
  /** Visible label inside the pill (e.g. "anveshan.farm") */
  label: string;
  /** Absolute URL (https://…) */
  url: string;
  /** Drives which icon we render inside the pill */
  type: LinkType;
}

interface CompanyDetail {
  brandName: string;
  slug: string;
  oneLiner: string;
  /** Public path or remote URL; rendered with next/image */
  logo: string;

  /* ── About the Company section ── */
  /** Long-form description paragraph (plain text for now;
   *  switch to RichText if you give Hygraph a RichText field) */
  about: string;
  /** Pills shown under the about copy */
  links: CompanyLink[];

  /* ── Right-hand info box ── */
  areaOfFocus: string;
  investedIn: string;
  milestones: string[];

  /* ── Horizontal image gallery (6–7 brand images) ── */
  gallery: string[];

  /* ── Founding Team ── */
  founders: Founder[];

  /* ── News / Blogs cards ── */
  newsBlogs: NewsBlog[];
}

interface Founder {
  name: string;
  /** Optional LinkedIn profile URL */
  linkedin?: string;
  /** Optional avatar photo. If absent, falls back to a person silhouette. */
  avatar?: string;
}

interface NewsBlog {
  title?: string;
  /** Card thumbnail */
  image?: string;
  /** Where the card links to */
  url?: string;
  /** Optional source label (e.g. "TechCrunch") */
  source?: string;
}

/* ─────────────────────────────────────────────────────────
   TEMPORARY mock data — lets you click a card on /portfolio
   today and land on a real-looking detail page without any
   CMS auth. Add more entries as you populate them.
   Swap this whole block for a Hygraph fetch when ready.
   ───────────────────────────────────────────────────────── */
const MOCK_COMPANIES: Record<string, CompanyDetail> = {
  anveshan: {
    brandName: "anveshan",
    slug: "anveshan",
    oneLiner: "Traceable, traditional and completely natural food products",
    logo: "/images/portfolio_grid/anveshan.png",
    about:
      "Revolutionizing the food industry through technology, Anveshan is a food-tech startup aiming to provide high quality deeply traceable food products. They leverage technologies based on image processing, spectroscopy, blockchain and IOT to provide the best quality food products made traditionally.",
    links: [
      { label: "anveshan.farm", url: "https://anveshan.farm", type: "website" },
      { label: "anveshan.farm", url: "https://www.linkedin.com/company/anveshan", type: "linkedin" },
      { label: "anveshan.farm", url: "https://www.instagram.com/anveshan", type: "instagram" },
    ],
    areaOfFocus: "Consumer Brand",
    investedIn: "2019",
    milestones: ["Partnered 2012", "Founded 2011", "IPO 2018"],
    /* Mock gallery — reusing the existing founder portrait so the
       layout is testable today. Replace with real URLs from Hygraph. */
    gallery: [
      "/images/portfolio_grid_founders/Anveshan.png",
      "/images/portfolio_grid_founders/Anveshan.png",
      "/images/portfolio_grid_founders/Anveshan.png",
      "/images/portfolio_grid_founders/Anveshan.png",
      "/images/portfolio_grid_founders/Anveshan.png",
      "/images/portfolio_grid_founders/Anveshan.png",
    ],
    founders: [
      { name: "Aayushi Khandelwal", linkedin: "https://www.linkedin.com/in/aayushi-khandelwal" },
      { name: "Kuldeep Parewa", linkedin: "https://www.linkedin.com/in/kuldeep-parewa" },
      {
        name: "Akhil Kansal",
        linkedin: "https://www.linkedin.com/in/akhil-kansal",
        avatar: "/images/portfolio_grid_founders/Anveshan.png",
      },
    ],
    /* Placeholder cards — empty boxes until the real news/blog content is published. */
    newsBlogs: [{}, {}, {}],
  },
  // Add more as you populate them, e.g.:
  // razorpay: { ... },
};

async function getCompany(slug: string): Promise<CompanyDetail | null> {
  return MOCK_COMPANIES[slug] ?? null;
}

/* ─────────────────────────────────────────────────────────
   Icon mapping for link pills — keep the SVGs inline so we
   don't add a runtime dependency. If you ever want to swap
   icon sets, only this map changes.
   ───────────────────────────────────────────────────────── */
function LinkIcon({ type }: { type: LinkType }) {
  const sizeStyle: React.CSSProperties = {
    width: "clamp(16px, min(1.67vw, 2.44vh), 24px)",
    height: "clamp(16px, min(1.67vw, 2.44vh), 24px)",
    aspectRatio: "1 / 1",
    flexShrink: 0,
  };

  switch (type) {
    case "website":
      return (
        <svg style={sizeStyle} viewBox="0 0 24 24" fill="none">
          <path d="M4.575 19.425C2.606 17.456 1.5 14.785 1.5 12s1.106-5.456 3.075-7.425C6.544 2.606 9.215 1.5 12 1.5s5.456 1.106 7.425 3.075C21.394 6.544 22.5 9.215 22.5 12s-1.106 5.456-3.075 7.425C17.456 21.394 14.785 22.5 12 22.5s-5.456-1.106-7.425-3.075Z" stroke="black" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M8.818 4.575C7.974 6.544 7.5 9.215 7.5 12s.474 5.456 1.318 7.425C9.662 21.394 10.807 22.5 12 22.5s2.338-1.106 3.182-3.075C16.026 17.456 16.5 14.785 16.5 12s-.474-5.456-1.318-7.425C14.338 2.606 13.193 1.5 12 1.5s-2.338 1.106-3.182 3.075Z" stroke="black" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M2.25 15.5h19.5M2.25 8.5h19.5" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "linkedin":
      return (
        <svg style={sizeStyle} viewBox="0 0 24 24" fill="#0A66C2">
          <path d="M20.447 20.452H16.89V14.881C16.89 13.554 16.865 11.848 15.088 11.848C13.285 11.848 13.009 13.255 13.009 14.786V20.452H9.453V8.997H12.87V10.56H12.918C13.395 9.654 14.563 8.685 16.291 8.685C19.897 8.685 20.447 11.056 20.447 14.169V20.452ZM5.337 7.433C4.196 7.433 3.272 6.505 3.272 5.369C3.272 4.233 4.196 3.305 5.337 3.305C6.476 3.305 7.4 4.233 7.4 5.369C7.4 6.505 6.476 7.433 5.337 7.433ZM7.118 20.452H3.555V8.997H7.118V20.452ZM22.225 0H1.771C0.792 0 0 0.774 0 1.729V22.271C0 23.227 0.792 24 1.771 24H22.222C23.2 24 23.996 23.227 23.996 22.271V1.729C23.996 0.774 23.2 0 22.225 0Z" />
        </svg>
      );
    case "instagram":
      return (
        <svg style={sizeStyle} viewBox="0 0 24 24" fill="none">
          <rect x="2" y="2" width="20" height="20" rx="5" stroke="#E1306C" strokeWidth="1.6" />
          <circle cx="12" cy="12" r="4.2" stroke="#E1306C" strokeWidth="1.6" />
          <circle cx="17.6" cy="6.4" r="1.1" fill="#E1306C" />
        </svg>
      );
    case "youtube":
      return (
        <svg style={sizeStyle} viewBox="0 0 24 24" fill="#FF0000">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    case "twitter":
      return (
        <svg style={sizeStyle} viewBox="0 0 24 24" fill="#000">
          <path d="M18.901 1.153H22.581L14.541 10.339L24 22.846H16.596L10.794 15.263L4.148 22.846H0.466L9.043 13.037L0 1.153H7.593L12.836 8.082L18.901 1.153ZM17.611 20.644H19.65L6.486 3.24H4.309L17.611 20.644Z" />
        </svg>
      );
  }
}

/* ─────────────────────────────────────────────────────────
   One link pill — rounded outlined chip with icon + label.
   ───────────────────────────────────────────────────────── */
function LinkPill({ link }: { link: CompanyLink }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center border border-[#CECECE] bg-white transition-all duration-300 hover:scale-105 hover:border-[#001A4D]/40 hover:shadow-[0_2px_10px_rgba(0,26,77,0.08)]"
      style={{
        width: "clamp(160px, min(15.49vw, 22.71vh), 223px)",
        padding: "clamp(7px, min(0.7vw, 1vh), 10px)",
        gap: "clamp(6px, min(0.7vw, 1vh), 10px)",
        borderRadius: "50px",
      }}
    >
      <LinkIcon type={link.type} />
      <span
        className="truncate font-['Poppins',_sans-serif] font-normal text-black"
        style={{
          fontSize: "clamp(13px, min(1.39vw, 2.04vh), 20px)",
          lineHeight: "150%",
        }}
      >
        {link.label}
      </span>
    </a>
  );
}

/* ─────────────────────────────────────────────────────────
   Right-hand info box — Area of Focus / Invested In /
   Milestones, separated by thin dividers.
   ───────────────────────────────────────────────────────── */
function InfoBox({ company }: { company: CompanyDetail }) {
  const rowGap = "clamp(14px, min(1.6vw, 2.4vh), 22px)";
  const dividerStyle: React.CSSProperties = {
    borderTop: "1px solid #E5E0D7",
    margin: 0,
  };
  const labelStyle: React.CSSProperties = {
    fontSize: "clamp(14px, min(1.67vw, 2.44vh), 24px)",
    lineHeight: "150%",
  };
  const valueStyle: React.CSSProperties = {
    fontSize: "clamp(16px, min(1.94vw, 2.85vh), 28px)",
    lineHeight: "150%",
  };

  return (
    <aside
      className="flex w-full flex-col bg-[#FBF7F0]"
      style={{
        width: "clamp(280px, min(43.06vw, 63.13vh), 620px)",
        minHeight: "clamp(360px, min(37.22vw, 54.58vh), 536px)",
        padding: "clamp(24px, min(2.5vw, 3.7vh), 36px) clamp(20px, min(2.2vw, 3.2vh), 32px)",
        borderRadius: "12px",
        gap: rowGap,
      }}
    >
      {/* Area of Focus */}
      <div className="flex flex-col" style={{ gap: "clamp(4px, 0.5vw, 8px)" }}>
        <p className="m-0 font-['Poppins',_sans-serif] font-normal text-[#323232]" style={labelStyle}>
          Area of Focus
        </p>
        <p className="m-0 font-['Poppins',_sans-serif] font-normal text-black" style={valueStyle}>
          {company.areaOfFocus}
        </p>
      </div>

      <hr style={dividerStyle} />

      {/* Invested In */}
      <div className="flex flex-col" style={{ gap: "clamp(4px, 0.5vw, 8px)" }}>
        <p className="m-0 font-['Poppins',_sans-serif] font-normal text-[#323232]" style={labelStyle}>
          Invested In
        </p>
        <p className="m-0 font-['Poppins',_sans-serif] font-normal text-black" style={valueStyle}>
          {company.investedIn}
        </p>
      </div>

      <hr style={dividerStyle} />

      {/* Milestones — multiple lines */}
      <div className="flex flex-col" style={{ gap: "clamp(4px, 0.5vw, 8px)" }}>
        <p className="m-0 font-['Poppins',_sans-serif] font-normal text-[#323232]" style={labelStyle}>
          Milestones
        </p>
        <ul className="m-0 flex list-none flex-col p-0" style={{ gap: "clamp(2px, 0.4vw, 6px)" }}>
          {company.milestones.map((m) => (
            <li
              key={m}
              className="font-['Poppins',_sans-serif] font-normal text-black"
              style={valueStyle}
            >
              {m}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

/* ─────────────────────────────────────────────────────────
   Image gallery.
     • Mobile (< lg) : vertical stack, each image fills the
                       section's content width (consistent gutters).
     • Desktop (lg+) : full-width horizontal scroller, snap-aligned,
                       cards 361×360 max.
   ───────────────────────────────────────────────────────── */
function Gallery({ images, brandName }: { images: string[]; brandName: string }) {
  if (images.length === 0) return null;

  return (
    <section
      className="relative w-full bg-white"
      style={{
        paddingTop: "clamp(28px, min(3.3vw, 4.8vh), 48px)",
        paddingBottom: "clamp(40px, min(5vw, 7.3vh), 72px)",
      }}
    >
      {/* ── MOBILE — vertical stack inside the standard section gutter ── */}
      <div
        className="mx-auto flex w-full max-w-[1330px] flex-col lg:hidden"
        style={{
          gap: "clamp(12px, 3vw, 20px)",
          paddingLeft: "var(--section-px-wide, 5%)",
          paddingRight: "var(--section-px-wide, 5%)",
        }}
      >
        {images.map((src, i) => (
          <div
            key={`m-${src}-${i}`}
            className="relative w-full overflow-hidden bg-[#D9D9D9]"
            style={{
              aspectRatio: "361 / 360",
              borderRadius: "12px",
            }}
          >
            <Image
              src={src}
              alt={`${brandName} gallery image ${i + 1}`}
              fill
              sizes="(max-width: 640px) 100vw, 90vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {/* ── DESKTOP — horizontal snap scroller ── */}
      <div
        className="hidden w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden lg:block"
        style={{ scrollSnapType: "x mandatory" }}
      >
        <div
          className="flex w-max"
          style={{
            gap: "clamp(12px, min(1.39vw, 2.04vh), 20px)",
            paddingLeft: "var(--section-px-wide, 5%)",
            paddingRight: "var(--section-px-wide, 5%)",
          }}
        >
          {images.map((src, i) => (
            <div
              key={`d-${src}-${i}`}
              className="relative shrink-0 overflow-hidden bg-[#D9D9D9]"
              style={{
                width: "clamp(220px, min(25.07vw, 36.76vh), 361px)",
                height: "clamp(220px, min(25vw, 36.66vh), 360px)",
                borderRadius: "12px",
                scrollSnapAlign: "start",
              }}
            >
              <Image
                src={src}
                alt={`${brandName} gallery image ${i + 1}`}
                fill
                sizes="(max-width: 1024px) 28vw, 361px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   Single founder card — avatar + name + LinkedIn icon.
   Falls back to a person silhouette when no avatar is provided.
   ───────────────────────────────────────────────────────── */
function FounderCard({ founder }: { founder: Founder }) {
  return (
    <div
      className="flex items-center"
      style={{ gap: "clamp(10px, min(1.11vw, 1.63vh), 16px)" }}
    >
      <div
        className="relative shrink-0 overflow-hidden rounded-full bg-[#FBF7F0]"
        style={{
          // Design ref: 95×95 at 1440 viewport.
          width: "clamp(56px, min(6.6vw, 9.66vh), 95px)",
          height: "clamp(56px, min(6.6vw, 9.66vh), 95px)",
          aspectRatio: "1 / 1",
        }}
      >
        {founder.avatar ? (
          <Image
            src={founder.avatar}
            alt={founder.name}
            fill
            sizes="(max-width: 640px) 64px, (max-width: 1024px) 7vw, 95px"
            className="object-cover"
          />
        ) : (
          /* Person silhouette fallback */
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[#9A9A9A]"
            style={{
              width: "55%",
              height: "55%",
            }}
          >
            <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6" />
            <path
              d="M4 21c0-4.418 3.582-8 8-8s8 3.582 8 8"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>

      <div className="flex flex-col" style={{ gap: "clamp(4px, 0.4vw, 8px)" }}>
        <p
          className="m-0 font-['Poppins',_sans-serif] font-medium text-black"
          style={{
            fontSize: "clamp(16px, min(2.22vw, 3.26vh), 32px)",
            lineHeight: "150%",
          }}
        >
          {founder.name}
        </p>
        {founder.linkedin && (
          <a
            href={founder.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${founder.name} on LinkedIn`}
            className="inline-flex w-fit items-center justify-center transition-transform duration-300 hover:scale-110 hover:opacity-80"
          >
            <svg
              viewBox="0 0 24 24"
              fill="#0A66C2"
              style={{
                width: "clamp(18px, min(1.67vw, 2.44vh), 24px)",
                height: "clamp(18px, min(1.67vw, 2.44vh), 24px)",
              }}
            >
              <path d="M20.447 20.452H16.89V14.881C16.89 13.554 16.865 11.848 15.088 11.848C13.285 11.848 13.009 13.255 13.009 14.786V20.452H9.453V8.997H12.87V10.56H12.918C13.395 9.654 14.563 8.685 16.291 8.685C19.897 8.685 20.447 11.056 20.447 14.169V20.452ZM5.337 7.433C4.196 7.433 3.272 6.505 3.272 5.369C3.272 4.233 4.196 3.305 5.337 3.305C6.476 3.305 7.4 4.233 7.4 5.369C7.4 6.505 6.476 7.433 5.337 7.433ZM7.118 20.452H3.555V8.997H7.118V20.452ZM22.225 0H1.771C0.792 0 0 0.774 0 1.729V22.271C0 23.227 0.792 24 1.771 24H22.222C23.2 24 23.996 23.227 23.996 22.271V1.729C23.996 0.774 23.2 0 22.225 0Z" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Founding Team section — heading + horizontal row of founder
   cards, separated by thin vertical dividers. Wraps onto
   multiple rows on narrow viewports.
   ───────────────────────────────────────────────────────── */
function FoundingTeam({ founders }: { founders: Founder[] }) {
  if (founders.length === 0) return null;

  return (
    <section
      className="relative w-full bg-white"
      style={{
        paddingTop: "clamp(40px, min(5vw, 7.3vh), 72px)",
        paddingBottom: "clamp(40px, min(5vw, 7.3vh), 72px)",
        paddingLeft: "var(--section-px-wide, 5%)",
        paddingRight: "var(--section-px-wide, 5%)",
      }}
    >
      <div
        className="mx-auto flex w-full max-w-[1330px] flex-col items-start"
        style={{ gap: "clamp(28px, min(3.88vw, 5.7vh), 56px)" }}
      >
        <h2
          className="m-0 font-['Libre_Baskerville',_serif] font-semibold text-[#001A4D]"
          style={{
            fontSize: "clamp(28px, min(3.33vw, 4.89vh), 48px)",
            lineHeight: "120%",
          }}
        >
          Founding Team
        </h2>

        {/* Founders.
              • Mobile: vertical stack, each card on its own row.
              • Desktop: horizontal row with thin vertical dividers between cards. */}
        <div
          className="flex w-full flex-col items-start lg:flex-row lg:flex-wrap lg:items-stretch"
          style={{ gap: "clamp(18px, min(2.78vw, 4.07vh), 40px)" }}
        >
          {founders.map((f, i) => (
            <div
              key={f.name}
              className={`flex items-stretch ${
                i === 0 ? "" : "lg:border-l lg:border-[#E5E5E5] lg:pl-[clamp(20px,min(2.78vw,4.07vh),40px)]"
              }`}
            >
              <FounderCard founder={f} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   News / Blogs section — heading + row of card placeholders.
   Each card 431×356 max at 1440, scales with the site's clamp
   pattern. Renders thumbnail/title once the data is populated.
   ───────────────────────────────────────────────────────── */
function NewsBlogs({ items, brandName }: { items: NewsBlog[]; brandName: string }) {
  if (items.length === 0) return null;

  const CardInner = ({ item }: { item: NewsBlog }) => (
    <div
      className="relative h-full w-full overflow-hidden bg-[#F2F2F2]"
      style={{ borderRadius: "12px" }}
    >
      {item.image && (
        <Image
          src={item.image}
          alt={item.title ?? `${brandName} news`}
          fill
          sizes="(max-width: 640px) 320px, (max-width: 1024px) 32vw, 431px"
          className="object-cover"
        />
      )}
      {item.title && (
        <div
          className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent"
          style={{ padding: "clamp(12px, 1.4vw, 20px)" }}
        >
          <p
            className="m-0 font-['Poppins',_sans-serif] font-medium text-white"
            style={{
              fontSize: "clamp(13px, min(1.25vw, 1.83vh), 18px)",
              lineHeight: "140%",
            }}
          >
            {item.title}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <section
      className="relative w-full bg-white"
      style={{
        paddingTop: "clamp(40px, min(5vw, 7.3vh), 72px)",
        paddingBottom: "clamp(40px, min(5vw, 7.3vh), 72px)",
        paddingLeft: "var(--section-px-wide, 5%)",
        paddingRight: "var(--section-px-wide, 5%)",
      }}
    >
      <div
        className="mx-auto flex w-full max-w-[1330px] flex-col items-start"
        style={{ gap: "clamp(28px, min(3.88vw, 5.7vh), 56px)" }}
      >
        <h2
          className="m-0 font-['Libre_Baskerville',_serif] font-semibold text-[#001A4D]"
          style={{
            fontSize: "clamp(28px, min(3.33vw, 4.89vh), 48px)",
            lineHeight: "120%",
          }}
        >
          News/Blogs
        </h2>

        <div
          className="flex w-full flex-col flex-wrap lg:flex-row"
          style={{ gap: "clamp(16px, min(1.67vw, 2.44vh), 28px)" }}
        >
          {items.map((item, i) => {
            /* Mobile: full-width card with the 431/356 aspect ratio preserved.
               Desktop: fixed clamp width × height per the Figma spec. */
            const cardClassName = "w-full lg:w-auto";
            const cardStyle: React.CSSProperties = {
              aspectRatio: "431 / 356",
              borderRadius: "12px",
            };
            const desktopSize: React.CSSProperties = {
              // Applied only at lg+ via inline media-query-equivalent: we use
              // the `lg:!w-[clamp(...)]` / `lg:!h-[clamp(...)]` utilities below.
            };
            void desktopSize;
            return item.url ? (
              <a
                key={`${item.url}-${i}`}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`block transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_8px_28px_rgba(0,0,0,0.08)] lg:!aspect-auto lg:!w-[clamp(260px,min(29.93vw,43.88vh),431px)] lg:!h-[clamp(220px,min(24.72vw,36.25vh),356px)] ${cardClassName}`}
                style={cardStyle}
              >
                <CardInner item={item} />
              </a>
            ) : (
              <div
                key={`placeholder-${i}`}
                className={`lg:!aspect-auto lg:!w-[clamp(260px,min(29.93vw,43.88vh),431px)] lg:!h-[clamp(220px,min(24.72vw,36.25vh),356px)] ${cardClassName}`}
                style={cardStyle}
              >
                <CardInner item={item} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ═════════════════════════════════════════════════════════
   Page
   ═════════════════════════════════════════════════════════ */
export default async function PortfolioCompanyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const company = await getCompany(slug);
  if (!company) notFound();

  return (
    <main className="flex min-h-screen w-full flex-col">
      {/* ════════════════════════════════════════════════
          HEADER — cream background, three rows:
            1. Back button (left)  ⟂  Portfolio/<slug> (right)
            2. Centered brand logo
          The Navbar (rendered by the root layout) overlays the
          top of the viewport, so the section needs enough top
          padding to clear it on every breakpoint.
          ════════════════════════════════════════════════ */}
      <section
        className="relative flex w-full flex-col bg-[#FBF7F0]"
        style={{
          // ~115px Navbar on desktop, smaller on mobile — keep the back button
          // and breadcrumb clearly below it on every viewport.
          paddingTop: "clamp(96px, min(8.33vw, 12.22vh), 140px)",
          paddingBottom: "clamp(28px, min(3.5vw, 5.1vh), 56px)",
          paddingLeft: "var(--section-px-wide, 5%)",
          paddingRight: "var(--section-px-wide, 5%)",
        }}
      >
        <div className="mx-auto flex w-full max-w-[1440px] flex-col">
          {/* ── Row 1: Back + Breadcrumb ── */}
          <div className="flex w-full flex-row items-center justify-between">
            {/* Back button */}
            <Link
              href="/portfolio"
              aria-label="Back to portfolio"
              className="group inline-flex items-center transition-transform duration-300 hover:scale-105 hover:opacity-80"
              style={{ gap: "clamp(8px, min(0.8vw, 1.2vh), 14px)" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 57 57"
                fill="none"
                style={{
                  width: "clamp(38px, min(3.96vw, 5.8vh), 57px)",
                  height: "clamp(38px, min(3.96vw, 5.8vh), 57px)",
                  aspectRatio: "1 / 1",
                }}
              >
                <path
                  d="M5.34375 28.5C5.34375 41.2883 15.7117 51.6562 28.5 51.6562C41.2883 51.6562 51.6562 41.2883 51.6562 28.5C51.6562 15.7117 41.2883 5.34375 28.5 5.34375C15.7117 5.34375 5.34375 15.7117 5.34375 28.5ZM29.0177 18.3291C29.1838 18.4938 29.3158 18.6897 29.4062 18.9055C29.4966 19.1212 29.5436 19.3527 29.5445 19.5867C29.5455 19.8206 29.5003 20.0525 29.4116 20.269C29.3229 20.4854 29.1925 20.6824 29.0277 20.8484L23.203 26.7188H38.0742C38.5466 26.7188 38.9997 26.9064 39.3338 27.2405C39.6678 27.5745 39.8555 28.0276 39.8555 28.5C39.8555 28.9724 39.6678 29.4255 39.3338 29.7595C38.9997 30.0936 38.5466 30.2812 38.0742 30.2812H23.203L29.0277 36.1516C29.1925 36.3178 29.3229 36.5149 29.4115 36.7315C29.5001 36.9481 29.5452 37.1801 29.5441 37.4141C29.5431 37.6482 29.496 37.8797 29.4055 38.0956C29.3149 38.3114 29.1828 38.5073 29.0166 38.6721C28.8503 38.8368 28.6533 38.9672 28.4367 39.0558C28.22 39.1445 27.9881 39.1895 27.754 39.1885C27.52 39.1875 27.2884 39.1403 27.0726 39.0498C26.8568 38.9593 26.6609 38.8271 26.4961 38.6609L17.6578 29.7547C17.3267 29.421 17.1409 28.97 17.1409 28.5C17.1409 28.03 17.3267 27.579 17.6578 27.2453L26.4961 18.3391C26.6609 18.1726 26.8569 18.0403 27.0729 17.9497C27.2889 17.8591 27.5206 17.812 27.7548 17.8111C27.989 17.8102 28.2211 17.8554 28.4378 17.9443C28.6545 18.0332 28.8516 18.1639 29.0177 18.3291Z"
                  fill="black"
                />
              </svg>
              <span
                className="font-['Poppins',_sans-serif] font-light text-black"
                style={{
                  fontSize: "clamp(14px, min(1.67vw, 2.44vh), 24px)",
                  lineHeight: "150%",
                }}
              >
                Back
              </span>
            </Link>

            {/* Breadcrumb — Portfolio (light) / slug (medium) */}
            <p
              className="m-0 font-['Poppins',_sans-serif] text-black"
              style={{
                fontSize: "clamp(14px, min(1.67vw, 2.44vh), 24px)",
                lineHeight: "150%",
              }}
            >
              <Link
                href="/portfolio"
                className="font-light transition-opacity duration-200 hover:opacity-70"
              >
                Portfolio
              </Link>
              <span className="font-light">/</span>
              <span className="font-medium">{company.slug}</span>
            </p>
          </div>

          {/* ── Row 2: Brand logo, centered.
                 Design ref: 459×93 at 1440 viewport (aspect ratio 153/31).
                 width scales with the rest of the site's clamp pattern;
                 aspect-ratio derives height so the logo never distorts on
                 any of the multiview viewports (1097×617 → 2560×1600+).
                 sizes prop matches the responsive width so next/image
                 picks the right CDN render once Hygraph is wired in. ── */}
          <div
            className="mx-auto"
            style={{
              width: "clamp(240px, min(31.88vw, 46.74vh), 459px)",
              aspectRatio: "153 / 31",
              marginTop: "clamp(24px, min(3vw, 4.4vh), 48px)",
            }}
          >
            <Image
              src={company.logo}
              alt={`${company.brandName} logo`}
              width={918}
              height={186}
              sizes="(max-width: 640px) 240px, (max-width: 1024px) 32vw, 459px"
              priority
              className="h-full w-full object-contain"
            />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          ONE-LINER BANNER — full-width navy stripe
          ════════════════════════════════════════════════ */}
      <section
        className="flex w-full items-center justify-center bg-[#001A4D]"
        style={{
          padding: "clamp(8px, min(0.7vw, 1vh), 10px) clamp(16px, 2vw, 32px) clamp(6px, min(0.4vw, 0.6vh), 6px) clamp(16px, 2vw, 32px)",
        }}
      >
        <p
          className="m-0 text-center font-['Libre_Baskerville',_serif] font-medium text-white"
          style={{
            maxWidth: "clamp(280px, min(63.43vw, 92.99vh), 913px)",
            fontSize: "clamp(14px, min(1.94vw, 2.85vh), 28px)",
            lineHeight: "150%",
          }}
        >
          {company.oneLiner}
        </p>
      </section>

      {/* ════════════════════════════════════════════════
          ABOUT — two-column layout:
            LEFT  : heading + description + link pills
            RIGHT : info box (Area of Focus / Invested / Milestones)
          On screens smaller than `lg` the two columns stack so the
          long copy stays readable.
          ════════════════════════════════════════════════ */}
      <section
        className="relative flex w-full flex-col bg-white"
        style={{
          paddingTop: "clamp(36px, min(4.4vw, 6.5vh), 64px)",
          paddingBottom: "clamp(40px, min(5vw, 7.3vh), 72px)",
          paddingLeft: "var(--section-px-wide, 5%)",
          paddingRight: "var(--section-px-wide, 5%)",
        }}
      >
        <div
          className="mx-auto flex w-full max-w-[1330px] flex-col items-center text-center lg:flex-row lg:items-start lg:justify-between lg:text-left"
          style={{ gap: "clamp(28px, min(3vw, 4.4vh), 48px)" }}
        >
          {/* ── LEFT: heading + description + link pills ── */}
          <div
            className="flex w-full flex-col items-center text-center lg:items-start lg:text-left"
            style={{ flex: "1 1 0", minWidth: 0 }}
          >
            <h2
              className="m-0 whitespace-nowrap font-['Libre_Baskerville',_serif] font-semibold text-[#001A4D]"
              style={{
                fontSize: "clamp(28px, min(3.33vw, 4.89vh), 48px)",
                lineHeight: "120%",
              }}
            >
              About The Company
            </h2>

            <p
              className="m-0 w-full font-['Poppins',_sans-serif] font-normal text-[#323232] lg:[max-width:clamp(280px,_min(51.04vw,_74.85vh),_735px)]"
              style={{
                marginTop: "clamp(32px, min(4.4vw, 6.5vh), 64px)",
                fontSize: "clamp(14px, min(1.67vw, 2.44vh), 24px)",
                lineHeight: "150%",
              }}
            >
              {company.about}
            </p>

            {company.links.length > 0 && (
              <div
                className="flex w-full flex-wrap justify-center lg:justify-start"
                style={{
                  marginTop: "clamp(24px, min(2.8vw, 4.1vh), 40px)",
                  gap: "clamp(10px, min(1.1vw, 1.6vh), 16px)",
                }}
              >
                {company.links.map((link, i) => (
                  <LinkPill key={`${link.type}-${i}`} link={link} />
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: info box. Full-width on mobile, fixed clamp on desktop. ── */}
          <div className="flex w-full shrink-0 justify-center lg:w-auto lg:justify-end">
            <InfoBox company={company} />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          GALLERY — horizontal scrolling brand images
          ════════════════════════════════════════════════ */}
      <Gallery images={company.gallery} brandName={company.brandName} />

      {/* ════════════════════════════════════════════════
          FOUNDING TEAM
          ════════════════════════════════════════════════ */}
      <FoundingTeam founders={company.founders} />

      {/* ════════════════════════════════════════════════
          NEWS / BLOGS
          ════════════════════════════════════════════════ */}
      <NewsBlogs items={company.newsBlogs} brandName={company.brandName} />

      <Footer />
    </main>
  );
}
