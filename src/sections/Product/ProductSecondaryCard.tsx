/**
 * ProductSecondaryCard — RSC primitive.
 *
 * 999.2 — apoio DISCRETO: ícone lucide pequeno (accent micro) + eyebrow + title
 * curto + 1 linha de description. SEM mini-mockups (a feature-herói é o único foco
 * visual; as secundárias respiram em vez de competir).
 *
 * Ícone por índice (estável, derivado do eyebrow):
 *  - DISTRIBUIÇÃO → Split
 *  - FOLLOW-UP    → BellRing
 *  - AGENDA       → CalendarCheck
 *
 * Surface light premium D-20: bg-surface-card-strong + border + ring + shadow LIGHT.
 * Accent (text-violet-500) só no ícone size-5 — micro-elemento, nunca surface (D-20.1).
 *
 * NARR-06: zero motion lib import. RSC puro.
 * COPY-01: zero string PT-BR inline; tudo vem de card.eyebrow/title/description.
 */
import { BellRing, CalendarCheck, Split, type LucideIcon } from "lucide-react";
import type { ProductSecondary } from "@/content/product";

interface ProductSecondaryCardProps {
  card: ProductSecondary;
}

const ICON_BY_EYEBROW: Record<string, LucideIcon> = {
  DISTRIBUIÇÃO: Split,
  "FOLLOW-UP": BellRing,
  AGENDA: CalendarCheck,
};

export function ProductSecondaryCard({ card }: ProductSecondaryCardProps) {
  const Icon = ICON_BY_EYEBROW[card.eyebrow] ?? Split;

  return (
    <article className="flex h-full flex-col rounded-[14px] border border-neutral-200/70 bg-surface-card-strong p-7 ring-1 ring-inset ring-white shadow-[0_8px_24px_-12px_rgba(8,12,24,0.1),0_2px_6px_-2px_rgba(8,12,24,0.06)] lg:p-8">
      <Icon aria-hidden="true" className="size-5 text-violet-500" strokeWidth={2} />
      <div className="mt-4 text-[11px] font-medium uppercase tracking-[0.18em] text-text-muted">
        {card.eyebrow}
      </div>
      <h3 className="mt-2 text-base font-semibold tracking-[-0.01em] text-text-primary lg:text-lg">
        {card.title}
      </h3>
      <p className="mt-1.5 text-sm leading-[1.5] text-text-secondary">
        {card.description}
      </p>
    </article>
  );
}
