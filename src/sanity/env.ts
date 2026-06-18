/**
 * Centralised Sanity env vars. Importing from here means one place breaks
 * loudly if an env var is missing, instead of silently fetching against
 * the wrong project at runtime.
 */
/**
 * Centralised Sanity env vars. Both Next.js and the standalone Sanity
 * Studio (`npx sanity dev`) import from here.
 *
 * Why hardcoded fallbacks?
 *   - The standalone Studio bundles with Vite, which doesn't expose
 *     `process.env.NEXT_PUBLIC_*` at runtime the way Next does. Without
 *     a fallback the Studio crashes with "Missing env" the moment it
 *     boots.
 *   - These values are public (NEXT_PUBLIC_*) — already shipped to the
 *     browser. Nothing secret to hide.
 *   - `.env.local` still wins when present (in Next.js), so this is just
 *     a safety net for the Studio context.
 */
function readEnv(name: string, fallback: string): string {
  const value = typeof process !== "undefined" ? process.env[name] : undefined;
  return value || fallback;
}

export const projectId = readEnv("NEXT_PUBLIC_SANITY_PROJECT_ID", "suel5z6g");
export const dataset = readEnv("NEXT_PUBLIC_SANITY_DATASET", "production");
export const apiVersion = readEnv(
  "NEXT_PUBLIC_SANITY_API_VERSION",
  // ISO date string — pinning to a date locks the API shape so a Sanity
  // platform update can't silently change your responses.
  "2026-06-19",
);

/** Server-only read token (Viewer permission). Optional for public content. */
export const readToken =
  typeof process !== "undefined" ? process.env.SANITY_API_READ_TOKEN : undefined;
