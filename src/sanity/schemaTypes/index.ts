import type { SchemaTypeDefinition } from "sanity";
import { aboutTheFund } from "./aboutTheFund";
import { backedBefore } from "./backedBefore";
import { backedEarly } from "./backedEarly";
import { blogPost } from "./blogPost";
import { blogsHero } from "./blogsHero";
import { blogsPage } from "./blogsPage";
import { company } from "./company";
import { footer } from "./footer";
import { founderStoryEntry } from "./founderStoryEntry";
import {
  storyContent,
  storyQuote,
  storyNote,
  storyPicture,
  storyFactBar,
  storyFigures,
  storyExplore,
} from "./storyBlocks";
import { foundersStoryHero } from "./foundersStoryHero";
import { foundersStoryPage } from "./foundersStoryPage";
import { foundersTestimonial } from "./foundersTestimonial";
import { fundDetails } from "./fundDetails";
import { hero } from "./hero";
import { navbar } from "./navbar";
import { fifteenYears } from "./fifteenYears";
import { originStory } from "./originStory";
import { ourStoryHero } from "./ourStoryHero";
import { legalText } from "./legalText";
import { privacyPolicy, grievanceRedressal } from "./legalPages";
import { richText } from "./richText";
import { sixFiftyFounders } from "./sixFiftyFounders";
import { ourTeam } from "./ourTeam";
import { ourTeamHero } from "./ourTeamHero";
import { ledByFounders } from "./ledByFounders";
import { pageSeo } from "./pageSeo";
import { teamMember } from "./teamMember";
import { siteSeo } from "./siteSeo";
import { impactAtGlance } from "./impactAtGlance";
import { indicornSpotlight } from "./indicornSpotlight";
import { indicornsHero } from "./indicornsHero";
import { whyIndicorns } from "./whyIndicorns";
import { indicornCompanies } from "./indicornCompanies";
import { indicornTestimonials } from "./indicornTestimonials";
import { portfolioWinnerFund } from "./portfolioWinnerFund";
import { titanEcosystemHero } from "./titanEcosystemHero";
import { titanEcosystemPillars } from "./titanEcosystemPillars";
import { titanSeedHero } from "./titanSeedHero";
import { whatFoundersGet } from "./whatFoundersGet";
import { whatWeBelieve } from "./whatWeBelieve";
import { whatWeLookFor } from "./whatWeLookFor";
import { whyTitanSeed } from "./whyTitanSeed";
import { getInvestmentFAQ } from "./getInvestmentFAQ";
import { getInvestmentForm } from "./getInvestmentForm";
import { getInvestmentHero } from "./getInvestmentHero";
import { portfolioGrid } from "./portfolioGrid";
import { winnersHero } from "./winnersHero";

/**
 * Registry of every document/object type the Studio knows about.
 * Add new schemas here so they show up in the Studio sidebar.
 */
export const schemaTypes: SchemaTypeDefinition[] = [
  /* Home page */
  hero,
  impactAtGlance,
  indicornSpotlight,
  foundersTestimonial,
  backedBefore,
  backedEarly,
  whatWeBelieve,
  whatFoundersGet,
  /* Indicorns page */
  indicornsHero,
  whyIndicorns,
  indicornCompanies,
  indicornTestimonials,
  /* Titan Seed page */
  titanSeedHero,
  whyTitanSeed,
  whatWeLookFor,
  /* Winners Fund page */
  winnersHero,
  aboutTheFund,
  portfolioWinnerFund,
  fundDetails,
  /* Get Investment page */
  getInvestmentHero,
  getInvestmentForm,
  getInvestmentFAQ,
  /* Our Story page */
  ourStoryHero,
  richText,
  legalText,
  sixFiftyFounders,
  originStory,
  fifteenYears,
  /* Titan Ecosystem page */
  titanEcosystemHero,
  titanEcosystemPillars,
  /* Our Team page */
  ourTeamHero,
  ledByFounders,
  ourTeam,
  teamMember,
  /* Global */
  navbar,
  footer,
  /* SEO */
  siteSeo,
  pageSeo,
  /* Blogs page — hero, then one document holding every post */
  blogsHero,
  blogsPage,
  blogPost,
  /* Founders story page — hero, then one document holding every story */
  foundersStoryHero,
  foundersStoryPage,
  founderStoryEntry,
  /* The blocks a story is composed from */
  storyContent,
  storyQuote,
  storyNote,
  storyPicture,
  storyFactBar,
  storyFigures,
  storyExplore,
  /* Portfolio */
  company,
  portfolioGrid,
  /* Legal pages — both render through the same tabbed component */
  privacyPolicy,
  grievanceRedressal,
];
