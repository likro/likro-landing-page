"use client";
import { MotionConfig } from "motion/react";
import type { PropsWithChildren } from "react";

/**
 * RESEARCH §Pattern 3 — MotionConfig com reducedMotion="user".
 * Faz com que TODAS as <motion.*> primitives respeitem prefers-reduced-motion
 * do OS sem cada componente precisar checar manualmente. (D-04)
 */
export function MotionConfigProvider({ children }: PropsWithChildren) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
