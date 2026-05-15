import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Headline } from "@/components/ui/headline";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";

/**
 * FOUND-12: rota interna de showcase. Em produção, retorna 404.
 *
 * `process.env.NODE_ENV` é estaticamente substituído por Webpack/SWC em
 * build (orchestrator directive #7), permitindo dead-code-elim do
 * conteúdo em prod — o JSX abaixo do if é removido do bundle.
 *
 * Esta é Server Component — sem "use client".
 */
export default function DevPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <main className="min-h-dvh bg-surface-light py-12">
      <Container>
        <Headline as="h1" size="hero">
          Likro · /dev
        </Headline>
        <p className="mt-2 text-text-muted">
          Showcase interno — disponível apenas em desenvolvimento.
        </p>

        <section className="mt-12 space-y-6">
          <Headline as="h2" size="section">
            Atoms · Buttons
          </Headline>
          <div className="flex flex-wrap gap-3">
            <Button>Default (primary)</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button disabled>Disabled</Button>
          </div>
        </section>

        <section className="mt-12 space-y-6">
          <Headline as="h2" size="section">
            Atoms · WhatsAppCta variants
          </Headline>
          <div className="flex flex-wrap gap-3">
            <WhatsAppCta variant="primary" location="hero" />
            <WhatsAppCta variant="secondary" location="pain" label="Tirar dúvida" />
            <WhatsAppCta variant="inline" location="footer" label="Falar no WhatsApp" />
          </div>
          {/* Floating fica em fixed bottom-right via CSS */}
          <WhatsAppCta variant="floating" location="floating" label="Abrir WhatsApp" />
        </section>

        <section className="mt-12 space-y-6">
          <Headline as="h2" size="section">
            Atoms · Card
          </Headline>
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Card title</CardTitle>
              <CardDescription>Subtítulo descritivo do card.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-secondary">
                Conteúdo do card. Linear+Stripe feel — border subtle, shadow sutil.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="mt-12 space-y-6">
          <Headline as="h2" size="section">
            Atoms · Input + Label
          </Headline>
          <div className="max-w-md space-y-3">
            <div>
              <Label htmlFor="dev-input">Nome</Label>
              <Input id="dev-input" placeholder="Seu nome" />
            </div>
          </div>
        </section>

        <section className="mt-12 space-y-6">
          <Headline as="h2" size="section">
            Motion Primitives (Phase 2)
          </Headline>
          <p className="text-text-muted">Será populado na Phase 2.</p>
        </section>

        <section className="mt-12 space-y-6">
          <Headline as="h2" size="section">
            Sections (Phase 3+)
          </Headline>
          <p className="text-text-muted">Será populado a partir da Phase 3.</p>
        </section>
      </Container>
    </main>
  );
}
