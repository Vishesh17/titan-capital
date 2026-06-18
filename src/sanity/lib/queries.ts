import { groq } from "next-sanity";

/**
 * Home — Founders Testimonial section. Singleton: returns the first (only)
 * foundersTestimonial document. Asset URLs resolved here.
 */
export const foundersTestimonialQuery = groq`
  *[_type == "foundersTestimonial"][0]{
    topHeadingFirst,
    topHeadingSecond,
    bottomHeadingFirst,
    bottomHeadingSecond,
    ctaLabel,
    testimonials[]{
      name,
      role,
      text,
      longText,
      "image": image.asset->url
    }
  }
`;

/**
 * Home — Indicorn Spotlight section. Singleton: returns the first (only)
 * indicornSpotlight document. Logo asset URLs resolved here so the frontend
 * receives plain strings.
 */
export const indicornSpotlightQuery = groq`
  *[_type == "indicornSpotlight"][0]{
    heading,
    bullets,
    ctaLabel,
    rotatingLogosLabel,
    rotatingLogos[]{
      alt,
      mode,
      scale,
      "image": image.asset->url
    },
    quote,
    attribution
  }
`;

/**
 * Home — Impact & Stories section. Singleton: returns the first (only)
 * impactAtGlance document. Image and logo URLs are resolved in the query
 * so the frontend just receives plain strings.
 */
export const impactAtGlanceQuery = groq`
  *[_type == "impactAtGlance"][0]{
    impactHeadingFirst,
    impactHeadingSecond,
    storiesHeadingFirst,
    storiesHeadingSecond,
    ctaLabel,
    impactStats[]{
      num,
      label,
      caption
    },
    founderStories[]{
      name,
      role,
      text,
      "image": image.asset->url,
      "logo": logo.asset->url
    }
  }
`;

/**
 * Home — Hero section. Singleton: returns the first (only) Hero document.
 * Asset URLs are resolved here so the frontend doesn't need to know about
 * Sanity's asset references — it just receives plain strings.
 */
export const heroQuery = groq`
  *[_type == "hero"][0]{
    titleLine1,
    titleLine2Before,
    titleLine2Emphasis,
    subtitle,
    primaryCtaLabel,
    secondaryCtaLabel,
    founderSlots[]{
      size,
      pool[]{
        name,
        role,
        "image": image.asset->url
      }
    }
  }
`;

/**
 * One Company document by slug. The projection shape (the {...} part) is
 * deliberately chosen to match the `CompanyDetail` interface in
 * src/app/portfolio/[slug]/page.tsx so the page doesn't need to remap fields.
 */
export const companyBySlugQuery = groq`
  *[_type == "company" && slug.current == $slug][0]{
    brandName,
    "slug": slug.current,
    oneLiner,
    "logo": logo.asset->url,
    about,
    links[]{ label, url, type },
    areaOfFocus,
    investedIn,
    milestones,
    "gallery": gallery[].asset->url,
    founders[]{
      name,
      linkedin,
      "avatar": avatar.asset->url
    },
    newsBlogs[]{
      title,
      url,
      source,
      "image": image.asset->url
    }
  }
`;

/**
 * All known company slugs — used by generateStaticParams() so Next.js can
 * pre-render every portfolio detail page at build time.
 */
export const allCompanySlugsQuery = groq`
  *[_type == "company" && defined(slug.current)][].slug.current
`;

/**
 * Lightweight projection for the portfolio grid (only the fields the card needs).
 * Replaces the current Google Sheet fetch once you migrate the grid.
 */
export const allCompaniesForGridQuery = groq`
  *[_type == "company" && defined(slug.current)] | order(brandName asc){
    brandName,
    "slug": slug.current,
    "logo": logo.asset->url,
    oneLiner,
    areaOfFocus
  }
`;
