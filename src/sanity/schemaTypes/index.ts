import type { SchemaTypeDefinition } from "sanity";
import { company } from "./company";
import { foundersTestimonial } from "./foundersTestimonial";
import { hero } from "./hero";
import { impactAtGlance } from "./impactAtGlance";
import { indicornSpotlight } from "./indicornSpotlight";

/**
 * Registry of every document/object type the Studio knows about.
 * Add new schemas here so they show up in the Studio sidebar.
 */
export const schemaTypes: SchemaTypeDefinition[] = [
  hero,
  impactAtGlance,
  indicornSpotlight,
  foundersTestimonial,
  company,
];
