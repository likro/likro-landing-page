/**
 * PainCard — pseudo-card primitive para os 4 fragmentos de operação na Pain.
 *
 * Visual herdado de HeroCard (Phase 3):
 *   - bg-surface-card (#FBFCFD), border + ring inset white/80, 2-layer shadow drop+soft
 *   - radius 14px (rounded-[14px]) — cards principais
 *   - escala ~70% do HeroCard: w-[180px] mobile, w-[240px] sm+
 *
 * Tom Pain (vs Hero): "operação parada" — sem dot live-pulse, sem float, sem
 * cores saturadas. Lucide icons em neutros (rose muted no Instagram pra hint
 * sutil; demais em neutral-500). Sem animação interna — Pain é constatação.
 *
 * COPY-01: todo string vem de PAIN_COPY.cards (via prop). Zero hardcoded PT-BR.
 * NARR-06: zero motion lib import. RSC.
 */
import { Circle, Instagram, MessageCircle, NotebookPen, Table2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PainCard as PainCardType, PainCardKind } from "@/content/pain";

const KIND_CONFIG: Record<
  PainCardKind,
  { icon: typeof Instagram; accent: string }
> = {
  instagram: { icon: Instagram, accent: "text-rose-400/80" },
  whatsapp: { icon: MessageCircle, accent: "text-neutral-500" },
  spreadsheet: { icon: Table2, accent: "text-neutral-500" },
  notes: { icon: NotebookPen, accent: "text-neutral-500" },
};

interface PainCardProps {
  card: PainCardType;
  className?: string;
}

export function PainCard({ card, className }: PainCardProps) {
  const { icon: Icon, accent } = KIND_CONFIG[card.kind];
  return (
    <article
      aria-hidden="true"
      className={cn(
        "relative w-[180px] overflow-hidden rounded-[14px] bg-[#FBFCFD] p-3.5 sm:w-[240px] sm:p-4",
        "border border-neutral-200/70 ring-1 ring-inset ring-white/80",
        "shadow-[0_24px_60px_-20px_rgba(8,12,24,0.65),0_8px_24px_-12px_rgba(8,12,24,0.45)]",
        className,
      )}
    >
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[10.5px] font-medium uppercase tracking-[0.12em] text-neutral-500">
          <Icon className={cn("size-[13px]", accent)} strokeWidth={2.25} />
          <span className="truncate">{card.label}</span>
        </div>
        {card.meta && (
          <span className="shrink-0 font-mono text-[10.5px] tabular-nums text-neutral-400">
            {card.meta}
          </span>
        )}
      </header>
      <h3 className="mt-3 text-[13.5px] font-semibold leading-[1.3] tracking-[-0.01em] text-neutral-900 sm:text-[14.5px]">
        {card.title}
      </h3>
      <ul className="mt-2 space-y-1.5">
        {card.rows.map((row, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-[12px] leading-[1.45] text-neutral-700 sm:text-[13px]"
          >
            {row.type === "pending" && (
              <Circle
                className="mt-[3px] size-[11px] shrink-0 text-neutral-300"
                strokeWidth={2.25}
                aria-hidden="true"
              />
            )}
            <span
              className={cn(
                row.type === "pending" && "text-neutral-500",
                row.type === "strikethrough" && "text-neutral-400 line-through",
              )}
            >
              {row.content}
            </span>
          </li>
        ))}
      </ul>
    </article>
  );
}
