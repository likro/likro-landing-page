"use client";

/**
 * PainStatement — synthesis-line editorial (D-11) que fecha a seção Pain.
 *
 * Entra com delay maior (500ms) que o último card da constelação — efeito:
 * "depois dos fragmentos, a constatação". Reutiliza hero-card-rise (rise+fade).
 *
 * threshold 0.5 deliberado: só dispara quando a frase está meio-visível, ou seja,
 * depois da constelação (que tem threshold 0.3). Sequência narrativa.
 */
import { useInView } from "@/hooks/use-in-view";
import { PAIN_COPY } from "@/content/pain";

export function PainStatement() {
  const [ref, inView] = useInView<HTMLParagraphElement>({ threshold: 0.5 });
  return (
    <p
      ref={ref}
      className={`mx-auto mt-16 max-w-3xl text-balance text-center text-base leading-[1.6] text-text-on-dark-secondary sm:mt-20 sm:text-lg ${
        inView ? "hero-card-rise" : "opacity-0"
      }`}
      style={{ animationDelay: "500ms" }}
    >
      {PAIN_COPY.statement}
    </p>
  );
}
