import IndicornsHeroClient from "./IndicornsHeroClient";

/**
 * /indicorns — page hero. Currently pure client-side (no Sanity fetch).
 * When editable copy is required, wire in a query + fallback here.
 */
export default function IndicornsHero() {
  return <IndicornsHeroClient />;
}
