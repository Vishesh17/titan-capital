/**
 * WhatWeBelieve — server wrapper.
 *
 * Fetches the singleton "whatWeBelieve" document from Sanity and hands
 * the data to the existing presentational component. Falls back to
 * hardcoded defaults inside the client if the fetch fails or returns null.
 *
 * NOTE: page.tsx must import `WhatWeBelieve` from this file (the server
 * wrapper), NOT from `./WhatWeBelieveClient`. Importing the Client component
 * directly skips the Sanity fetch and you'll get fallback content on every
 * page load.
 */
import { sanityFetch } from "@/sanity/lib/client";
import { whatWeBelieveQuery } from "@/sanity/lib/queries";
import WhatWeBelieveClient, {
  type WhatWeBelieveData,
} from "./WhatWeBelieveClient";

async function getWhatWeBelieve(): Promise<WhatWeBelieveData | null> {
  try {
    return await sanityFetch<WhatWeBelieveData | null>({
      query: whatWeBelieveQuery,
      revalidate: 60,
    });
  } catch (err) {
    console.error("[WhatWeBelieve] Sanity fetch failed, using fallback:", err);
    return null;
  }
}

export default async function WhatWeBelieve() {
  const data = await getWhatWeBelieve();
  return <WhatWeBelieveClient data={data} />;
}
