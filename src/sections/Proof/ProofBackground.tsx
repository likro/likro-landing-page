/**
 * ProofBackground — dark editorial AUSTERE.
 *
 * D-28: silêncio visual vale mais que exagero. SEM accent roxo, SEM haze, SEM
 * radial glow. Apenas base gradient + grid quase imperceptível + transição
 * top que costura Funnel (dark) → Proof (dark) sem corte abrupto.
 *
 * MOTION-08: zero animation; CSS layered backgrounds. Server Component (default).
 */
export function ProofBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      {/* L1 — top transition fade do dark Funnel pro dark Proof */}
      <div
        className="absolute inset-x-0 top-0 h-1/3"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0.0) 0%, rgba(10,15,26,1) 100%)",
        }}
      />
      {/* L2 — base atmospheric gradient blue-black */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,15,26,1) 0%, rgba(14,20,34,1) 50%, rgba(10,15,26,1) 100%)",
        }}
      />
      {/* L3 — grid técnico opacity 0.012 (mais baixo que Pain — austere) */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.012) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />
    </div>
  );
}
