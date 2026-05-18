"use client";

/**
 * PainCardConstellation — wrapper "use client" que dispara stagger CSS-only
 * dos 4 PainCards quando a seção entra no viewport (useInView do Plan 04-00).
 *
 * Pain quer "operação parada": os cards SOBEM uma vez (hero-card-rise) e ficam
 * estáticos. Sem float infinito (diferente do Hero), sem live-pulse.
 *
 * Stagger: animation-delay 0/100/200/300ms (D-19 reference). Após o último
 * card aparecer (~600ms total), PainStatement entra com delay 500ms próprio.
 *
 * NARR-07: rotações + spread reduzidos no mobile via Tailwind responsive utility
 * arbitrary transforms (sm: / lg: breakpoints) — sem useDeviceTier.
 */
import { useInView } from "@/hooks/use-in-view";
import { PAIN_COPY } from "@/content/pain";
import { PainCard } from "./PainCard";

// Cada string = posição absoluta + transform (translate + rotate) responsivo.
// Layout: 2x2 (top-left, top-right, bottom-left, bottom-right) com rotações alternadas.
// Mobile spread: ±60px com rotações ±2deg. Desktop spread: ±200px com rotações ±4deg.
const POSITIONS = [
  // Card 1 — Instagram, top-left, atrás (z-10 + opacity-90)
  "left-1/2 top-0 z-10 opacity-90 [transform:translateX(calc(-50%-60px))_rotate(-2deg)] sm:[transform:translateX(calc(-50%-140px))_rotate(-4deg)] lg:[transform:translateX(calc(-50%-200px))_rotate(-4deg)]",
  // Card 2 — WhatsApp, top-right, frente
  "left-1/2 top-4 z-20 [transform:translateX(calc(-50%+60px))_rotate(2deg)] sm:[transform:translateX(calc(-50%+140px))_rotate(3deg)] lg:[transform:translateX(calc(-50%+200px))_rotate(3deg)]",
  // Card 3 — Planilha, bottom-left, frente
  "left-1/2 top-44 z-20 [transform:translateX(calc(-50%-50px))_rotate(1deg)] sm:top-48 sm:[transform:translateX(calc(-50%-130px))_rotate(2deg)] lg:[transform:translateX(calc(-50%-180px))_rotate(2deg)]",
  // Card 4 — Notas, bottom-right, atrás
  "left-1/2 top-48 z-10 [transform:translateX(calc(-50%+50px))_rotate(-2deg)] sm:top-52 sm:[transform:translateX(calc(-50%+130px))_rotate(-3deg)] lg:[transform:translateX(calc(-50%+180px))_rotate(-3deg)]",
] as const;

export function PainCardConstellation() {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.3 });

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="relative mx-auto mt-16 h-[360px] w-full max-w-4xl sm:h-[400px] lg:h-[440px]"
    >
      {PAIN_COPY.cards.map((card, i) => (
        <div key={card.kind} className={`absolute ${POSITIONS[i]}`}>
          <div
            className={inView ? "hero-card-rise" : "opacity-0"}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <PainCard card={card} />
          </div>
        </div>
      ))}
    </div>
  );
}
