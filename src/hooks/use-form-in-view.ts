"use client";

/**
 * useFormInView — observa o elemento DOM com id "lead-form-section"
 * (FORM_COPY.sectionId) via IntersectionObserver e retorna boolean.
 *
 * Phase 5 consumer: FloatingWhatsApp (Plan 06) usa para esconder quando o form está visível.
 *
 * Sem context: na v1 só há 1 consumer (FloatingWhatsApp) e 1 target (a section do form).
 * Cada consumer cria seu próprio observer — over-engineering criar provider compartilhado v1.
 */

import { useEffect, useState } from "react";
import { FORM_COPY } from "@/content/form";

interface Options {
  /** Override do target id. Default: FORM_COPY.sectionId */
  targetId?: string;
  /** Threshold do IntersectionObserver. Default: 0.1 (10% visible). */
  threshold?: number;
}

export function useFormInView({
  targetId = FORM_COPY.sectionId,
  threshold = 0.1,
}: Options = {}): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const el = document.getElementById(targetId);
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) setInView(entry.isIntersecting);
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [targetId, threshold]);

  return inView;
}
