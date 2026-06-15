/**
 * ProofBackground — CLARO editorial silencioso (v2, 2026-06-14).
 *
 * Proof era DARK; virou CLARA pra fluir com HowItWorks (acima) e Form (abaixo) —
 * acaba com a "ilha preta" no meio do bloco claro (feedback Lenny). Tratamento
 * mínimo: leve profundidade vertical (branco → off-white → branco), SEM grid duro,
 * SEM accent — silêncio editorial, sem costura com as vizinhas claras.
 *
 * MOTION-08: zero animation; CSS layered backgrounds. Server Component (default).
 */
export function ProofBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      {/* Base clara TINGIDA (cinza-azulado leve, NÃO branca — pedido Lenny): a Prova
          ganha um tom sutil que a distingue das vizinhas brancas (HowItWorks/Form)
          sem virar ilha — continua clara, arco tonal preservado. Profundidade vertical
          mínima dentro do mesmo tom (sem borda dura). */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #F2F4F8 0%, #EEF1F5 55%, #F2F4F8 100%)",
        }}
      />
    </div>
  );
}
