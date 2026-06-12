import type { ReactNode } from "react";
import { assertDevAccess } from "../dev/_components/dev-gate";

/**
 * /preview/layout — Server Component que aplica o mesmo gate D-15 do /dev.
 *
 * /preview é o protótipo exploratório do redesign premium do Hero
 * (project-premium-redesign-direction). NÃO deve aparecer em produção:
 *   - localhost dev / Vercel preview → libera
 *   - Vercel produção → 404
 *
 * page.tsx é client (render prop do ScrollScene + canvas), então o gate
 * precisa morar no layout server, que roda antes da page.
 */
export default function PreviewLayout({ children }: { children: ReactNode }) {
  assertDevAccess();
  return <>{children}</>;
}
