/**
 * ProductHeader — RSC. Header ASSIMÉTRICO em duas colunas, alinhado à ESQUERDA
 * (assinatura visual do Product — quebra o "tudo centralizado" das outras seções,
 * feedback Lenny 2026-06-14): h2 grande na coluna esquerda + sub na direita,
 * baseline alinhada embaixo (lg:items-end). Mobile empilha. O resto do Product
 * (feature split, secundárias) já é left-anchored — agora a seção inteira é coesa.
 *
 * NARR-06: zero motion lib import. RSC puro.
 * id="product-headline" referenciado por aria-labelledby na section orchestrator.
 */
import { PRODUCT_COPY } from "@/content/product";

export function ProductHeader() {
  return (
    <header className="grid grid-cols-1 gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-14">
      <h2
        id="product-headline"
        className="text-balance text-left text-3xl font-semibold leading-[1.08] tracking-[-0.02em] text-text-primary sm:text-4xl lg:text-[3rem]"
      >
        {PRODUCT_COPY.header.h2}
      </h2>
      <p className="max-w-md text-left text-base leading-[1.6] text-text-secondary sm:text-lg lg:pb-1.5">
        {PRODUCT_COPY.header.sub}
      </p>
    </header>
  );
}
