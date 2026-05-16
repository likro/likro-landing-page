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
 *
 * Re-exports são adicionados pelas waves 2 e 3 — este barrel propositalmente
 * fica vazio até as primitivas existirem.
 */
export {};
