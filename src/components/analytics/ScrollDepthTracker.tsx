"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics";

/**
 * Phase 6 — Componente headless de `scroll_depth` tracking (TRACK-04).
 *
 * Escuta `scroll` no window e dispara `track("scroll_depth", { depth })` ao
 * cruzar cada marco de [25, 50, 75, 100]% — cada marco UMA vez por sessão
 * (dedup via Set).
 *
 * Decisões de implementação:
 * - Montado em `page.tsx` (Plan 03), NÃO em `layout.tsx`: o layout envolve
 *   também `/privacy`, onde scroll_depth da landing não faz sentido.
 * - Listener `passive: true` — obrigatório para não bloquear a thread de scroll
 *   (INP protegido); throttle via `requestAnimationFrame` coalesce para 1x/frame.
 * - `scrollHeight`/`innerHeight` lidos DENTRO do compute (valores atuais):
 *   no mobile a address bar dinâmica altera `innerHeight` durante o scroll
 *   (06-RESEARCH §Pitfall 1).
 * - Marco 100 usa tolerância `pct >= 99` — a address bar mobile pode deixar
 *   1-2px sobrando e o 100% exato nunca seria atingido (§Pitfall 1).
 * - No-op quando a página não é rolável (`scrollable <= 0`).
 * - Lenis 1.3.x faz scroll real do document → `window.scrollY` e o evento
 *   `scroll` nativo continuam válidos (06-RESEARCH A1).
 */
const MILESTONES = [25, 50, 75, 100] as const;

export function ScrollDepthTracker(): null {
  const firedRef = useRef<Set<number>>(new Set());
  const tickingRef = useRef(false);

  useEffect(() => {
    const compute = () => {
      tickingRef.current = false;
      const scrollHeight = document.documentElement.scrollHeight;
      const innerHeight = window.innerHeight;
      const scrollable = scrollHeight - innerHeight;
      if (scrollable <= 0) return;
      const pct = (window.scrollY / scrollable) * 100;
      for (const m of MILESTONES) {
        const crossed = m === 100 ? pct >= 99 : pct >= m;
        if (crossed && !firedRef.current.has(m)) {
          firedRef.current.add(m);
          track("scroll_depth", { depth: m });
        }
      }
    };

    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(compute);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    compute(); // estado inicial — página restaurada já com scroll avançado
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return null;
}
