import { Container } from "@/components/ui/container";
import { Headline } from "@/components/ui/headline";
import { StickyStage } from "@/components/motion";

/**
 * /dev/sticky — showcase isolado de <StickyStage> (Phase 2 Plan 05, D-13).
 *
 * Esta é a sub-rota MAIS CRÍTICA do plan — é onde o RISCO CRÍTICO #3
 * (smooth-scroll engine + sticky em iOS Safari) é validado em device
 * real. Gate D-15 aplicado via layout.tsx.
 *
 * NÃO usar Container ao redor dos StickyStage — Container tem max-w e
 * padding lateral; StickyStage precisa de full-width pra pin previsível.
 * Container só ao redor do header introdutório.
 */
export default function DevStickyPage() {
  return (
    <main className="min-h-svh bg-surface-light">
      <Container className="py-12">
        <Headline as="h1" size="hero">
          /dev/sticky
        </Headline>
        <p className="mt-2 text-text-muted max-w-2xl">
          <code>&lt;StickyStage&gt;</code> — pin via <code>position: sticky</code>{" "}
          CSS + viewport units estáveis (D-05..D-09). Zero coordenação com o
          smooth-scroll engine. Validação real-device é mandatória aqui —
          abra esta URL no iPhone/Android real.
        </p>
        <ul className="mt-4 text-sm text-text-muted list-disc list-inside space-y-1">
          <li>Stage deve permanecer pinado durante toda a extensão de <code>length</code></li>
          <li>SEM release prematuro</li>
          <li>SEM jump horizontal</li>
          <li>iOS: SEM address bar pulando o conteúdo</li>
          <li>Reduced motion: estrutura sticky deve permanecer (D-09)</li>
        </ul>
      </Container>

      {/* Spacer antes do primeiro stage pra forçar scroll */}
      <div className="h-svh grid place-items-center text-text-muted">
        <span>↓ scrolla pra ver o pin ↓</span>
      </div>

      {/* Stage 1: 2 viewports pinados */}
      <StickyStage length="200svh">
        <div className="h-full w-full bg-surface-dark text-text-on-dark-primary grid place-items-center">
          <div className="text-center space-y-2 px-6">
            <div className="text-4xl font-medium tracking-tight">Stage A</div>
            <div className="text-sm uppercase tracking-wider opacity-70">
              length=&quot;200svh&quot; · 2 viewports pinned
            </div>
          </div>
        </div>
      </StickyStage>

      {/* Spacer entre stages */}
      <div className="h-svh grid place-items-center text-text-muted">
        <span>↓ próximo stage ↓</span>
      </div>

      {/* Stage 2: 4 viewports (semelhante a Product 4 pilares) */}
      <StickyStage length="400svh">
        <div className="h-full w-full bg-neutral-100 grid place-items-center">
          <div className="text-center space-y-2 px-6">
            <div className="text-4xl font-medium tracking-tight text-text-primary">
              Stage B
            </div>
            <div className="text-sm uppercase tracking-wider opacity-70 text-text-secondary">
              length=&quot;400svh&quot; · 4 viewports pinned (Product-like)
            </div>
          </div>
        </div>
      </StickyStage>

      {/* Spacer final pra confirmar release */}
      <div className="h-svh grid place-items-center text-text-muted">
        <span>após Stage B — release confirmado</span>
      </div>
    </main>
  );
}
