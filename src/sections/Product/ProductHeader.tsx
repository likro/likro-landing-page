/**
 * ProductHeader — RSC. h2 + sub centrados.
 *
 * NARR-06: zero motion lib import. RSC puro.
 * id="product-headline" referenciado por aria-labelledby na section orchestrator.
 */
import { PRODUCT_COPY } from "@/content/product";

export function ProductHeader() {
  return (
    <header className="mx-auto max-w-3xl text-center">
      <h2
        id="product-headline"
        className="text-balance text-3xl font-semibold leading-[1.1] tracking-[-0.02em] text-text-primary sm:text-4xl lg:text-[2.75rem]"
      >
        {PRODUCT_COPY.header.h2}
      </h2>
      <p className="mx-auto mt-5 max-w-2xl text-balance text-base leading-[1.6] text-text-secondary sm:text-lg">
        {PRODUCT_COPY.header.sub}
      </p>
    </header>
  );
}
