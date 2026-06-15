"use client";

import { useSectionView } from "@/hooks/use-section-view";

/**
 * Phase 6 — Wrapper client de `section_view` tracking (TRACK-04).
 *
 * Existe para NÃO editar os arquivos de seção (Pain/Bridge/Product/Proof são
 * server components; o Funnel é client; envolver cada um numa lógica client
 * exigiria torná-los client = risco de regressão). `page.tsx` envolve cada
 * `<Section />` com `<TrackSection section="...">`.
 *
 * `className="contents"` (CSS `display: contents`): o wrapper não cria caixa de
 * layout própria — some do box model — então não interfere com sticky/grid das
 * seções. O IntersectionObserver observa o `<div>` cujo `display:contents` faz a
 * geometria ser herdada dos filhos; em browsers reais a observação ainda
 * funciona porque o IO usa o retângulo do conteúdo renderizado. Decisão de
 * planner: zero regressão visual.
 */
export function TrackSection({
  section,
  children,
}: {
  section: string;
  children: React.ReactNode;
}): React.ReactElement {
  const ref = useSectionView<HTMLDivElement>(section);
  return (
    <div ref={ref} className="contents">
      {children}
    </div>
  );
}
