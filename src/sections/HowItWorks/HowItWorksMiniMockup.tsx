/**
 * HowItWorksMiniMockup — RSC primitive.
 *
 * Switch por step.mockupKind. 4 kinds compostos com lucide icons + tailwind:
 *   - "notification": card pequeno Instagram + nome + dot pulse (lead chegando)
 *   - "routing": pill horizontal "Marina → Dra. Camila" (atribuição automática)
 *   - "conversation": 2 balões empilhados (paciente + atendente)
 *   - "calendar-slot": grid 3-col com 1 slot agendado verde + 5 neutros
 *
 * D-23: mini-mockups COMPACTOS, evidência informacional — NÃO showy.
 *   ~80-100px height; menor que feature mockup Product. Tom calmo.
 * D-20.1: zero violet/accent bg em surface grande (apenas ícone violeta micro
 *   em routing arrow, único accent visual permitido).
 * COPY-01: todas as strings vêm de HOW_MOCKUP_STRINGS (content module).
 * NARR-06: zero motion lib import.
 */
import { ArrowRight, Instagram } from "lucide-react";
import { HOW_MOCKUP_STRINGS, type HowMockupKind } from "@/content/how-it-works";

interface HowItWorksMiniMockupProps {
  kind: HowMockupKind;
}

export function HowItWorksMiniMockup({ kind }: HowItWorksMiniMockupProps) {
  if (kind === "notification") {
    return (
      <div
        aria-hidden="true"
        className="w-[200px] rounded-[12px] border border-neutral-200/70 bg-surface-card p-3 ring-1 ring-inset ring-white/80 shadow-[0_8px_18px_-10px_rgba(8,12,24,0.12)]"
      >
        <div className="flex items-center gap-2">
          <Instagram className="size-4 text-rose-400" strokeWidth={2.25} />
          <span className="flex-1 truncate text-[12px] font-semibold text-neutral-900">
            {HOW_MOCKUP_STRINGS.notification.handle}
          </span>
          <span className="hero-live-pulse inline-block size-[5px] rounded-full bg-emerald-500" />
        </div>
        <div className="mt-1.5 truncate text-[11px] text-neutral-500">
          {HOW_MOCKUP_STRINGS.notification.meta}
        </div>
      </div>
    );
  }

  if (kind === "routing") {
    return (
      <div
        aria-hidden="true"
        className="inline-flex w-fit items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-2"
      >
        <span className="text-[12px] font-semibold tracking-tight text-neutral-900">
          {HOW_MOCKUP_STRINGS.routing.from}
        </span>
        <ArrowRight className="size-3.5 text-violet-500" strokeWidth={2.5} />
        <span className="text-[12px] font-semibold tracking-tight text-neutral-900">
          {HOW_MOCKUP_STRINGS.routing.to}
        </span>
      </div>
    );
  }

  if (kind === "conversation") {
    return (
      <div aria-hidden="true" className="flex w-[220px] flex-col gap-1.5">
        <div className="max-w-[180px] self-start rounded-[12px] rounded-bl-[4px] border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-[11px] leading-[1.4] text-neutral-700">
          {HOW_MOCKUP_STRINGS.conversation.patient}
        </div>
        <div className="max-w-[180px] self-end rounded-[12px] rounded-br-[4px] border border-emerald-200/70 bg-emerald-50 px-3 py-1.5 text-[11px] leading-[1.4] text-emerald-800">
          {HOW_MOCKUP_STRINGS.conversation.agent}
        </div>
      </div>
    );
  }

  // calendar-slot
  return (
    <div aria-hidden="true" className="grid w-[200px] grid-cols-3 gap-1.5">
      {Array.from({ length: 6 }).map((_, i) => {
        const isSelected = i === 4;
        return (
          <div
            key={i}
            className={`flex h-9 items-center justify-center rounded-md border font-mono text-[10.5px] ${
              isSelected
                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                : "border-neutral-200 bg-neutral-50 text-neutral-400"
            }`}
          >
            {isSelected
              ? HOW_MOCKUP_STRINGS.calendarSlot.selected
              : HOW_MOCKUP_STRINGS.calendarSlot.placeholder}
          </div>
        );
      })}
    </div>
  );
}
