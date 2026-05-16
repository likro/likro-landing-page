import type { ReactNode } from "react";
import { assertDevAccess } from "../_components/dev-gate";

/**
 * /dev/all/layout — Server Component que aplica o gate D-15.
 *
 * page.tsx é client porque mistura ScrollScene + useTransform (exceção
 * controlada D-02 / MOTION-05) com outras primitivas. Layout server
 * roda antes da page client — gate executa em todas as requests.
 */
export default function DevAllLayout({ children }: { children: ReactNode }) {
  assertDevAccess();
  return <>{children}</>;
}
