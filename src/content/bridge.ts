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
 * v3 — Single-line editorial:
 *   "Existe outra forma de operar — e ela cabe em uma tela."
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
    statements: ["Existe outra forma de operar — e ela cabe em uma tela."],
  },
} as const satisfies Record<"v1" | "v2" | "v3", BridgeCopy>;

/**
 * BRIDGE_COPY = variante ativa. Provisional: aponta para v1 (recusa em tríade,
 * referência direta do Lenny D-15) até aprovação via PR. Após aprovação, manter
 * o ponteiro fixado e arquivar variantes não escolhidas no git history.
 */
export const BRIDGE_COPY: BridgeCopy = BRIDGE_COPY_VARIANTS.v1;
