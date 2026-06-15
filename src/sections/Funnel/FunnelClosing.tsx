/**
 * FunnelClosing — frase de fechamento do capítulo (Plan 09-02 Task 1, estático).
 *
 * Renderiza closing.lead + <span accent>{closing.accent}</span> + closing.tail
 * (FUNNEL_COPY). SEM CTA (CONTEXT D-2). SEM legenda/caption (CONTEXT D-7).
 * Tipografia: clamp(20px,2.6vw,30px), peso 500, line-height 1.3 (UI-SPEC).
 */
import { FUNNEL_COPY } from "@/content/funnel";

export function FunnelClosing() {
  const { lead, accent, tail } = FUNNEL_COPY.closing;
  return (
    <div className="relative z-10 mx-auto max-w-[760px] px-6 text-center">
      <p className="text-[clamp(20px,2.6vw,30px)] font-medium leading-[1.3] tracking-[-0.01em] text-text-on-dark-primary">
        {lead}
        <span className="text-accent-on-dark">{accent}</span>
        {tail}
      </p>
    </div>
  );
}
