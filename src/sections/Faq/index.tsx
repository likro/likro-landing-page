/**
 * FAQ — objeções de clínica respondidas antes do CTA final (Form).
 *
 * RSC puro, zero motion lib (espírito NARR-06): acordeão via <details>/<summary>
 * NATIVO — acessível (teclado + leitor de tela), progressive enhancement, zero JS.
 * O ícone "+" gira pra "×" via `group-open` (CSS only). surface clara com border-t
 * (mesmo padrão de separação das outras seções claras). COPY-01: copy de FAQ_COPY.
 */
import { Container } from "@/components/ui/container";
import { FAQ_COPY } from "@/content/faq";

export function Faq() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="relative isolate overflow-hidden border-t border-[rgba(2,6,23,0.07)] bg-[#E8EDF4] py-24 lg:py-32"
    >
      <Container className="max-w-3xl">
        <div className="text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-text-muted">
            {FAQ_COPY.eyebrow}
          </p>
          <h2
            id="faq-heading"
            className="mx-auto mt-4 max-w-2xl text-balance text-3xl font-semibold leading-[1.15] tracking-[-0.02em] text-text-primary sm:text-4xl"
          >
            {FAQ_COPY.heading}
          </h2>
        </div>

        <div className="mt-12 border-y border-[rgba(2,6,23,0.08)] lg:mt-16">
          {FAQ_COPY.items.map((item, i) => (
            <details
              key={item.q}
              className={`group ${i > 0 ? "border-t border-[rgba(2,6,23,0.08)]" : ""}`}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left text-lg font-medium tracking-[-0.01em] text-text-primary [&::-webkit-details-marker]:hidden">
                {item.q}
                <span
                  aria-hidden="true"
                  className="shrink-0 text-2xl font-normal leading-none text-text-muted transition-transform duration-200 group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="-mt-1 max-w-2xl pb-5 pr-8 text-base leading-[1.6] text-text-secondary">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
