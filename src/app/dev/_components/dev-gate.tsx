import "server-only";
import { notFound } from "next/navigation";

/**
 * Gate D-15 reutilizável (Phase 2 Plan 5).
 *
 * Extraído de src/app/dev/page.tsx (Plan 01) para reuso DRY em todas as
 * sub-rotas /dev/*. Mesma matriz de comportamento dos 4 cenários:
 *
 *   - localhost dev:        VERCEL_ENV=undefined, NODE_ENV=development → libera
 *   - localhost prod build: VERCEL_ENV=undefined, NODE_ENV=production  → 404
 *   - Vercel preview:       VERCEL_ENV=preview                          → libera
 *   - Vercel produção:      VERCEL_ENV=production                       → 404
 *
 * Server-only — força build error se importado em client component
 * (não há `process.env.VERCEL_ENV` no client).
 */
export function assertDevAccess(): void {
  if (
    process.env.VERCEL_ENV === "production" ||
    (process.env.VERCEL_ENV === undefined &&
      process.env.NODE_ENV === "production")
  ) {
    notFound();
  }
}
