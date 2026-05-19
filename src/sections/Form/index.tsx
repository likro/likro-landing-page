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
 */
import { Container } from "@/components/ui/container";
import { FORM_COPY } from "@/content/form";
import { LeadForm } from "./LeadForm";

export function Form() {
  return (
    <section
      id={FORM_COPY.sectionId}
      data-clarity-mask="true"
      className="bg-surface-light py-20 md:py-28"
      aria-labelledby="lead-form-heading"
    >
      <Container className="max-w-2xl">
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
