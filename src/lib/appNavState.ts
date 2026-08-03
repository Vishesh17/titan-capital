/**
 * Tracks whether the app has already mounted on the client during the
 * current document lifetime.
 *
 *   - Starts `false` on every HARD load (fresh visit, refresh, external
 *     link, direct URL) because the module is re-instantiated.
 *   - Flips to `true` after the app's first client render (set from the
 *     persistent LenisProvider in the root layout) and STAYS true across
 *     every client-side (soft) navigation.
 *
 * The homepage hero reads this to decide between the full intro
 * (hard load → `false`) and the short heading-only reveal (soft
 * navigation back to home → `true`).
 */
let mounted = false;

export function hasAppMounted(): boolean {
  return mounted;
}

export function markAppMounted(): void {
  mounted = true;
}
