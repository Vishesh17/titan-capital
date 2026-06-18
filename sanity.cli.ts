/**
 * Sanity CLI config — read by `npx sanity <command>`.
 *
 * Separate from `sanity.config.ts` (which configures the Studio runtime).
 * The CLI runs outside Next.js so it doesn't pick up `.env.local` reliably —
 * project ID and dataset are hardcoded here since they're public values
 * (already exposed via NEXT_PUBLIC_ env vars to the browser).
 */
import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: "suel5z6g",
    dataset: "production",
  },
});
