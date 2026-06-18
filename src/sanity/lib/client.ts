import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId, readToken } from "../env";

/**
 * Shared Sanity client.
 *  - `useCdn: false` so we always hit the source-of-truth API; Next.js
 *    handles caching via `fetch`'s `next.revalidate` option.
 *  - The read token is optional. Public content works without it; supplying
 *    it lets you fetch drafts/preview content later if you want.
 */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: readToken,
  perspective: "published",
});

/**
 * Wrapper around `client.fetch` that bakes in Next.js ISR caching.
 * Use this everywhere instead of `client.fetch` directly so cache TTL
 * lives in one place and we never accidentally bypass the cache.
 */
export async function sanityFetch<T>({
  query,
  params = {},
  revalidate = 60,
  tags,
}: {
  query: string;
  params?: Record<string, unknown>;
  /** Seconds. Use 0 for no caching, false-equivalent for full ISR. */
  revalidate?: number;
  /** Optional tags for on-demand revalidation later (revalidateTag). */
  tags?: string[];
}): Promise<T> {
  return client.fetch<T>(query, params, {
    next: { revalidate, tags },
  });
}
