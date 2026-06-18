/**
 * WhatFoundersGet — server wrapper.
 *
 * Fetches the singleton "whatFoundersGet" document from Sanity and hands
 * the data to the existing presentational component. The flowchart layout
 * (positions, arrows, hub image, mobile scaling) lives entirely in the
 * client component — only title/desc per feature comes from the CMS.
 *
 * NOTE: page.tsx must import `WhatFoundersGet` from this file (the server
 * wrapper), NOT from `./WhatFoundersGetClient`. Importing the Client
 * component directly skips the Sanity fetch.
 */
import { sanityFetch } from "@/sanity/lib/client";
import { whatFoundersGetQuery } from "@/sanity/lib/queries";
import WhatFoundersGetClient, {
  type WhatFoundersGetData,
} from "./WhatFoundersGetClient";

async function getWhatFoundersGet(): Promise<WhatFoundersGetData | null> {
  try {
    return await sanityFetch<WhatFoundersGetData | null>({
      query: whatFoundersGetQuery,
      revalidate: 60,
    });
  } catch (err) {
    console.error("[WhatFoundersGet] Sanity fetch failed, using fallback:", err);
    return null;
  }
}

export default async function WhatFoundersGet() {
  const data = await getWhatFoundersGet();
  return <WhatFoundersGetClient data={data} />;
}
