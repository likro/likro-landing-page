/**
 * FunnelColumn — uma coluna do board Kanban (Plan 09-02 Task 1, estático).
 *
 * Três estados (UI-SPEC §Color):
 *  - resting : fill funnel-column, borda funnel-column-line, head muted.
 *  - active  : highlight NEUTRO (sem roxo — D-3/UI-SPEC) — borda branca 0.18,
 *              head primary, dot secondary.
 *  - win     : clímax ROXO (a única coluna que ganha roxo) — borda/glow/fill
 *              violeta via rgba (escape-hatch brand-lock, igual Hero/Bridge).
 *
 * O `head` vem de FUNNEL_COPY.steps[i].head (COPY-01 — nada inline). Sem motion
 * aqui: a troca de estado é dirigida pelo FunnelBoard (Task 2) via prop `state`.
 */
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type FunnelColumnState = "resting" | "active" | "win";

type FunnelColumnProps = {
  head: string;
  state: FunnelColumnState;
  children?: ReactNode;
};

export function FunnelColumn({ head, state, children }: FunnelColumnProps) {
  const isActive = state === "active";
  const isWin = state === "win";

  return (
    <div
      className={cn(
        "relative flex min-h-0 flex-col gap-3 rounded-[14px] border p-4",
        "transition-[border-color,background,box-shadow] duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)]",
        // resting baseline
        "border-funnel-column-line bg-funnel-column",
        // active = neutral lift (NO purple)
        isActive && "border-[rgba(255,255,255,0.18)]",
        // win = purple climax ONLY here
        isWin &&
          "border-[rgba(124,58,237,0.85)] bg-[linear-gradient(180deg,rgba(124,58,237,0.14),rgba(124,58,237,0.03))] shadow-[0_0_0_1px_rgba(124,58,237,0.25),0_24px_60px_-20px_rgba(124,58,237,0.55)]",
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2 text-[14px] font-medium leading-[1.2] tracking-[0.02em] max-[639px]:text-[11px]",
          isActive || isWin
            ? "text-text-on-dark-primary"
            : "text-text-on-dark-muted",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "size-[7px] shrink-0 rounded-full bg-[#4a4d5e]",
            isActive && "bg-text-on-dark-secondary",
            isWin &&
              "bg-[#9d6bf0] shadow-[0_0_10px_rgba(124,58,237,0.9)]",
          )}
        />
        {head}
      </div>
      {children}
    </div>
  );
}
