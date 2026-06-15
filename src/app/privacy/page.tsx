/**
 * Placeholder de política de privacidade.
 *
 * Phase 5 só linka este arquivo via footer; o conteúdo real será escrito na
 * Phase 7 (com revisão jurídica antes do go-live oficial — está no PROJECT.md).
 *
 * robots: noindex/nofollow — placeholder não deve ser indexado.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Política de privacidade · Likro",
  description:
    "Em construção. A versão completa será publicada antes do lançamento oficial.",
  robots: { index: false, follow: false },
};

export default function PrivacyPage() {
  return (
    <main className="bg-surface-light py-20 md:py-28">
      <Container className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary md:text-4xl">
          Política de privacidade
        </h1>
        <p className="mt-4 text-base text-text-secondary md:text-lg">
          Em construção. A versão completa será publicada antes do lançamento
          oficial. Enquanto isso, os dados enviados pelo formulário ficam apenas
          com a Likro, sem terceiros, sem listas, sem spam.
        </p>
        <p className="mt-6 text-sm text-text-secondary">
          <Link
            href="/"
            className="underline underline-offset-2 hover:text-text-primary"
          >
            Voltar para a página inicial
          </Link>
        </p>
      </Container>
    </main>
  );
}
