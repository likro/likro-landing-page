/**
 * ProductSecondaryCard — RSC primitive.
 *
 * Card "capacidade operacional" (D-19): eyebrow + title + description + mini-mockup CSS.
 * 3 kinds de mini-mockup via switch em card.mockupKind:
 *  - "routing-pill": pill "from → to" com seta lucide
 *  - "timeline-3pts": 3 dots conectados (1ª msg · 1ª resposta · agendado)
 *  - "calendar-grid": grid 3x2 com 2 slots ocupados (neutro), 4 vagos
 *
 * Surface light premium D-20: bg-surface-card-strong + border + ring + 2-layer shadow LIGHT.
 * Zero violet/accent bg em surfaces grandes (D-20.1).
 *
 * NARR-06: zero motion lib import. RSC puro.
 */
import { ArrowRight } from "lucide-react";
import type { ProductSecondary } from "@/content/product";

interface ProductSecondaryCardProps {
  card: ProductSecondary;
}

export function ProductSecondaryCard({ card }: ProductSecondaryCardProps) {
  return (
    <article className="flex h-full flex-col rounded-[14px] border border-neutral-200/70 bg-surface-card-strong p-6 ring-1 ring-inset ring-white shadow-[0_8px_24px_-12px_rgba(8,12,24,0.1),0_2px_6px_-2px_rgba(8,12,24,0.06)] lg:p-7">
      <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-text-muted">
        {card.eyebrow}
      </div>
      <h3 className="mt-3 text-lg font-semibold tracking-[-0.01em] text-text-primary lg:text-xl">
        {card.title}
      </h3>
      <p className="mt-2 text-sm leading-[1.5] text-text-secondary">
        {card.description}
      </p>
      <div className="mt-5 flex h-[80px] items-center lg:h-[100px]">
        <MiniMockup card={card} />
      </div>
    </article>
  );
}

function MiniMockup({ card }: { card: ProductSecondary }) {
  if (card.mockupKind === "routing-pill") {
    return (
      <div
        aria-hidden="true"
        className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-2"
      >
        <span className="text-[12px] font-semibold tracking-tight text-neutral-900">Marina</span>
        <ArrowRight className="size-3.5 text-violet-500" strokeWidth={2.5} />
        <span className="text-[12px] font-semibold tracking-tight text-neutral-900">
          Dra. Camila
        </span>
      </div>
    );
  }

  if (card.mockupKind === "timeline-3pts") {
    return (
      <div aria-hidden="true" className="w-full">
        <div className="flex items-center gap-2">
          <span className="hero-live-pulse inline-block size-2 shrink-0 rounded-full bg-emerald-500" />
          <hr className="flex-1 border-t border-neutral-200" />
          <span className="inline-block size-2 shrink-0 rounded-full bg-neutral-400" />
          <hr className="flex-1 border-t border-neutral-200" />
          <span className="inline-block size-2 shrink-0 rounded-full bg-neutral-300" />
        </div>
        <div className="mt-2 flex items-center justify-between font-mono text-[10px] tracking-tight text-neutral-500">
          <span>1ª msg</span>
          <span>1ª resposta</span>
          <span>agendado</span>
        </div>
      </div>
    );
  }

  // calendar-grid
  return (
    <div aria-hidden="true" className="w-full">
      <div className="grid grid-cols-3 grid-rows-2 gap-1.5">
        <div className="h-6 rounded-md border border-neutral-200 bg-neutral-50" />
        <div className="h-6 rounded-md border border-neutral-300 bg-neutral-200" />
        <div className="h-6 rounded-md border border-neutral-200 bg-neutral-50" />
        <div className="h-6 rounded-md border border-neutral-200 bg-neutral-50" />
        <div className="h-6 rounded-md border border-neutral-300 bg-neutral-200" />
        <div className="h-6 rounded-md border border-neutral-200 bg-neutral-50" />
      </div>
    </div>
  );
}
