/**
 * MarinaCard — o card protagonista (Plan 09-02 Task 1: shell presentacional).
 *
 * Marina atravessa o board; este componente é a casca visual. Conteúdo (nome,
 * channel, moment, seal) vem de FUNNEL_COPY (COPY-01). Largura fixa de
 * componente (236px desktop / ~280px mobile) — NÃO é token de spacing.
 *
 * Task 2 dirige o movimento (translateX) e a troca de beats por fora; este
 * arquivo só desenha. O conteúdo do beat é injetado via `beat` (channel+moment);
 * `win` liga o estado de clímax (borda/ring/glow roxo + tag de confirmação).
 *
 * `win` aceita boolean (estado discreto, usado no reduced final-state) OU um
 * MotionValue/elemento — mas a casca em si trata só do boolean visual; a
 * ignição contínua da tag é montada pelo board (Task 2) sobrepondo seu próprio
 * <motion.div>. Aqui mantemos a versão boolean para o caminho estático/reduced.
 *
 * Roxo só via rgba (escape-hatch brand-lock). NUNCA hex de marca literal.
 */
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { FUNNEL_COPY } from "@/content/funnel";
import type { ReactNode } from "react";

type MarinaCardProps = {
  /** channel curto (ex.: "via WhatsApp") — o registro micro do beat. */
  channel: ReactNode;
  /** o momento humano (a fala/ação) — o registro de corpo do beat. */
  moment: ReactNode;
  /** liga o clímax visual (borda/ring/glow roxo + tag de confirmação visível). */
  win?: boolean;
  /** largura: desktop board (236px) vs mobile rail (mais larga, legível). */
  size?: "board" | "rail";
  /** permite ao board sobrepor a tag de confirmação com sua própria animação. */
  tagSlot?: ReactNode;
  className?: string;
};

export function MarinaCard({
  channel,
  moment,
  win = false,
  size = "board",
  tagSlot,
  className,
}: MarinaCardProps) {
  return (
    <div
      className={cn(
        "rounded-[12px] border bg-[#171826] p-[13px_14px] shadow-[0_18px_50px_-16px_rgba(0,0,0,0.8)]",
        "transition-[border-color,box-shadow] duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)]",
        size === "board" ? "w-[236px]" : "w-full max-w-[300px]",
        win
          ? "border-[rgba(157,107,240,0.8)] shadow-[0_0_0_1px_rgba(124,58,237,0.4),0_24px_60px_-16px_rgba(124,58,237,0.6)]"
          : "border-[#2a2c40]",
        className,
      )}
    >
      <div className="mb-2.5 flex items-center gap-[9px]">
        <span
          aria-hidden="true"
          className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,rgba(124,58,237,1),#b58bf5)] text-[12px] font-medium text-white"
        >
          {FUNNEL_COPY.protagonist.charAt(0)}
        </span>
        <div className="min-w-0">
          <div className="text-[14px] font-medium leading-[1.1] text-text-on-dark-primary">
            {FUNNEL_COPY.protagonist}
          </div>
          <div className="mt-0.5 text-[11px] leading-[1.2] text-text-on-dark-secondary">
            {channel}
          </div>
        </div>
      </div>

      <div
        className={cn(
          "flex min-h-[54px] items-center rounded-[8px] border px-2.5 py-[9px] text-[14px] leading-[1.4]",
          win
            ? "border-[rgba(124,58,237,0.4)] bg-[linear-gradient(180deg,rgba(124,58,237,0.16),rgba(124,58,237,0.04))] text-[#e9ddff]"
            : "border-[#20222f] bg-[#11121c] text-[#c9cbd9]",
        )}
      >
        {moment}
      </div>

      {/* Tag de confirmação. Por padrão (estático/reduced) controlada por `win`.
          O board (Task 2) injeta `tagSlot` com a ignição contínua via motion. */}
      {tagSlot ?? (
        <div
          className={cn(
            "mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-medium leading-[1.2] text-accent-on-dark transition-all duration-[400ms] ease-[cubic-bezier(0.22,0.61,0.36,1)]",
            win ? "translate-y-0 opacity-100" : "translate-y-[4px] opacity-0",
          )}
        >
          <span className="flex size-[14px] items-center justify-center rounded-full bg-[rgba(124,58,237,1)] text-white">
            <Check className="size-[9px]" aria-hidden="true" />
          </span>
          {FUNNEL_COPY.seal}
        </div>
      )}
    </div>
  );
}
