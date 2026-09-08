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
      imageScaleFactor,
      imagePositionX,
      imagePositionY,
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
 *
 * `photos` carries each asset's own aspect ratio alongside its URL, so the
 * drifting tiles can be cut to the picture rather than the picture cropped to
 * the tile.
 *
 * NOTE: GROQ HAS NO COMMENT SYNTAX. A `/* … *​/` inside this template is query
 * text, not a comment, and fails to parse at runtime — explanations belong in
 * this JSDoc block, above the template, never inside it.
 */
export const ourStoryHeroQuery = groq`
  *[_type == "ourStoryHero"][0]{
    headingLineOne,
    headingLineTwo,
    description,
    "photos": photos[]{
      "url": asset->url,
      "aspect": asset->metadata.dimensions.aspectRatio
    }
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
      tags,
      linkedinUrl,
      emailUrl,
      twitterUrl,
      imageScale,
      imageOffsetX,
      imageOffsetY,
      "image": image.asset->url
    },
    "seedTeam": seedTeam[]{
      name,
      "slug": slug.current,
      title,
      bio,
      tags,
      linkedinUrl,
      emailUrl,
      twitterUrl,
      imageScale,
      imageOffsetX,
      imageOffsetY,
      "image": image.asset->url
    },
    "winnerFundTeam": winnerFundTeam[]{
      name,
      "slug": slug.current,
      title,
      bio,
      tags,
      linkedinUrl,
      emailUrl,
      twitterUrl,
      imageScale,
      imageOffsetX,
      imageOffsetY,
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
      tags,
      linkedinUrl,
      emailUrl,
      twitterUrl,
      imageScale,
      imageOffsetX,
      imageOffsetY,
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
    "storiesHeading": coalesce(
      storiesHeading,
      array::join([storiesHeadingFirst, storiesHeadingSecond][@ != null], "\n")
    ),
    ctaLabel,
    impactStats[]{
      num,
      label,
      caption
    },
    founderStories[]{
      storySlug,
      name,
      role,
      text,
      logoScale,
      logoOffsetY,
      tags,
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
      isLogo,
      scaleFactor,
      positionX,
      positionY,
      squareScaleFactor,
      squarePositionX,
      squarePositionY
    },
    allFounders[]{
      name,
      "image": image.asset->url,
      scaleFactor,
      positionX,
      positionY,
      squareScaleFactor,
      squarePositionX,
      squarePositionY
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
  "members": members[]{
    "url": asset->url,
    offsetX,
    offsetY,
    scale
  }
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
      "slug": slug.current,
      role,
      linkedin,
      instagram,
      twitter,
      bio,
      imagePosition,
      "image": image.asset->url
    }
  }
`;
/**
 * Portfolio page — "Backed Early" hero. Singleton.
 * Asset URLs resolved here so the client receives plain strings.
 */
export const backedEarlyQuery = groq`
  *[_type == "backedEarly"][0]{
    headingFirst,
    headingSecond,
    companies[]{
      name,
      logoScale,
      logoClass,
      noInvert,
      "bgImage": bgImage.asset->url,
      "logo": logo.asset->url
    }
  }
`;

/**
 * Single founder by slug — used by /founders/[slug].
 * Reads from the ledByFounders singleton's `founders` array.
 */
export const allFoundersQuery = groq`
  *[_type == "ledByFounders"][0].founders[]{
    name,
    "slug": slug.current,
    role,
    linkedin,
    instagram,
    twitter,
    bio,
    longBio,
    "image": image.asset->url,
    "imageNoBg": imageNoBg.asset->url
  }
`;




/* ─────────────────────────────────────────────────────────
   /indicorns page
   Asset URLs are resolved here so the clients receive plain strings.
   ───────────────────────────────────────────────────────── */

/** Indicorns hero — the folded card that unfolds on scroll. Singleton. */
/**
 * Titan Ecosystem — page hero. Singleton.
 *
 * Avatars are projected to bare URLs so the client can render them without
 * pulling in an image builder. Keep comments OUT of the groq template: GROQ
 * has no block-comment syntax, so a stray one is a parse error at query time,
 * not build time.
 */
export const titanEcosystemHeroQuery = groq`
  *[_type == "titanEcosystemHero"][0]{
    headingLineOne,
    headingLineTwo,
    founderCountLabel,
    "founderAvatars": founderAvatars[].asset->url,
    description
  }
`;

/** Blogs — hero. Its own singleton, separate from the listing below it. */
/**
 * The heading is ONE field now, with the editor's own line breaks in it.
 *
 * `coalesce` keeps a document written before that change rendering identically:
 * the two old fields are joined back together with the newline that used to be
 * implied by their being separate. It costs nothing once every document has
 * been migrated, and it means the migration is not a deploy-blocker.
 */
export const blogsHeroQuery = groq`
  *[_type == "blogsHero"][0]{
    "heading": coalesce(
      heading,
      headingFirst + "\n" + headingSecond,
      headingFirst,
      headingSecond
    ),
    subtitle
  }
`;

/**
 * Blog posts. EVERY post lives inside the single "Blogs Page" document, the
 * same way team members live inside "Our Team Page" — so the three queries
 * below all read one document and pick out of its `posts` array.
 *
 * One entry feeds both the listing card and the article, so a card can never
 * drift from the page it links to. Listing order is the ARRAY order: the post
 * an editor drags to the top is the one that leads.
 */
const BLOG_CARD_FIELDS = `
  "slug": slug.current,
  title,
  excerpt,
  "coverImage": coverImage.asset->url,
  tags,
  author,
  readTime,
  category,
  publishedAt,
  placement,
  featured
`;

/**
 * NEWEST FIRST, and UNDATED POSTS LAST.
 *
 * `order(publishedAt desc)` alone is not enough: GROQ sorts nulls to the FRONT
 * of a descending order, so every post without a date jumped ahead of the
 * dated ones — measured, the single dated post came out at the very bottom of
 * the listing. Sorting on `defined(publishedAt)` first pushes the undated ones
 * to the end, and the date then orders the rest.
 */
export const allBlogPostsQuery = groq`
  *[_type == "blogsPage"][0]{
    "posts": posts[defined(slug.current)] | order(defined(publishedAt) desc, publishedAt desc){
      ${BLOG_CARD_FIELDS}
    }
  }.posts
`;

export const blogPostBySlugQuery = groq`
  *[_type == "blogsPage"][0]{
    "post": posts[slug.current == $slug][0]{
      ${BLOG_CARD_FIELDS},
      blocks[]{
        _type,
        _key,
        _type == "storyContent" => { body, dropCap },
        _type == "storyQuote" => { text, attribution },
        _type == "storyNote" => { text },
        _type == "storyPicture" => { "image": image.asset->url, caption },
        _type == "storyFactBar" => {
          facts[]{ label, value },
          ctaLabel,
          ctaUrl
        },
        _type == "storyFigures" => { stats[]{ num, label }, footnote },
        _type == "storyExplore" => { heading, browseLabel, browseHref }
      }
    }
  }.post
`;

/* Filter the ARRAY, then project the slug. `posts[].slug.current[defined(@)]`
   reads naturally but binds differently and returns [null]. */
export const blogPostSlugsQuery = groq`
  *[_type == "blogsPage"][0]{
    "slugs": posts[defined(slug.current)].slug.current
  }.slugs
`;

/** Founders story — hero. Its own singleton. */
export const foundersStoryHeroQuery = groq`
  *[_type == "foundersStoryHero"][0]{
    headingLineOne,
    headingLineTwo,
    "founderImages": founderImages[].asset->url
  }
`;

/**
 * Founder stories. Same arrangement as the blogs above: every story lives
 * inside the single "Founders Story Page" document and is found by slug.
 *
 * Every section is projected whether or not it is filled — the PAGE decides
 * what to render, so an empty `acts` array or a missing `todayStats` simply
 * arrives as null and that section is skipped.
 */
export const founderStoryPageBySlugQuery = groq`
  *[_type == "foundersStoryPage"][0]{
    "story": stories[slug.current == $slug][0]{
      company,
      "slug": slug.current,
      tags,
      headline,
      founders,
      "heroImage": heroImage.asset->url,
      blocks[]{
        _type,
        _key,
        _type == "storyContent" => { body, dropCap },
        _type == "storyQuote" => { text, attribution },
        _type == "storyNote" => { text },
        _type == "storyPicture" => { "image": image.asset->url, caption },
        _type == "storyFactBar" => {
          facts[]{ label, value },
          ctaLabel,
          ctaUrl
        },
        _type == "storyFigures" => { stats[]{ num, label }, footnote },
        _type == "storyExplore" => { heading, browseLabel, browseHref }
      }
    }
  }.story
`;

/** Every slug, for generateStaticParams. */
export const founderStoryPageSlugsQuery = groq`
  *[_type == "foundersStoryPage"][0]{
    "slugs": stories[defined(slug.current)].slug.current
  }.slugs
`;

/** Titan Ecosystem — the scroll rail beneath the hero. Singleton. */
export const titanEcosystemPillarsQuery = groq`
  *[_type == "titanEcosystemPillars"][0]{
    heading,
    parts[]{
      title,
      description,
      visual,
      ctaLabel,
      ctaUrl,
      "ctaQr": ctaQr.asset->url,
      ctaQrHeading,
      ctaQrCaption
    }
  }
`;

export const indicornsHeroQuery = groq`
  *[_type == "indicornsHero"][0]{
    headingPrefix,
    "wordmark": wordmark.asset->url,
    panelOne,
    panelTwo,
    panelThreeIntro,
    criteria[]{
      before,
      highlight,
      after
    }
  }
`;

/** Indicorns — "Why We Created" story + timeline carousel. Singleton. */
export const whyIndicornsQuery = groq`
  *[_type == "whyIndicorns"][0]{
    heading,
    storyLabel,
    "storyImage": storyImage.asset->url,
    storyParagraphs,
    storyParagraphsMobile,
    timeline[]{
      date,
      title,
      desc,
      statNumber,
      statLabel,
      statSub
    }
  }
`;

/**
 * Indicorns — "Indicorns We Backed" company cards. Singleton.
 *
 * `logoScale` is aliased to `scale` because that is what the client prop is
 * called. Without the alias the client read `company.scale` — undefined — and
 * every logo silently fell back to scale(1), losing the per-logo optical
 * correction that keeps heavily-padded logos from rendering tiny.
 *
 * Keep comments OUT of the groq template: GROQ has no block-comment syntax,
 * so a stray one is a parse error at query time, not build time.
 */
export const indicornCompaniesQuery = groq`
  *[_type == "indicornCompanies"][0]{
    heading,
    companies[]{
      name,
      description,
      "scale": logoScale,
      "logoUrl": logo.asset->url
    }
  }
`;

/** Indicorns — founder testimonials on the 3D cylinder. Singleton. */
export const indicornTestimonialsQuery = groq`
  *[_type == "indicornTestimonials"][0]{
    headingTop,
    headingBottom,
    description,
    testimonials[]{
      quote,
      name,
      role,
      "image": image.asset->url
    }
  }
`;



/**
 * /foundersstory — the Featured band and the grid, from the SAME entries that
 * own the article pages.
 *
 * ONE SOURCE, like blogsPage.posts and ourTeam's member arrays. The listing
 * used to live in its own `foundersStoryGrid` document, joined to the articles
 * only by a slug guessed from the company name — so a card could point at a
 * story that did not exist, and the photo on the card and the photo in the
 * Featured band were separate fields that could drift apart. Reading the cards
 * off `foundersStoryPage.stories[]` makes both impossible: the link is the
 * entry's own slug, and the photo is the entry's own image.
 *
 * `cardImage` falls back to `heroImage` so a story that has only ever had a
 * hero still shows a card.
 */
export const foundersStoryListingQuery = groq`
  *[_type == "foundersStoryPage"][0]{
    heading,
    browseLabel,
    browseHref,
    gridHeading,
    ctaLabel,
    "stories": stories[defined(slug.current)]{
      featured,
      company,
      "slug": slug.current,
      "name": coalesce(founders, company),
      "role": coalesce(founderRole, headline),
      "text": coalesce(cardQuote, headline),
      tags,
      "image": coalesce(cardImage.asset->url, heroImage.asset->url),
      "logo": logo.asset->url,
      logoScale,
      logoOffsetY
    }
  }
`;

/** /foundersstory — the closing "650+ Founders" band. Singleton. */
export const sixFiftyFoundersQuery = groq`
  *[_type == "sixFiftyFounders"][0]{
    heading,
    "faces": faces[].asset->url
  }
`;

/**
 * The two legal pages. BOTH are fetched on BOTH routes: /privacy-policy and
 * /grievance-redressal render the same tabbed component, and switching tabs
 * does not reload the page — so the other tab's copy has to be in hand already.
 */
export const legalPagesQuery = groq`{
  "privacy": *[_type == "privacyPolicy"][0]{ heading, tabLabel, body },
  "grievance": *[_type == "grievanceRedressal"][0]{
    heading,
    tabLabel,
    body,
    funds[]{
      title,
      fundName,
      effectiveDate,
      registrationNumber,
      registeredOffice,
      investmentManager,
      trustee,
      sponsor
    }
  }
}`;
