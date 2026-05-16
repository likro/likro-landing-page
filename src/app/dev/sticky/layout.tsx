import type { ReactNode } from "react";
import { assertDevAccess } from "../_components/dev-gate";

/**
 * /dev/sticky/layout — Server Component que aplica o gate D-15.
 *
 * Consistente com o pattern de /dev/scene e /dev/all (layout server +
 * page eventualmente client). page.tsx desta rota é server hoje (sticky
 * é CSS puro), mas o gate em layout mantém uniformidade arquitetural.
 */
export default function DevStickyLayout({ children }: { children: ReactNode }) {
  assertDevAccess();
  return <>{children}</>;
}
