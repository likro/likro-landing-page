/**
 * FunnelHead — eyebrow + h2 headline do capítulo Funil (Plan 09-02 Task 1).
 *
 * Estático (sem motion). O eyebrow é um <p>/<span> decorativo, NUNCA um heading
 * (a11y: o único h1 é o Hero; aqui o h2#funnel-headline carrega o título da seção).
 * Copy 100% de FUNNEL_COPY (COPY-01). Tipografia per UI-SPEC §Typography:
 * Inter, pesos 400/500 apenas (600 PROIBIDO/não carregado).
 */
import { FUNNEL_COPY } from "@/content/funnel";

export function FunnelHead() {
  return (
    <div className="relative z-10 px-6 pt-16 pb-7 text-center">
      <p className="mb-3.5 text-[14px] font-medium uppercase leading-none tracking-[0.14em] text-accent-on-dark/85">
        {FUNNEL_COPY.eyebrow}
      </p>
      <h2
        id="funnel-headline"
        className="mx-auto max-w-[680px] text-[clamp(24px,3.4vw,40px)] font-medium leading-[1.12] tracking-[-0.02em] text-text-on-dark-primary"
      >
        {FUNNEL_COPY.headline}
      </h2>
    </div>
  );
}
