"use client";

import { Fragment } from "react";
import { useInView } from "@/hooks/use-in-view";
import { BRIDGE_COPY } from "@/content/bridge";

/**
 * BridgeStatement — único elemento animado da seção Bridge.
 *
 * O statement editorial É o h2 real (id="bridge-headline"). Não há heading
 * sintético sr-only — a frase forte é o heading da seção (D-13 statement
 * editorial silencioso + SEO: heading real contém copy real, não boilerplate).
 *
 * Quando há tríade de statements (v1 ou v2), são concatenados dentro do mesmo
 * <h2> separados por <br /> (cada frase em uma linha visual, mas semanticamente
 * um único heading). Stagger de animation-delay aplicado a cada frase via
 * <span> wrapper com a classe hero-headline-reveal (clip-path mask reveal da
 * esquerda → direita, reuso do keyframe Phase 3).
 *
 * NARR-06 reinterpretado: zero motion lib import; CSS-only via useInView +
 * keyframe Phase 3.
 */
export function BridgeStatement() {
  const [ref, inView] = useInView<HTMLHeadingElement>({ threshold: 0.4 });
  return (
    <h2
      ref={ref}
      id="bridge-headline"
      className="mx-auto max-w-3xl text-balance text-center font-sans text-3xl font-semibold leading-[1.15] tracking-[-0.02em] text-text-primary sm:text-4xl lg:text-5xl"
    >
      {BRIDGE_COPY.statements.map((s, i) => (
        <Fragment key={i}>
          <span
            className={`inline-block ${inView ? "hero-headline-reveal" : "opacity-0"}`}
            style={{ animationDelay: `${i * 200}ms` }}
          >
            {s}
          </span>
          {i < BRIDGE_COPY.statements.length - 1 && <br />}
        </Fragment>
      ))}
    </h2>
  );
}
