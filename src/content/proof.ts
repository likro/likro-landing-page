/**
 * Phase 4 / Plan 04-05 — Proof copy module.
 *
 * D-24/D-26/D-28: institucional silencioso editorial.
 * D-27 + STATE.md 2026-05-18: cliente-específico explicitamente proibido,
 * zero logos, zero números fabricados, zero testimonials, zero falsos selos
 * de social proof. Credibilidade vem do tom contido.
 *
 * 2026-06-15 (feedback Lenny): a Proof responde "isso já funciona?", NÃO
 * "para quais clínicas funciona?". Removidos os chips de especialidade e
 * qualquer tipo específico de clínica no headline — enumerar nichos puxava a
 * atenção pra uma discussão que não importa nessa altura da narrativa. Foco
 * 100% em adoção real e uso diário. Sem travessão (menos publicitário).
 *
 * Variantes (Lenny aprova/troca via PR):
 *   v1 (ativa): "Já roda na rotina de clínicas reais todos os dias."
 *   v2: "Em operação em clínicas que dependem de atendimento de alto volume."
 *   v3: "A camada operacional já roda em clínicas reais, todos os dias."
 *
 * COPY-06: zero claims numéricos sem fonte (gate mecânico via tests/content/proof.test.ts Test 6).
 */
export type ProofCopy = {
  eyebrow: string;
  headline: string;
};

export const PROOF_COPY_VARIANTS = {
  v1: {
    eyebrow: "EM OPERAÇÃO",
    headline: "Já roda na rotina de clínicas reais todos os dias.",
  },
  v2: {
    eyebrow: "JÁ EM USO",
    headline: "Em operação em clínicas que dependem de atendimento de alto volume.",
  },
  v3: {
    eyebrow: "INFRAESTRUTURA",
    headline: "A camada operacional já roda em clínicas reais, todos os dias.",
  },
} as const satisfies Record<"v1" | "v2" | "v3", ProofCopy>;

/**
 * Variante ativa. Default: v1 (foco em uso diário / adoção real, sem nichos).
 */
export const PROOF_COPY: ProofCopy = PROOF_COPY_VARIANTS.v1;
