/**
 * URL slug for a Titan Capital founder — same rule used for portfolio
 * companies and team members.
 *
 * Lives in its own module (no "use client") because both the LedByFounders
 * section, which is a client component, and /founders/[slug], which is a
 * server component, need it. Trailing/leading whitespace is trimmed first:
 * one of the names in Sanity has a leading space, which would otherwise
 * produce "-rohit-bansal".
 */
export function founderSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
