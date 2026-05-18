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

      {/* L2 — grid técnico quase imperceptível, SEM mask radial (Pain quer espalhamento, não foco) */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.015) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* L3 — vinheta inferior fade-to-light: transição cromática Pain DARK → Bridge LIGHT (D-15) */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/3"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(250,250,249,0.0) 40%, rgba(250,250,249,0.95) 100%)",
        }}
      />
    </div>
  );
}
