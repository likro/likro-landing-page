"use client";

/**
 * /dev/scene — showcase isolado de <ScrollScene> (Phase 2 Plan 05, D-13).
 *
 * Esta page é client porque demonstra o render prop do ScrollScene, que
 * recebe MotionValue<number>. Em código de produção, esta é a EXCEÇÃO
 * controlada documentada no barrel motion/index.ts (MOTION-05 + D-02):
 * dentro do render prop, importar `useTransform`/`motion` direto de
 * "motion/react" é permitido pra derivar sub-ranges do progress.
 *
 * Gate D-15 aplicado via /dev/scene/layout.tsx (Server Component).
 */

import { useTransform, motion } from "motion/react";
import { ScrollScene } from "@/components/motion";
import { Container } from "@/components/ui/container";
import { Headline } from "@/components/ui/headline";
import { PlaceholderBlock } from "../_components/placeholder-block";

export default function DevScenePage() {
  return (
    <main className="min-h-dvh bg-surface-light py-12">
      <Container>
        <Headline as="h1" size="hero">
          /dev/scene
        </Headline>
        <p className="mt-2 text-text-muted">
          <code>&lt;ScrollScene&gt;</code> — render prop recebe MotionValue&lt;number&gt; 0→1.
          Caller deriva sub-ranges via <code>useTransform</code> (exceção
          controlada — D-02, MOTION-05).
        </p>

        <div className="h-svh" />

        <ScrollScene className="my-24">
          {(progress) => {
            // useTransform dentro do render prop é a EXCEÇÃO controlada
            // documentada no barrel motion/index.ts (D-02, MOTION-05). O
            // render prop é executado no scope do componente client React,
            // mas ESLint não consegue inferir isso estaticamente.
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const opacity = useTransform(
              progress,
              [0, 0.3, 0.7, 1],
              [0, 1, 1, 0.2],
            );
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const y = useTransform(progress, [0, 1], [40, -40]);
            return (
              <motion.div style={{ opacity, y }}>
                <PlaceholderBlock
                  label="Scene"
                  caption="opacity & y derived from progress 0→1"
                  size="xl"
                  tone="dark"
                />
              </motion.div>
            );
          }}
        </ScrollScene>

        <div className="h-svh" />
      </Container>
    </main>
  );
}
