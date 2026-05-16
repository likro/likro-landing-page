"use client";
/**
 * Helper interno: agrupa spans-palavras em "linhas" detectando mudança
 * de `offsetTop` (= quebra de linha visual).
 *
 * Estratégia (D-12):
 * 1. Container tem N spans filhos (palavras renderizadas pelo TextSplit).
 * 2. Após mount + após resize/rotate, percorrer spans e atribuir lineIndex
 *    incrementando quando `offsetTop` muda.
 * 3. Resize handler debounced (150ms) — rotate dispara resize automaticamente
 *    em browsers modernos, então não precisamos de orientationchange listener
 *    separado.
 *
 * Retorna: array `number[]` onde `result[wordIndex] = lineIndex`.
 * Antes do primeiro measurement (SSR ou pré-mount), retorna array vazio.
 *
 * NÃO é exportado pelo barrel — uso interno apenas (consumido por <TextSplit>).
 */
import { useEffect, useState, type RefObject } from "react";

const DEBOUNCE_MS = 150;

export function useLineGrouping(
  containerRef: RefObject<HTMLElement | null>,
  enabled: boolean,
): number[] {
  const [lineMap, setLineMap] = useState<number[]>([]);

  useEffect(() => {
    if (!enabled) {
      setLineMap([]);
      return;
    }

    const measure = () => {
      const el = containerRef.current;
      if (!el) return;
      const spans = Array.from(
        el.querySelectorAll<HTMLElement>("[data-word]"),
      );
      if (spans.length === 0) {
        setLineMap([]);
        return;
      }
      let lineIndex = 0;
      let prevTop: number | null = null;
      const map: number[] = [];
      for (const span of spans) {
        const top = span.offsetTop;
        if (prevTop !== null && top !== prevTop) lineIndex += 1;
        map.push(lineIndex);
        prevTop = top;
      }
      setLineMap(map);
    };

    measure();

    let timer: ReturnType<typeof setTimeout> | null = null;
    const onResize = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(measure, DEBOUNCE_MS);
    };
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, [containerRef, enabled]);

  return lineMap;
}
