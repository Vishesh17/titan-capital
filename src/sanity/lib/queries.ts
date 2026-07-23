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
      "image": image.asset->url,
      "companyLogo": companyLogo.asset->url
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
    subheading,
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
 * Our Story page — Hero section. Singleton.
 * Founders image URL resolved here so the frontend receives a plain string.
 */
export const ourStoryHeroQuery = groq`
  *[_type == "ourStoryHero"][0]{
    headingFirst,
    headingHighlight,
    quote,
    "image": image.asset->url
  }
`;

/**
 * Our Story page — Origin Story section. Singleton.
 * Per-bullet image URLs resolved here so the frontend just receives strings.
 */
export const originStoryQuery = groq`
  *[_type == "originStory"][0]{
    headingFirst,
    headingHighlight,
    bullets[]{
      title,
      desc,
      "images": images[].asset->url
    }
  }
`;

/**
 * Our Team page — all three team arrays in one fetch. Image URLs
 * resolved here so the frontend receives plain strings.
 */
export const ourTeamQuery = groq`
  *[_type == "ourTeam"][0]{
    headingFirst,
    headingSecond,
    "corporateTeam": corporateTeam[]{
      name,
      "slug": slug.current,
      title,
      bio,
      linkedinUrl,
      emailUrl,
      twitterUrl,
      "image": image.asset->url
    },
    "seedTeam": seedTeam[]{
      name,
      "slug": slug.current,
      title,
      bio,
      linkedinUrl,
      emailUrl,
      twitterUrl,
      "image": image.asset->url
    },
    "winnerFundTeam": winnerFundTeam[]{
      name,
      "slug": slug.current,
      title,
      bio,
      linkedinUrl,
      emailUrl,
      twitterUrl,
      "image": image.asset->url
    }
  }
`;

/**
 * Single team member by slug — used by /ourteam/[slug] detail page.
 * Searches the three team arrays in the ourTeam singleton and returns
 * the first match. The projection mirrors the per-card member shape
 * plus the bio for the detail page.
 */
export const teamMemberBySlugQuery = groq`
  *[_type == "ourTeam"][0]{
    "member": (corporateTeam[] + seedTeam[] + winnerFundTeam[])[slug.current == $slug][0]{
      name,
      "slug": slug.current,
      title,
      bio,
      linkedinUrl,
      emailUrl,
      twitterUrl,
      "image": image.asset->url
    }
  }.member
`;

/**
 * All team-member slugs — used by generateStaticParams() on the
 * detail page so Next.js pre-renders each member route at build time.
 */
export const allTeamMemberSlugsQuery = groq`
  *[_type == "ourTeam"][0]{
    "slugs": array::unique(
      (corporateTeam[].slug.current + seedTeam[].slug.current + winnerFundTeam[].slug.current)[defined(@)]
    )
  }.slugs
`;

/**
 * Our Story page — Fifteen Years of Showing Up section. Singleton.
 * Years are sorted ascending so the timeline always reads 2011 → 2026.
 */
export const fifteenYearsQuery = groq`
  *[_type == "fifteenYears"][0]{
    headingFirst,
    headingHighlight,
    "years": years[] | order(year asc) {
      year,
      subtitle,
      description
    }
  }
`;

/**
 * SEO — Sitewide defaults (singleton). Image URL resolved here.
 */
export const siteSeoQuery = groq`
  *[_type == "siteSeo"][0]{
    siteName,
    siteUrl,
    defaultTitle,
    defaultDescription,
    "defaultShareImage": defaultShareImage.asset->url,
    keywords
  }
`;

/**
 * SEO — Per-page override. Looked up by stable `pageKey` so renaming the
 * Studio doc title can't break anything.
 */
export const pageSeoByKeyQuery = groq`
  *[_type == "pageSeo" && pageKey == $pageKey][0]{
    pageKey,
    metaTitle,
    metaDescription,
    "shareImage": shareImage.asset->url
  }
`;

/**
 * Global — Navbar. Singleton.
 * Each sub-item carries its own URL so editors can rename labels without
 * breaking link lookups.
 */
export const navbarQuery = groq`
  *[_type == "navbar"][0]{
    sections[]{
      id,
      title,
      directUrl,
      subItems[]{
        label,
        url
      }
    },
    ctaLabel,
    ctaUrl
  }
`;

/**
 * Global — Footer. Singleton.
 */
export const footerQuery = groq`
  *[_type == "footer"][0]{
    address,
    email,
    copyright,
    privacyPolicyLabel,
    grievanceLabel,
    newsletterTitle,
    newsletterPlaceholder,
    newsletterButtonLabel
  }
`;

/**
 * Winners Fund page — Hero section.
 */
export const winnersHeroQuery = groq`
  *[_type == "winnersHero"][0]{
    headingFirst,
    headingSecond,
    subtitle
  }
`;

/**
 * Winners Fund page — About The Fund section.
 */
export const aboutTheFundQuery = groq`
  *[_type == "aboutTheFund"][0]{
    headingFirst,
    headingSecond,
    paragraphs,
    pills[]{
      id,
      label,
      type,
      rotate,
      x,
      y
    }
  }
`;

/**
 * Winners Fund page — Portfolio Companies section. Logo asset URLs are
 * resolved in the query so the frontend just receives plain strings.
 */
export const portfolioWinnerFundQuery = groq`
  *[_type == "portfolioWinnerFund"][0]{
    headingFirst,
    headingSecond,
    companies[]{
      name,
      category,
      logoW,
      logoH,
      "logo": logo.asset->url
    }
  }
`;

/**
 * Winners Fund page — Fund Details section.
 */
export const fundDetailsQuery = groq`
  *[_type == "fundDetails"][0]{
    headingFirst,
    headingSecond,
    funds[]{
      title,
      aifName,
      sebiNumber,
      category,
      fundManager,
      officeAddress,
      bottomLabels[]{
        heading,
        value
      }
    }
  }
`;

/**
 * Titan Seed page — Hero section.
 */
export const titanSeedHeroQuery = groq`
  *[_type == "titanSeedHero"][0]{
    headingFirst,
    headingSecond,
    subtitle
  }
`;

/**
 * Titan Seed page — Why Titan Seed section.
 */
export const whyTitanSeedQuery = groq`
  *[_type == "whyTitanSeed"][0]{
    headingFirst,
    headingSecond,
    cards[]{
      title,
      desc
    }
  }
`;

/**
 * Titan Seed page — What We Look For section.
 */
export const whatWeLookForQuery = groq`
  *[_type == "whatWeLookFor"][0]{
    headingFirst,
    headingSecond,
    items[]{
      title,
      desc
    }
  }
`;

/**
 * Home — What We Believe section. Singleton: returns the first (only)
 * whatWeBelieve document. Pure text content — no asset resolution needed.
 */
export const whatWeBelieveQuery = groq`
  *[_type == "whatWeBelieve"][0]{
    heading,
    beliefs[]{
      title,
      description
    }
  }
`;

/**
 * Home — How We Show Up (What Founders Get) section.
 */
export const whatFoundersGetQuery = groq`
  *[_type == "whatFoundersGet"][0]{
    heading,
    rows[]{
      title,
      shortHeading,
      shortDesc,
      longHeading,
      longDesc,
      valueTitle,
      valueBullets
    }
  }
`;

/**
 * Home — Backed Before section. Singleton: returns the first (only)
 * backedBefore document. Image asset URLs resolved here so the frontend
 * receives plain strings.
 */
export const backedBeforeQuery = groq`
  *[_type == "backedBefore"][0]{
    heading1,
    heading2,
    marquet1[]{
      name,
      scaleClass,
      "image": image.asset->url
    },
    marquet2[]{
      name,
      scaleClass,
      "image": image.asset->url
    }
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
      logoScale,
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
    founders[]{
      name,
      role,
      "image": image.asset->url,
      isLogo
    }
  }
`;

/**
 * Get Investment page — Hero section.
 */
export const getInvestmentHeroQuery = groq`
  *[_type == "getInvestmentHero"][0]{
    headingFirst,
    headingSecond,
    subtitle
  }
`;

/**
 * Get Investment page — Form section.
 */
export const getInvestmentFormQuery = groq`
  *[_type == "getInvestmentForm"][0]{
    section1Label,
    section1Title,
    section1Subtitle,
    section2Label,
    section2Title,
    section2Subtitle,
    submitButtonLabel,
    successTitle,
    successMessage
  }
`;

/**
 * Get Investment page — FAQ section.
 */
export const getInvestmentFAQQuery = groq`
  *[_type == "getInvestmentFAQ"][0]{
    headingFirst,
    headingSecond,
    items[]{
      id,
      question,
      answer
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
 * Portfolio — All companies from the portfolioGrid singleton.
 * Used by both the grid (/portfolio) and detail pages (/portfolio/[slug]).
 */
export const portfolioGridQuery = groq`
  *[_type == "portfolioGrid"][0]{
    companies[]{
      brandName,
      year,
      sector,
      status,
      tags,
      investmentStage,
      fundType,
      "logo": logo.asset->url,
      "founderImage": founderImage.asset->url,
      foundingYear,
      oneLiner,
      about,
      website,
      newsBlogs,
      youtube,
      milestones,
      companyLinkedin,
      "gallery": gallery[].asset->url,
      founders[]{
        name,
        linkedin
      }
    }
  }
`;

/**
 * Lightweight projection for the portfolio grid (only the fields the card needs).
 * Used by the /api/portfolio route.
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

export const portfoliGridQuery = `*[_type == "company"] {
  brandName,
  year,
  sector,
  status,
  tags,
  investmentStage,
  fundType,
  "logo": logo.asset->url,
  "founderImage": founderImage.asset->url
}`;


/**
 * Beyond The Cheque page — Hero section.
 */
export const beyondTheChequeHeroQuery = groq`
  *[_type == "beyondTheChequeHero"][0]{
    headingFirst,
    headingSecond,
    subtitle
  }
`;

export const ourTeamHeroQuery = `*[_type == "ourTeamHero"][0] {
  titleLine1,
  titleLine2,
  titleLine3,
  description,
  "members": members[].asset->url
}`;

/**
 * Our Team page — "Led By Founders Who've Walked The Path." section.
 * Singleton. Portrait URLs resolved here so the frontend receives plain strings.
 */
export const ledByFoundersQuery = groq`
  *[_type == "ledByFounders"][0]{
    headingTopHighlight,
    headingBottom,
    founders[]{
      name,
      role,
      linkedin,
      bio,
      imagePosition,
      "image": image.asset->url
    }
  }
`;