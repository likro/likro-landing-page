/**
 * Sucesso inline — substitui o form no DOM ao 200 ok:true.
 * Sem redirect (CTA-11). Inclui fallback WhatsApp como CTA secundário.
 */
import { FORM_COPY } from "@/content/form";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";

export function FormSuccess() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-2xl border border-border-subtle bg-surface-card p-8 text-center md:p-10"
    >
      <h3 className="text-2xl font-semibold tracking-tight text-text-primary md:text-3xl">
        {FORM_COPY.success.heading}
      </h3>
      <p className="mx-auto mt-3 max-w-md text-balance text-base text-text-secondary">
        {FORM_COPY.success.body}
      </p>
      <div className="mt-6 flex justify-center">
        <WhatsAppCta variant="secondary" location="proof">
          {FORM_COPY.success.secondaryCtaLabel}
        </WhatsAppCta>
      </div>
    </div>
  );
}
