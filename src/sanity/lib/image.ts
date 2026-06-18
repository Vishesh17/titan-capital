import imageUrlBuilder from "@sanity/image-url";
import { dataset, projectId } from "../env";

const builder = imageUrlBuilder({ projectId, dataset });

/**
 * Build a Sanity CDN URL for an image asset. Supports on-the-fly transforms:
 *   urlFor(logo).width(400).height(400).fit("max").auto("format").url()
 *
 * Always call `.url()` at the end to get the string for next/image's `src`.
 */
export function urlFor(source: Parameters<typeof builder.image>[0]) {
  return builder.image(source);
}
