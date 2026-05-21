/**
 * HeroCopy — H1 + sub + ctaPrimary (WhatsApp) + ctaSecondary (anchor) + trust.
 *
 * Refinamento de arte:
 *   - headline 4xl→6xl (não 7xl), tighter tracking -0.025em, leading 1.04 — mais cabe
 *     em 2 linhas, peso visual maior por densidade (não tamanho bruto)
 *   - sub max-w-xl com leading relaxed mas tracking -0.005em
 *   - trust signal em uppercase mini com tracking generoso (small caps editorial)
 *   - CTA secundário tem hover sutil
 *
 * HERO-02: zero entrada animada via JS. Reveal cinematográfico é CSS-only.
 * COPY-01: tudo via HERO_COPY (src/content/hero.ts).
 */
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";
import { HERO_COPY } from "@/content/hero";

export function HeroCopy() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <h1
        id="hero-headline"
        className="hero-headline-reveal text-balance font-sans text-[2.5rem] font-semibold leading-[1.04] tracking-[-0.025em] text-text-on-dark-primary sm:text-5xl lg:text-[3.75rem] xl:text-[4.25rem]"
      >
        {HERO_COPY.h1}
      </h1>
      <p className="mt-6 max-w-xl text-balance text-base leading-[1.6] tracking-[-0.005em] text-text-on-dark-secondary sm:text-lg lg:text-[1.125rem]">
        {HERO_COPY.sub}
      </p>
      <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row">
        <WhatsAppCta
          variant="primary"
          location="hero"
          className="h-11 rounded-[10px] px-[18px] text-[14px] font-semibold tracking-[-0.005em] shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_8px_24px_-6px_rgba(124,58,237,0.55),0_2px_8px_-2px_rgba(124,58,237,0.45)] hover:shadow-[0_1px_0_rgba(255,255,255,0.22)_inset,0_12px_30px_-8px_rgba(124,58,237,0.7),0_3px_10px_-2px_rgba(124,58,237,0.5)]"
        >
          {HERO_COPY.ctaPrimary.label}
        </WhatsAppCta>
        <Link
          href={HERO_COPY.ctaSecondary.href}
          className="group inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-text-on-dark-secondary transition-colors hover:text-text-on-dark-primary active:text-text-on-dark-primary max-md:min-h-[44px]"
        >
          {HERO_COPY.ctaSecondary.label}
          <ArrowRight
            aria-hidden="true"
            className="size-3.5 transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      </div>
      <p className="mt-10 text-[11px] font-medium uppercase tracking-[0.18em] text-text-on-dark-muted">
        {HERO_COPY.trust}
      </p>
    </div>
  );
}
