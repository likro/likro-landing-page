/**
 * HeroBackground — RSC; gradient + grid sutil + glow pulsante CSS-only.
 *
 * D-06: glow roxo extremamente sutil + grid abstrato leve + gradient editorial.
 * D-15: glow pulsa 8-12s ease-in-out, scale 1↔1.05 + opacity sutil — única animação no hero.
 * MOTION-07: prefers-reduced-motion já é tratado globalmente em globals.css
 *   (animation-duration: 0.01ms) → pulse vira no-op, glow estático permanece.
 * MOTION-08: anima APENAS transform + opacity (GPU-friendly).
 * @keyframes hero-glow-pulse é registrado em globals.css.
 */
export function HeroBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      {/* Base gradient editorial — vertical, neutro, quase imperceptível */}
      <div className="absolute inset-0 bg-gradient-to-b from-surface-darker via-surface-dark to-surface-darker" />
      {/* Grid sutil — textura editorial abstrata */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Glow pulsante atrás do mockup (right side, vertical center) */}
      <div className="absolute right-[10%] top-1/2 size-[600px] -translate-y-1/2 rounded-full bg-accent-glow blur-[120px] [animation:hero-glow-pulse_10s_cubic-bezier(0.4,0,0.6,1)_infinite]" />
    </div>
  );
}
