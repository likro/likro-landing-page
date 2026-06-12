"use client";
/**
 * /preview — protótipo do Hero premium (redesign v2, NÃO toca produção).
 *
 * "A travessia da luz": uma matéria única (campo de luz) se transformando
 * CONTINUAMENTE caos→ordem ao longo do scroll — não uma forma, não slides.
 * Referência sentida: Cairn (o ambiente evolui porque você avança).
 *
 * O palco vive em <Travessia> (client, useScroll no topo). Esta page só compõe
 * o palco + uma sentinela de saída + a tag meta de dev. Gate em layout.tsx.
 */
import { Travessia } from "./_components/Travessia";

export default function PreviewPage() {
  return (
    <main className="bg-surface-darker">
      <Travessia />

      {/* Sentinela — alvo do CTA secundário e respiro de saída do palco sticky. */}
      <section
        id="preview-fim"
        className="flex min-h-[60svh] items-center justify-center bg-surface-darker px-6"
      >
        <p className="max-w-md text-balance text-center text-sm leading-relaxed text-text-on-dark-muted">
          Daqui o restante da página continuaria. Este preview isola só o Hero
          para você sentir a travessia.
        </p>
      </section>

      {/* Tag meta discreta (chrome de dev, não faz parte do hero). */}
      <span className="pointer-events-none fixed right-3 top-3 z-50 select-none font-mono text-[10px] uppercase tracking-[0.2em] text-white/25">
        likro · preview do hero
      </span>
    </main>
  );
}
