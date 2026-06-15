/**
 * Section wrapper do lead form (Phase 5).
 *
 * Server component — renderiza eyebrow/heading/subheading SSR + delega o
 * LeadForm (client) por baixo. id="lead-form-section" para o
 * IntersectionObserver do FloatingWhatsApp (Plan 06) detectar.
 *
 * data-clarity-mask="true" no <section> wrapper — Microsoft Clarity NÃO grava
 * inputs/labels dentro deste container. PII protegida (TRACK-05).
 * Defense in depth: LeadForm já tem data-clarity-mask no root <form>;
 * o atributo aqui na <section> cobre eyebrow/heading/subheading e qualquer
 * markup futuro adjacente ao form.
 *
 * PERF-07: o LeadForm é a única ilha client com payload exclusivo pesado
 * (react-hook-form + zod + @hookform/resolvers, ~80KB parsed) e está
 * below-fold (última seção). É carregado via next/dynamic com `ssr: true`
 * — o HTML do form continua no SSR (SEO preservado), mas o chunk JS sai do
 * First Load JS e hidrata sob demanda. As demais seções são RSC: dynamic
 * nelas seria net-neutro (Pitfall 1), por isso não foi aplicado.
 */
import dynamic from "next/dynamic";
import { Container } from "@/components/ui/container";
import { FORM_COPY } from "@/content/form";

const LeadForm = dynamic(() => import("./LeadForm").then((m) => m.LeadForm), {
  ssr: true,
});

export function Form() {
  return (
    <section
      id={FORM_COPY.sectionId}
      data-clarity-mask="true"
      className="relative isolate overflow-hidden border-t border-[rgba(2,6,23,0.07)] bg-[#E9EEF5] py-20 md:py-28"
      aria-labelledby="lead-form-heading"
    >
      {/* Atmosfera de conversão (remix de cor): a seção mais "embaixo" ganha o
          tratamento mais rico — base cool um pouco mais funda (não branca) + glow
          VIOLETA suave atraindo o olho pro form/CTA. Brand-safe (roxo = acento, rgba). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 30%, rgba(124,58,237,0.13), transparent 68%)",
        }}
      />
      <Container className="relative max-w-2xl">
        <div className="mb-8 md:mb-10">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent-primary">
            {FORM_COPY.eyebrow}
          </p>
          <h2
            id="lead-form-heading"
            className="mt-3 text-balance text-3xl font-semibold tracking-tight text-text-primary md:text-4xl"
          >
            {FORM_COPY.heading}
          </h2>
          <p className="mt-3 text-balance text-base text-text-secondary md:text-lg">
            {FORM_COPY.subheading}
          </p>
        </div>
        <LeadForm />
      </Container>
    </section>
  );
}
