/**
 * WR-03: Constantes canônicas de cor para uso em next/og ImageResponse
 * (inline styles em edge renderer não suportam CSS variables).
 *
 * REGRA: este é o ÚNICO lugar na codebase onde hex Likro pode aparecer.
 * O teste tests/brand-lock.test.ts exclui este arquivo do grep de hex literals.
 * Mantenha em sincronia com os tokens @theme em src/app/globals.css.
 */
export const BRAND = {
  /** #7C3AED — roxo Likro primário (accent-primary em globals.css) */
  accentPrimary: "#7C3AED",
  /** #6D28D9 — roxo Likro profundo (accent-hover em globals.css) */
  accentDeep: "#6D28D9",
  /** #0A0A0B — surface escura (surface-dark em globals.css) */
  surfaceDark: "#0A0A0B",
  /** #FAFAFA — texto sobre dark */
  textOnDark: "#FAFAFA",
} as const;
