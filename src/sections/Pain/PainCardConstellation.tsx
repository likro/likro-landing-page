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
 * NARR-07: dois layouts distintos por breakpoint:
 *   - Mobile (default): grid 2x2 com rotation leve (cards não overlapam, texto lê)
 *   - sm+ (640px+): constellation absolute spread original (rotação maior, overlap intencional)
 * Decisão UAT 2026-05-18: viewport 375px (180px card × ±60px spread = 60px overlap
 * com text clipping). Fix preserva metáfora "operação espalhada" via rotation sem
 * sacrificar legibilidade.
 */
import { useInView } from "@/hooks/use-in-view";
import { PAIN_COPY } from "@/content/pain";
import { PainCard } from "./PainCard";

// Mobile grid rotations (cards lado a lado, rotação leve mantém sensação fragmentada).
const MOBILE_ROTATIONS = ["-rotate-1", "rotate-2", "rotate-1", "-rotate-2"] as const;

// Desktop (sm+) absolute positions: spread original ±140/±200px com rotation maior.
const DESKTOP_POSITIONS = [
  // Card 1 — Instagram, top-left, atrás
  "sm:absolute sm:left-1/2 sm:top-0 sm:z-10 sm:opacity-90 sm:[transform:translateX(calc(-50%-140px))_rotate(-4deg)] lg:[transform:translateX(calc(-50%-200px))_rotate(-4deg)]",
  // Card 2 — WhatsApp, top-right, frente
  "sm:absolute sm:left-1/2 sm:top-4 sm:z-20 sm:[transform:translateX(calc(-50%+140px))_rotate(3deg)] lg:[transform:translateX(calc(-50%+200px))_rotate(3deg)]",
  // Card 3 — Planilha, bottom-left, frente
  "sm:absolute sm:left-1/2 sm:top-48 sm:z-20 sm:[transform:translateX(calc(-50%-130px))_rotate(2deg)] lg:[transform:translateX(calc(-50%-180px))_rotate(2deg)]",
  // Card 4 — Notas, bottom-right, atrás
  "sm:absolute sm:left-1/2 sm:top-52 sm:z-10 sm:[transform:translateX(calc(-50%+130px))_rotate(-3deg)] lg:[transform:translateX(calc(-50%+180px))_rotate(-3deg)]",
] as const;

export function PainCardConstellation() {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.3 });

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="relative mx-auto mt-16 grid w-full max-w-4xl grid-cols-2 justify-items-center gap-x-3 gap-y-4 sm:block sm:h-[400px] lg:h-[440px]"
    >
      {PAIN_COPY.cards.map((card, i) => (
        <div key={card.kind} className={`${MOBILE_ROTATIONS[i]} sm:rotate-0 ${DESKTOP_POSITIONS[i]}`}>
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
