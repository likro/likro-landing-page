/**
 * Header — RSC institucional minimalista.
 *
 * D-12: logo + 1 CTA secundário, MUITO respiro.
 *   SEM hide-on-scroll, SEM mobile menu (Phase 5 owns MOBILE-06).
 *   Não compete com o hero.
 * HERO-04: logo é <img> direto (não next/image) — preserva o slot priority único.
 */
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";
import { HERO_COPY } from "@/content/hero";

export function Header() {
  return (
    <header className="relative z-20 w-full">
      <Container className="flex h-16 items-center justify-between lg:h-20">
        <Link href="/" aria-label="Likro - página inicial" className="inline-flex">
          {/* Logo inline <img> — preserva slot priority único do hero mockup */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logos/likro-logo.svg"
            alt="Likro"
            className="h-7 w-auto lg:h-8"
            width={120}
            height={32}
          />
        </Link>
        <WhatsAppCta variant="secondary" location="header">
          {HERO_COPY.ctaLabel}
        </WhatsAppCta>
      </Container>
    </header>
  );
}
