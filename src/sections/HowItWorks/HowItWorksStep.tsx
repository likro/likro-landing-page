"use client";

/**
 * HowItWorksStep — "use client" single step.
 *
 * Recebe step + index + isLast. useInView com threshold 0.3 dispara hero-card-rise
 * com animation-delay incremental (index * 80ms) — stagger cross-step.
 *
 * Layout:
 *   - Desktop (lg:): row [number | content + mini-mockup]
 *   - Mobile: col stacked (number em cima, conteúdo embaixo, mockup abaixo)
 * Connector vertical desktop-only entre steps (NÃO no último).
 *
 * D-20 micro-element: número grande font-mono text-7xl em accent-primary (roxo
 *   Likro) — único accent visual da seção, micro-elemento autorizado.
 * D-23: padding generoso (py-12 lg:py-16) — pace calmo, NÃO compete com Product.
 * NARR-06: useInView + CSS keyframes (hero-card-rise from globals.css), zero motion lib.
 */
import { useInView } from "@/hooks/use-in-view";
import type { HowStep } from "@/content/how-it-works";
import { HowItWorksMiniMockup } from "./HowItWorksMiniMockup";

interface HowItWorksStepProps {
  step: HowStep;
  index: number;
  isLast: boolean;
}

export function HowItWorksStep({ step, index, isLast }: HowItWorksStepProps) {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.3 });

  return (
    <div
      ref={ref}
      className={`relative flex flex-col gap-6 py-10 lg:flex-row lg:items-start lg:gap-12 lg:py-14 ${
        inView ? "hero-card-rise" : "opacity-0"
      }`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="w-24 shrink-0 lg:w-32">
        <div className="font-mono text-5xl leading-none tracking-tight text-accent-primary lg:text-7xl">
          {step.number}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
        <div className="flex-1">
          <h3 className="text-balance text-xl font-semibold leading-[1.25] tracking-[-0.015em] text-text-primary lg:text-2xl">
            {step.headline}
          </h3>
          <p className="mt-2 max-w-md text-base leading-[1.55] text-text-secondary">
            {step.description}
          </p>
        </div>
        <div className="shrink-0">
          <HowItWorksMiniMockup kind={step.mockupKind} />
        </div>
      </div>
      {/* Vertical connector — desktop only, NOT on last step. */}
      {!isLast && (
        <div
          aria-hidden="true"
          className="absolute left-12 top-20 hidden h-full w-px bg-neutral-200 lg:block"
        />
      )}
    </div>
  );
}
