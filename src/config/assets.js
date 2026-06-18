/**
 * Central asset manifest so future swaps do not require gameplay changes.
 */
export const ASSET_MANIFEST = {
  cats: {
    blueSide: new URL("../../outputs/assets/cat-blue-side.png", import.meta.url).href,
    blueWalk: new URL("../../outputs/assets/cat-blue-walk.png", import.meta.url).href,
    creamSide: new URL("../../outputs/assets/cat-cream-side.png", import.meta.url).href,
    creamWalk: new URL("../../outputs/assets/cat-cream-walk.png", import.meta.url).href,
    tuxWalk: new URL("../../outputs/assets/cat-tux-walk.png", import.meta.url).href
  },
  audio: {}
};
