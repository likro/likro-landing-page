/**
 * @frozen — easing canônico da biblioteca.
 *
 * cubic-bezier(0.16, 1, 0.3, 1) — decelerating curve "Stripe/Linear feel".
 * Escolhido conforme phase context (Claude's Discretion): conjunto coerente.
 * TODAS as 5 primitivas usam este easing — diferenças entre primitivas
 * vêm de duration/distance/stagger, NUNCA de easing diferente.
 */
export const MOTION_EASING = [0.16, 1, 0.3, 1] as const;

/** Duração base de reveal em ms — primitivas ajustam por tier. */
export const REVEAL_DURATION_MS = 500;
