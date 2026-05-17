/**
 * Header — institucional minimalista, slim.
 *
 * Refinamento: h-14 lg:h-16 (mais slim que h-16/h-20 anterior), logo mais discreto,
 * CTA secundário ghost com hover sutil, separador 1px com fade radial nas bordas.
 *
 * D-12: logo + 1 CTA secundário, MUITO respiro. SEM hide-on-scroll, SEM mobile menu.
 */
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";
import { HERO_COPY } from "@/content/hero";

export function Header() {
  return (
    <header className="relative z-20 w-full">
      <Container className="flex h-14 items-center justify-between lg:h-16">
        <Link
          href="/"
          aria-label="Likro - página inicial"
          className="group inline-flex items-center gap-2 text-text-on-dark-primary"
        >
          {/* Logo placeholder em texto — substituir por SVG quando asset final chegar */}
          <span
            aria-hidden="true"
            className="grid size-7 place-items-center rounded-[7px] bg-gradient-to-br from-violet-500 to-violet-700 text-[13px] font-bold text-white shadow-[0_0_0_1px_rgba(124,58,237,0.4),0_4px_12px_-2px_rgba(124,58,237,0.5)]"
          >
            L
          </span>
          <span className="text-[15px] font-semibold tracking-[-0.01em] lg:text-base">
            Likro
          </span>
        </Link>
        <WhatsAppCta variant="secondary" location="header">
          {HERO_COPY.ctaPrimary.label}
        </WhatsAppCta>
      </Container>
    </header>
  );
}
