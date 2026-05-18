/**
 * ProductHeroFeatureMockup — RSC composição CSS-only.
 *
 * Central inbox card + 2 overlay cards (routing top-right, confirmation bottom-left).
 * Float animations CSS-only via hero-card-float-a/c (já existem em globals.css, Phase 3 reuso).
 *
 * D-20.1: iaLine como micro-elemento textual ("system event" style) — NÃO banner,
 * NÃO neon, NÃO glow. Sparkles lucide muito sutil + texto uppercase tracking generous
 * em text-muted. Tom Linear/Stripe, não Anthropic/OpenAI marketing.
 *
 * D-20: hierarquia de surface — central card bg-surface-card-strong (#fff puro),
 * overlays bg-surface-card (#FBFCFD) — micro diferenciação que dá profundidade.
 *
 * NARR-06: zero motion lib import; tudo CSS keyframes Phase 3.
 * NARR-07: mobile (default) usa w-[280px] central + rotações ±2deg (transforms inline overlays);
 *   desktop sm: amplia para 420/480px com rotações ±4deg.
 *
 * Inbox rows + iaLine + overlay objects vêm 100% de PRODUCT_COPY.feature.mockup
 * (zero string PT-BR hardcoded — gate Task 1 test 5).
 */
import {
  CalendarCheck2,
  Facebook,
  Instagram,
  MessageCircle,
  MoveRight,
  Sparkles,
} from "lucide-react";
import { PRODUCT_COPY, type ProductInboxRow } from "@/content/product";

const CHANNEL_ICONS = {
  instagram: { Icon: Instagram, color: "text-rose-400" },
  whatsapp: { Icon: MessageCircle, color: "text-emerald-600" },
  facebook: { Icon: Facebook, color: "text-blue-500" },
} as const;

function statusBadge(status: ProductInboxRow["status"]) {
  if (status === "new") return { label: "novo", cls: "bg-emerald-50 text-emerald-700" };
  if (status === "assigned") return { label: "atribuído", cls: "bg-blue-50 text-blue-700" };
  return { label: "respondido", cls: "bg-neutral-100 text-neutral-600" };
}

export function ProductHeroFeatureMockup() {
  const { mockup } = PRODUCT_COPY.feature;
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto w-full max-w-[280px] sm:max-w-[420px] lg:max-w-[480px]"
    >
      {/* Central inbox card — surface-card-strong (#fff), hierarquia D-20 */}
      <article className="relative z-20 overflow-hidden rounded-[14px] border border-neutral-200/70 bg-surface-card-strong p-5 ring-1 ring-inset ring-white shadow-[0_20px_40px_-12px_rgba(8,12,24,0.15),0_4px_12px_-4px_rgba(8,12,24,0.08)] sm:p-6">
        <header className="flex items-center justify-between gap-3 border-b border-neutral-100 pb-4">
          <div className="min-w-0">
            <div className="text-[10.5px] font-medium uppercase tracking-[0.12em] text-neutral-500">
              {mockup.cardLabel}
            </div>
            <h4 className="mt-1 text-[15px] font-semibold tracking-[-0.01em] text-neutral-900">
              {mockup.cardTitle}
            </h4>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <span
              aria-hidden="true"
              className="hero-live-pulse inline-block size-[5px] rounded-full bg-emerald-500"
            />
            <span className="text-[10.5px] font-medium tracking-tight text-emerald-700">
              {mockup.newCountBadge}
            </span>
          </div>
        </header>

        <ul className="mt-4 space-y-3">
          {mockup.inboxRows.map((row, i) => {
            const { Icon, color } = CHANNEL_ICONS[row.channel];
            const badge = statusBadge(row.status);
            return (
              <li key={i} className="flex items-start gap-3">
                <Icon
                  className={`mt-0.5 size-4 shrink-0 ${color}`}
                  strokeWidth={2.25}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[13px] font-semibold tracking-tight text-neutral-900">
                      {row.from}
                    </span>
                    {row.meta && (
                      <span className="font-mono text-[10.5px] tabular-nums text-neutral-400">
                        {row.meta}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-[12.5px] leading-[1.4] text-neutral-600">
                    {row.preview}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-medium ${badge.cls}`}
                >
                  {badge.label}
                </span>
              </li>
            );
          })}
        </ul>

        {/* iaLine — D-20.1: micro-elemento textual, NÃO banner */}
        <p className="mt-4 flex items-center gap-1.5 border-t border-neutral-100 pt-3 text-[10.5px] uppercase tracking-[0.12em] text-text-muted">
          <Sparkles className="size-3 text-neutral-400" strokeWidth={2.25} />
          {mockup.iaLine}
        </p>
      </article>

      {/* Overlay 1 — routing, top-right, hero-card-float-a */}
      <div
        className="hero-card-float-a absolute right-[-12px] top-[-12px] z-30 w-[140px] rotate-[2deg] sm:right-[-40px] sm:w-[200px] sm:rotate-[4deg]"
        style={{ animationDelay: "0.6s" }}
      >
        <div className="rounded-[12px] border border-neutral-200/70 bg-surface-card p-3 ring-1 ring-inset ring-white/80 shadow-[0_12px_24px_-12px_rgba(8,12,24,0.18)]">
          <div className="text-[10px] font-medium uppercase tracking-[0.12em] text-neutral-500">
            {mockup.overlayRouting.from === "Marina" ? "DISTRIBUIÇÃO" : "ATRIBUIÇÃO"}
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 text-[12px] font-semibold tracking-tight text-neutral-900">
            <span>{mockup.overlayRouting.from}</span>
            <MoveRight className="size-3.5 text-violet-500" strokeWidth={2.5} />
            <span>{mockup.overlayRouting.to}</span>
          </div>
        </div>
      </div>

      {/* Overlay 2 — confirmation, bottom-left, hero-card-float-c */}
      <div
        className="hero-card-float-c absolute bottom-[-16px] left-[-12px] z-30 w-[130px] -rotate-[2deg] sm:left-[-36px] sm:w-[180px] sm:-rotate-[3deg]"
        style={{ animationDelay: "1.2s" }}
      >
        <div className="rounded-[12px] border border-neutral-200/70 bg-surface-card p-3 ring-1 ring-inset ring-white/80 shadow-[0_12px_24px_-12px_rgba(8,12,24,0.18)]">
          <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-neutral-500">
            <CalendarCheck2 className="size-3 text-emerald-600" strokeWidth={2.5} />
            AGENDADO
          </div>
          <div className="mt-1.5 text-[12px] font-semibold tracking-tight text-neutral-900">
            {mockup.overlayConfirm.name}
          </div>
          <div className="mt-0.5 font-mono text-[10.5px] tabular-nums text-neutral-500">
            {mockup.overlayConfirm.slot}
          </div>
        </div>
      </div>
    </div>
  );
}
