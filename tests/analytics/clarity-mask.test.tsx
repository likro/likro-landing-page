/**
 * Phase 6 — Wave 0 spec — PII masking (`data-clarity-mask`).
 *
 * Cobre TRACK-05 Parte A: verifica por render que os atributos
 * `data-clarity-mask="true"` entregues na Phase 5 estão presentes no wrapper
 * <section> do Form e no <form> root do LeadForm — Microsoft Clarity NÃO grava
 * inputs/labels dentro de containers mascarados (PII protegida).
 *
 * Diferente das Tasks 1 e 2 (RED por módulo ausente), este é um teste de
 * regressão: deve passar GREEN imediatamente porque os atributos já existem
 * (Phase 5 — Form/index.tsx e LeadForm.tsx). Se algum atributo faltar, o teste
 * fica RED e Plan 06-02 corrige.
 */
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Form } from "@/sections/Form";
import { LeadForm } from "@/sections/Form/LeadForm";
import { FORM_COPY } from "@/content/form";

describe("data-clarity-mask — Phase 6 PII masking (TRACK-05 Parte A)", () => {
  it("Form section wrapper tem data-clarity-mask=true", () => {
    const { container } = render(<Form />);
    const section = container.querySelector(
      `section#${FORM_COPY.sectionId}`,
    );
    expect(section).not.toBeNull();
    expect(section).toHaveAttribute("data-clarity-mask", "true");
  });

  it("o <form> do LeadForm tem data-clarity-mask=true", () => {
    const { container } = render(<LeadForm />);
    const form = container.querySelector("form");
    expect(form).not.toBeNull();
    expect(form).toHaveAttribute("data-clarity-mask", "true");
  });

  it("inputs de nome e WhatsApp estao dentro do container mascarado", () => {
    const { container } = render(<Form />);
    const maskedNode = container.querySelector('[data-clarity-mask="true"]');
    expect(maskedNode).not.toBeNull();

    const nameInput = container.querySelector("#lead-name");
    const whatsappInput = container.querySelector("#lead-whatsapp");
    expect(nameInput).not.toBeNull();
    expect(whatsappInput).not.toBeNull();

    expect(maskedNode!.contains(nameInput)).toBe(true);
    expect(maskedNode!.contains(whatsappInput)).toBe(true);
  });
});
