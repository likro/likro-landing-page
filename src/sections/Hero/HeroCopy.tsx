/**
 * HeroCopy — RSC com Headline + sub + WhatsAppCta primary + trust signal.
 *
 * HERO-02: H1, sub, CTA e trust renderizam estado final imediato (zero fade-in).
 * COPY-01: toda string vem de HERO_COPY (src/content/hero.ts).
 * Lenny aprova variante mudando 1 linha em src/content/hero.ts (HERO_COPY = ...).
 */
import { Headline } from "@/components/ui/headline";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";
import { HERO_COPY } from "@/content/hero";

export function HeroCopy() {
  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <Headline
        as="h1"
        size="hero"
        id="hero-headline"
        className="text-text-on-dark-primary leading-[1.05]"
      >
        {HERO_COPY.h1}
      </Headline>
      <p className="max-w-xl text-xl leading-relaxed text-text-on-dark-secondary sm:text-2xl">
        {HERO_COPY.sub}
      </p>
      <div className="flex flex-col gap-3">
        <WhatsAppCta variant="primary" location="hero" className="w-fit">
          {HERO_COPY.ctaLabel}
        </WhatsAppCta>
        <p className="text-sm text-text-on-dark-muted">{HERO_COPY.trust}</p>
      </div>
    </div>
  );
}
