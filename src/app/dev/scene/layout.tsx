import type { ReactNode } from "react";
import { assertDevAccess } from "../_components/dev-gate";

/**
 * /dev/scene/layout — Server Component que aplica o gate D-15.
 *
 * Necessário porque page.tsx é client (demonstra render prop do ScrollScene
 * que recebe MotionValue<number>, exigindo `useTransform` no escopo do
 * componente — exceção controlada documentada no barrel motion/index.ts).
 *
 * Layout server roda antes da page client — gate executa em todas as
 * requests sem precisar de checks no client.
 */
export default function DevSceneLayout({ children }: { children: ReactNode }) {
  assertDevAccess();
  return <>{children}</>;
}
