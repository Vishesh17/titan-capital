/**
 * Sanity Studio config — mounted at /studio in the Next.js app.
 * Used by both `next dev` (the embedded studio route) and any CLI commands.
 */
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { apiVersion, dataset, projectId } from "./src/sanity/env";
import { schemaTypes } from "./src/sanity/schemaTypes";

export default defineConfig({
  name: "titan-capital-studio",
  title: "Titan Capital — Content Studio",
  basePath: "/studio",
  projectId,
  dataset,
  schema: { types: schemaTypes },
  plugins: [
    structureTool(),
    // Vision lets editors run GROQ queries from the Studio for debugging.
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
