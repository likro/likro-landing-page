/**
 * Footer — institucional enxuto (Phase 5).
 *
 * Dark editorial (continuidade da Proof — bg-surface-darker).
 * 1 linha desktop / 2 linhas mobile.
 * Logo + copyright + links sutis + 1 CTA WhatsApp.
 *
 * Política de privacidade aponta para /privacy (placeholder até Phase 7 escrever).
 * Itera sobre FOOTER_COPY.links e filtra entries com href "#" — o "#whatsapp"
 * é apenas marker semântico; o CTA real vem via <WhatsAppCta location="footer">.
 */
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";
import { FOOTER_COPY } from "@/content/footer";

export function Footer() {
  return (
    <footer className="bg-surface-darker py-10 text-text-on-dark-secondary md:py-12">
      <Container>
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center md:gap-8">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="grid size-7 place-items-center rounded-[7px] bg-gradient-to-br from-accent-primary to-accent-hover text-[13px] font-bold text-white shadow-[0_0_0_1px_rgba(124,58,237,0.4),0_4px_12px_-2px_rgba(124,58,237,0.5)]"
            >
              L
            </span>
            <span className="text-sm font-semibold tracking-[-0.01em] text-text-on-dark-primary">
              {FOOTER_COPY.brand}
            </span>
            <span
              aria-hidden="true"
              className="hidden h-4 w-px bg-border-on-dark-default md:inline-block"
            />
            <span className="text-xs text-text-on-dark-muted md:text-sm">
              {FOOTER_COPY.copyright}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {FOOTER_COPY.links
              .filter((l) => !l.href.startsWith("#"))
              .map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  rel={"rel" in link ? link.rel : undefined}
                  className="inline-flex items-center rounded-md text-sm text-text-on-dark-secondary transition-colors hover:text-text-on-dark-primary active:text-text-on-dark-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-darker max-md:min-h-[44px]"
                >
                  {link.label}
                </Link>
              ))}
            <WhatsAppCta variant="inline" location="footer">
              {FOOTER_COPY.whatsappCtaLabel}
            </WhatsAppCta>
          </div>
        </div>
      </Container>
    </footer>
  );
}
