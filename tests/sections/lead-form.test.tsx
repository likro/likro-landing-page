/**
 * Cobertura: CTA-09 (3 campos + honeypot `website`), CTA-11 (disabled + success inline).
 * PII masking (data-clarity-mask) — preparação Phase 6.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LeadForm } from "@/sections/Form/LeadForm";
import { FORM_COPY } from "@/content/form";

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("<LeadForm>", () => {
  it("renderiza 3 campos visíveis + honeypot off-screen (name=website)", () => {
    render(<LeadForm />);
    expect(screen.getByLabelText(FORM_COPY.fields.name.label)).toBeInTheDocument();
    expect(screen.getByLabelText(FORM_COPY.fields.whatsapp.label)).toBeInTheDocument();
    expect(screen.getByLabelText(FORM_COPY.fields.message.label, { exact: false })).toBeInTheDocument();
    const honeypot = document.querySelector('input[name="website"]') as HTMLInputElement;
    expect(honeypot).not.toBeNull();
    expect(honeypot.getAttribute("tabindex")).toBe("-1");
    expect(honeypot.getAttribute("autocomplete")).toBe("off");
  });

  it("honeypot wrapper tem aria-hidden e está off-screen", () => {
    render(<LeadForm />);
    const honeypot = document.querySelector('input[name="website"]') as HTMLInputElement;
    const wrapper = honeypot.closest('[aria-hidden="true"]') as HTMLElement | null;
    expect(wrapper).not.toBeNull();
    // Off-screen via position:absolute;left:-9999px (Pattern 6 RESEARCH)
    if (wrapper) {
      expect(wrapper.style.position).toBe("absolute");
      expect(wrapper.style.left).toBe("-9999px");
    }
  });

  it("root wrapper tem data-clarity-mask=true", () => {
    const { container } = render(<LeadForm />);
    // Em isolation, o root element renderizado pelo LeadForm DEVE ter o atributo
    // (Plan 04 Task 3 garante via <form data-clarity-mask="true" ...> OU wrapper div).
    expect(container.querySelector('[data-clarity-mask="true"]')).not.toBeNull();
  });

  it("submete dados válidos via fetch POST /api/lead", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );
    const user = userEvent.setup();
    render(<LeadForm />);
    await user.type(screen.getByLabelText(FORM_COPY.fields.name.label), "Lenny");
    await user.type(screen.getByLabelText(FORM_COPY.fields.whatsapp.label), "11999999999");
    await user.click(screen.getByRole("button", { name: new RegExp(FORM_COPY.submit.idle, "i") }));
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/lead",
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  it("botão fica disabled durante submit", async () => {
    let resolve!: (v: Response) => void;
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise<Response>((r) => (resolve = r)),
    );
    const user = userEvent.setup();
    render(<LeadForm />);
    await user.type(screen.getByLabelText(FORM_COPY.fields.name.label), "Lenny");
    await user.type(screen.getByLabelText(FORM_COPY.fields.whatsapp.label), "11999999999");
    const btn = screen.getByRole("button", { name: new RegExp(FORM_COPY.submit.idle, "i") });
    await user.click(btn);
    await waitFor(() => expect(btn).toBeDisabled());
    resolve(new Response(JSON.stringify({ ok: true }), { status: 200 }));
  });

  it("após sucesso, mostra bloco com FORM_COPY.success.heading", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );
    const user = userEvent.setup();
    render(<LeadForm />);
    await user.type(screen.getByLabelText(FORM_COPY.fields.name.label), "Lenny");
    await user.type(screen.getByLabelText(FORM_COPY.fields.whatsapp.label), "11999999999");
    await user.click(screen.getByRole("button", { name: new RegExp(FORM_COPY.submit.idle, "i") }));
    await waitFor(() => {
      expect(screen.getByText(FORM_COPY.success.heading)).toBeInTheDocument();
    });
  });

  it("após 502, mostra bloco error com retry", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify({ ok: false, error: "delivery_failed" }), { status: 502 }),
    );
    const user = userEvent.setup();
    render(<LeadForm />);
    await user.type(screen.getByLabelText(FORM_COPY.fields.name.label), "Lenny");
    await user.type(screen.getByLabelText(FORM_COPY.fields.whatsapp.label), "11999999999");
    await user.click(screen.getByRole("button", { name: new RegExp(FORM_COPY.submit.idle, "i") }));
    await waitFor(() => {
      expect(screen.getByText(FORM_COPY.error.heading)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: new RegExp(FORM_COPY.error.retryLabel, "i") })).toBeInTheDocument();
    });
  });
});
