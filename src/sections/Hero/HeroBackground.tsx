/**
 * HeroBackground — atmosfera cinematográfica em 4 camadas tonais.
 *
 * Refinamento de arte: blue-black profundo + radial layers sutis + grid quase
 * imperceptível + haze suave atrás do card central + vinheta de foco.
 * NADA neon, NADA glow forte. Apenas depth.
 *
 * MOTION-08: hero-haze-drift anima APENAS transform+opacity (GPU-friendly).
 * MOTION-07: prefers-reduced-motion via globals.css desliga o drift.
 */
export function HeroBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      {/* L1 — overlay azul-petróleo muito sutil sobre o surface-darker, dá tom à atmosfera */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(15,23,42,0.6) 0%, rgba(10,15,26,0.0) 50%, rgba(2,6,15,0.5) 100%)",
        }}
      />

      {/* L2 — radial roxo sussurrado no topo central; warmth, NUNCA protagonista */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 0%, rgba(124,58,237,0.10), transparent 60%)",
        }}
      />

      {/* L3 — segundo radial azul-frio no canto pra dimensionalidade — efeito Linear */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 85% 25%, rgba(56,114,224,0.08), transparent 65%)",
        }}
      />

      {/* L4 — grid técnico quase imperceptível, com máscara radial pro fade nas bordas */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.015) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse 75% 55% at 50% 38%, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, transparent 85%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 75% 55% at 50% 38%, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, transparent 85%)",
        }}
      />

      {/* L5 — haze atrás do card central (foco visual sutil). Drift muito lento. */}
      <div
        className="hero-haze-drift absolute left-1/2 top-[58%] size-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(124,58,237,0.18) 0%, rgba(56,114,224,0.10) 35%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* L6 — vinheta inferior pra foco e remate da composição */}
      <div
        className="absolute inset-x-0 bottom-0 h-2/5"
        style={{
          background:
            "linear-gradient(to bottom, transparent, rgba(10,15,26,0.7) 60%, rgba(10,15,26,1))",
        }}
      />
    </div>
  );
}
