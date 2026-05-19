/**
 * Erro inline — heading + retry button + fallback WhatsApp.
 */
import { FORM_COPY } from "@/content/form";
import { Button } from "@/components/ui/button";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";

interface Props {
  onRetry: () => void;
}

export function FormError({ onRetry }: Props) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-border-subtle bg-surface-card p-6 text-center md:p-8"
    >
      <h3 className="text-xl font-semibold tracking-tight text-text-primary">
        {FORM_COPY.error.heading}
      </h3>
      <p className="mx-auto mt-2 max-w-md text-balance text-sm text-text-secondary">
        {FORM_COPY.error.body}
      </p>
      <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button variant="default" onClick={onRetry}>
          {FORM_COPY.error.retryLabel}
        </Button>
        <WhatsAppCta variant="inline" location="proof">
          Falar agora no WhatsApp
        </WhatsAppCta>
      </div>
    </div>
  );
}
