import type { SchemaTypeDefinition } from "sanity";
import { aboutTheFund } from "./aboutTheFund";
import { backedBefore } from "./backedBefore";
import { backedEarly } from "./backedEarly";
import { company } from "./company";
import { footer } from "./footer";
import { foundersTestimonial } from "./foundersTestimonial";
import { fundDetails } from "./fundDetails";
import { hero } from "./hero";
import { navbar } from "./navbar";
import { fifteenYears } from "./fifteenYears";
import { originStory } from "./originStory";
import { ourStoryHero } from "./ourStoryHero";
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
  originStory,
  fifteenYears,
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
  /* Portfolio */
  company,
  portfolioGrid,
];
