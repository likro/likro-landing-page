/**
 * Phase 4 / Plan 04-05 — Proof copy module.
 *
 * D-24/D-26/D-28: institucional silencioso dark editorial.
 * D-27 + STATE.md 2026-05-18: cliente-específico explicitamente proibido,
 * zero logos, zero números fabricados, zero testimonials, zero falsos selos
 * de social proof. Credibilidade vem do tom contido.
 *
 * v1 — Categorias verticais minimal (D-25 candidato a):
 *   headline: "Infraestrutura operacional para clínicas de estética e dermatologia."
 *
 * v2 — Volume operacional silencioso (D-25 candidato b):
 *   headline: "Em operação em clínicas que dependem de atendimento de alto volume."
 *
 * v3 — Constatação editorial:
 *   headline: "A camada operacional já roda em clínicas reais — todos os dias."
 *
 * Categorias TRAVADAS (D-26): ["Estética", "Dermatologia", "Harmonização Facial", "Odontologia", "Bem-estar"]
 * — idênticas nas 3 variantes.
 *
 * COPY-05: categorias referenciam termos canônicos do glossário CLINICA_GLOSSARY (Plan 04-00).
 * COPY-06: zero claims numéricos sem fonte (gate mecânico via tests/content/proof.test.ts Test 6).
 */
export type ProofCopy = {
  eyebrow: string;
  headline: string;
  categories: readonly [string, string, string, string, string];
};

const CATEGORIES: ProofCopy["categories"] = [
  "Estética",
  "Dermatologia",
  "Harmonização Facial",
  "Odontologia",
  "Bem-estar",
];

export const PROOF_COPY_VARIANTS = {
  v1: {
    eyebrow: "EM OPERAÇÃO",
    headline: "Infraestrutura operacional para clínicas de estética e dermatologia.",
    categories: CATEGORIES,
  },
  v2: {
    eyebrow: "JÁ EM USO",
    headline: "Em operação em clínicas que dependem de atendimento de alto volume.",
    categories: CATEGORIES,
  },
  v3: {
    eyebrow: "INFRAESTRUTURA",
    headline: "A camada operacional já roda em clínicas reais, todos os dias.",
    categories: CATEGORIES,
  },
} as const satisfies Record<"v1" | "v2" | "v3", ProofCopy>;

/**
 * Variante ativa. Default: v1 (categorias minimal, headline mais clara
 * sobre o vertical). Lenny aprova/troca via PR no checkpoint Task 3.
 */
export const PROOF_COPY: ProofCopy = PROOF_COPY_VARIANTS.v1;
