"use client";
import { useScroll } from "motion/react";
import type { MotionValue } from "motion/react";
import type { RefObject } from "react";

/**
 * Helper INTERNO — wrappa motion/react useScroll com defaults sensatos.
 * Consumido por <ScrollScene> (D-01..D-04) e <ParallaxLayer> (D-11).
 * NÃO é exportado pelo barrel — uso interno apenas.
 *
 * @param ref ref ao elemento alvo
 * @param offset sintaxe Framer Motion useScroll (D-03);
 *               default ['start end', 'end start'] (entrada→saída do viewport)
 */
export function useScrollProgressInRange(
  ref: RefObject<HTMLElement | null>,
  offset: [string, string] = ["start end", "end start"]
): MotionValue<number> {
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: offset as never, // motion/react aceita strings, type é stricter
  });
  return scrollYProgress;
}
