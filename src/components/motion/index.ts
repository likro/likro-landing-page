/**
 * @frozen — API congelada das primitivas de motion (MOTION-06).
 *
 * 5 primitivas exportadas:
 *   - <RevealOnView>   — fade+slide stagger on viewport entry
 *   - <ParallaxLayer>  — translateY sutil por scroll progress
 *   - <ScrollScene>    — render-prop boundary GSAP-future-ready (MotionValue<number> 0→1)
 *   - <TextSplit>      — reveal por palavra (desktop) ou linha (mobile/tablet)
 *   - <StickyStage>    — pin estrutural via position:sticky + svh
 *
 * Política de mudanças (D-16):
 * - Mudanças nesta API exigem PR com label `motion-api-change`
 *   e aprovação explícita do Lenny.
 * - Consumidores (seções, atoms) NUNCA importam de `motion/react`
 *   diretamente — apenas deste barrel.
 *   EXCEÇÃO controlada: dentro do render prop de <ScrollScene>, seções
 *   podem importar `useTransform` de `motion/react` para derivar sub-ranges
 *   do `progress` recebido (MOTION-05 + D-02). Documentado no README.
 * - Imports de paths internos (`./internal/*`) também não são permitidos
 *   fora desta pasta. Convenção, não enforced via ESLint (Phase 1 D-15).
 */

export { RevealOnView } from "./reveal-on-view";
export type { RevealOnViewProps } from "./reveal-on-view";

export { ParallaxLayer } from "./parallax-layer";
export type { ParallaxLayerProps } from "./parallax-layer";

export { ScrollScene } from "./scroll-scene";
export type { ScrollSceneProps } from "./scroll-scene";

export { TextSplit } from "./text-split";
export type { TextSplitProps } from "./text-split";

export { StickyStage } from "./sticky-stage";
export type { StickyStageProps } from "./sticky-stage";
