/**
 * @frozen — API congelada das primitivas de motion (MOTION-06).
 *
 * Política de mudanças (D-16):
 * - Mudanças nesta API exigem PR com label `motion-api-change`
 *   e aprovação explícita do Lenny.
 * - Consumidores (seções, atoms) NUNCA importam de `motion/react`
 *   diretamente — apenas deste barrel.
 * - Imports de paths internos (`./internal/*`) também não são permitidos
 *   fora desta pasta. Convenção, não enforced via ESLint (Phase 1 D-15).
 */

export { RevealOnView } from "./reveal-on-view";
export type { RevealOnViewProps } from "./reveal-on-view";

export { ParallaxLayer } from "./parallax-layer";
export type { ParallaxLayerProps } from "./parallax-layer";

// Próximos exports (Wave 2 plans 03, 04):
// export { ScrollScene } from "./scroll-scene";
// export type { ScrollSceneProps } from "./scroll-scene";
// export { TextSplit } from "./text-split";
// export type { TextSplitProps } from "./text-split";
// export { StickyStage } from "./sticky-stage";
// export type { StickyStageProps } from "./sticky-stage";
