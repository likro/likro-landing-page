/**
 * HeroCardStack — composição cinematográfica de 3 cards isolados.
 *
 * Refinamento de arte:
 *   - cards off-white (#FBFCFD) com bordas refinadas (zinc-200/70)
 *   - shadow em camadas: drop deep + soft + inset highlight (premium B2B)
 *   - tipografia tight com font-feature alts, mono pra metadata
 *   - float quase imperceptível (4-5px range, 7-9s loop, delays staggered)
 *   - dots/states com cores médias (não saturadas)
 *   - inset highlight 1px branco no topo (lighting cinematográfico)
 *
 * Estrutura: rotação dupla (outer rotate + inner float). Outer div fixa rotação;
 * inner article tem animation transform — independências preserva ambos efeitos.
 *
 * HERO-02: entrada CSS-only via hero-card-rise. Zero motion.* JSX.
 * HERO-04: zero next/image com `priority` aqui — LCP é o H1.
 * COPY-01: todo string vem de HERO_COPY.cards.
 */
import { CalendarCheck2, Check, Circle, Instagram, MoveRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { HERO_COPY, type HeroCard } from "@/content/hero";

const KIND_CONFIG = {
  lead: { icon: Instagram, accent: "text-rose-500" },
  routing: { icon: MoveRight, accent: "text-violet-600" },
  scheduled: { icon: CalendarCheck2, accent: "text-emerald-600" },
} as const;

interface CardProps {
  card: HeroCard;
  className?: string;
  style?: React.CSSProperties;
  floatClass?: string;
}

function HeroCard({ card, className, style, floatClass }: CardProps) {
  const { icon: Icon, accent } = KIND_CONFIG[card.kind];
  return (
    // Wrapper: float lento (controla transform infinito)
    <div className={floatClass}>
      {/* Inner: rise entrance (transform one-shot — independente do float) */}
      <article
        aria-hidden="true"
        style={style}
        className={cn(
          "hero-card-rise relative w-[260px] overflow-hidden rounded-[14px] bg-[#FBFCFD] p-4 sm:w-[300px] sm:p-[18px]",
          "border border-neutral-200/70 ring-1 ring-inset ring-white/80",
          "shadow-[0_24px_60px_-20px_rgba(8,12,24,0.65),0_8px_24px_-12px_rgba(8,12,24,0.45)]",
          className,
        )}
      >
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[10.5px] font-medium uppercase tracking-[0.12em] text-neutral-500">
          {card.kind === "lead" && (
            <span
              aria-hidden="true"
              className="hero-live-pulse inline-block size-[5px] rounded-full bg-emerald-500"
            />
          )}
          <Icon className={cn("size-[13px]", accent)} strokeWidth={2.25} />
          <span>{card.label}</span>
        </div>
        {card.meta && card.kind === "lead" && (
          <span className="font-mono text-[10.5px] tabular-nums text-neutral-400">
            {card.meta}
          </span>
        )}
      </header>
      <h3 className="mt-3 text-[15px] font-semibold leading-[1.3] tracking-[-0.01em] text-neutral-900">
        {card.title}
      </h3>
      <ul className="mt-2.5 space-y-1.5">
        {card.rows.map((row, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-[13px] leading-[1.45] text-neutral-700"
          >
            {row.type === "check" && (
              <Check
                className="mt-[3px] size-[13px] shrink-0 text-emerald-600"
                strokeWidth={2.75}
                aria-hidden="true"
              />
            )}
            {row.type === "pending" && (
              <Circle
                className="mt-[3px] size-[13px] shrink-0 text-neutral-300"
                strokeWidth={2.25}
                aria-hidden="true"
              />
            )}
            <span className={row.type === "pending" ? "text-neutral-500" : undefined}>
              {row.content}
            </span>
          </li>
        ))}
      </ul>
      {card.meta && card.kind === "scheduled" && (
        <p className="mt-3 border-t border-neutral-100 pt-3 font-mono text-[10.5px] tabular-nums tracking-tight text-neutral-500">
          {card.meta}
        </p>
      )}
      </article>
    </div>
  );
}

export function HeroCardStack() {
  const [lead, routing, scheduled] = HERO_COPY.cards;

  return (
    <div
      aria-hidden="true"
      className="relative mx-auto mt-14 h-[340px] w-full max-w-4xl sm:mt-16 sm:h-[380px] lg:h-[420px]"
    >
      {/* Card 1 — Lead novo: top-left, rotation -5°, atrás */}
      <div
        className="absolute left-1/2 top-0 z-10 [transform:translateX(calc(-50%-92px))_rotate(-5deg)] sm:[transform:translateX(calc(-50%-130px))_rotate(-5deg)] lg:[transform:translateX(calc(-50%-180px))_rotate(-5deg)]"
      >
        <HeroCard
          card={lead}
          floatClass="hero-card-float-a"
          style={{ animationDelay: "80ms" }}
        />
      </div>

      {/* Card 2 — Distribuição: centro, frente, sem rotação */}
      <div className="absolute left-1/2 top-14 z-30 -translate-x-1/2 sm:top-16">
        <HeroCard
          card={routing}
          floatClass="hero-card-float-b"
          style={{ animationDelay: "0ms" }}
        />
      </div>

      {/* Card 3 — Agendamento: bottom-right, rotation +5°, médio */}
      <div
        className="absolute left-1/2 top-36 z-20 [transform:translateX(calc(-50%+92px))_rotate(5deg)] sm:top-40 sm:[transform:translateX(calc(-50%+130px))_rotate(5deg)] lg:top-44 lg:[transform:translateX(calc(-50%+180px))_rotate(5deg)]"
      >
        <HeroCard
          card={scheduled}
          floatClass="hero-card-float-c"
          style={{ animationDelay: "160ms" }}
        />
      </div>
    </div>
  );
}
