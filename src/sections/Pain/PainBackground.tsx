/**
 * PainBackground — atmosfera dark com transição cromática para light no fim.
 *
 * Razão da vinheta inferior LIGHT: D-15 — Pain (DARK) → Bridge (LIGHT) precisa de
 * transição visual; o final do Pain "dissolve" em direção ao surface-light de Bridge.
 *
 * Composição:
 *   L1 — base atmospheric blue-black, mais denso que Hero (Pain quer "peso", não foco).
 *   L2 — grid técnico opacity 0.015, SEM máscara radial (constelação espalhada, não foco central).
 *   L3 — vinheta inferior fade-to-light para transição cromática com Bridge (D-15).
 *
 * NARR-06 reinterpretation: zero animation, pure CSS gradient layers. RSC.
 */
export function PainBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      {/* L1 — base atmospheric, blue-black profundo, mais denso que Hero */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,15,26,1) 0%, rgba(14,20,34,1) 50%, rgba(10,15,26,1) 100%)",
        }}
      />

      {/* L2 — grid técnico quase imperceptível, SEM mask radial (Pain quer espalhamento, não foco).
          Mask de TOPO: o grid FADE-IN de cima (invisível no topo, cheio por ~16%) pra não criar
          uma borda dura na costura com o Hero — o topo da Pain fica #0A0F1A puro, igual ao remate
          do campo que dissolve em sólido. Costura some. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.015) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 16%, black 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 16%, black 100%)",
        }}
      />

      {/* L3 — vinheta inferior fade-to-light: transição cromática Pain DARK → Bridge LIGHT (D-15).
          Dissolve na COR EXATA do Bridge (#F4F7FB), 100% opaco no fim, fade longo (40% da
          seção) — sem emenda de dois tons (antes ia pra #FAFAF9 branco-quente, que destoava
          do azulado-frio do Bridge e criava a faixa estranha no encontro). */}
      <div
        className="absolute inset-x-0 bottom-0 h-2/5"
        style={{
          background:
            "linear-gradient(to bottom, rgba(244,247,251,0) 0%, rgba(244,247,251,0.55) 65%, rgba(244,247,251,1) 100%)",
        }}
      />
    </div>
  );
}
