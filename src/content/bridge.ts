/**
 * Phase 4 / Plan 04-02 — Bridge copy module.
 *
 * Bridge = statement editorial silencioso puro (D-13/D-15). NÃO tem h2/sub/cards.
 * Forma: `statements: readonly string[]` — 1-3 frases.
 *
 * v1 — Recusa silenciosa em tríade (referência D-15 Lenny):
 *   "Existe um jeito de operar isso sem rodar 4 apps abertos."
 *   "Sem perder lead. Sem mandar a equipe procurar onde está a conversa."
 *
 * v2 — Afirmação operacional contida em tríade:
 *   "A operação da clínica em um sistema só."
 *   "A equipe em uma tela só."
 *   "O paciente sem repetir a história."
 *
 * v3 — Two-sentence editorial (mirror Pain v3 cadence):
 *   "Existe outra forma de operar. Ela cabe em uma tela."
 *
 * COPY-02 + D-14: zero buzzwords anti-IA (gates em tests/content/bridge.test.ts).
 * D-27: zero menção ao cliente real (gate em tests/content/bridge.test.ts).
 */
export type BridgeCopy = {
  statements: ReadonlyArray<string>;
};

export const BRIDGE_COPY_VARIANTS = {
  v1: {
    statements: [
      "Existe um jeito de operar isso sem rodar 4 apps abertos.",
      "Sem perder lead. Sem mandar a equipe procurar onde está a conversa.",
    ],
  },
  v2: {
    statements: [
      "A operação da clínica em um sistema só.",
      "A equipe em uma tela só.",
      "O paciente sem repetir a história.",
    ],
  },
  v3: {
    statements: ["Existe outra forma de operar.", "Ela cabe em uma tela."],
  },
} as const satisfies Record<"v1" | "v2" | "v3", BridgeCopy>;

/**
 * BRIDGE_COPY = variante ativa. Lenny aprovou v3 via UAT 2026-05-18
 * (editorial seco mirror do Pain v3 — duas sentenças curtas, sem travessões).
 */
export const BRIDGE_COPY: BridgeCopy = BRIDGE_COPY_VARIANTS.v3;
