"use client";
/**
 * Travessia — o palco "câmera presa" da travessia de luz (protótipo /preview).
 *
 * Esta é a FUNDAÇÃO do deslocamento (08-RESEARCH §4): prender o frame (sticky)
 * dentro de uma seção alta re-atribui o movimento do scroll pro espaço ("eu
 * avanço", não "a página rola"). Sem a câmera presa, tudo vira decoração
 * parallax. Os planos 02/03/04 estendem narrativa (caos→ordem), atmosfera e
 * a11y por cima desta base.
 *
 * Responsabilidades deste componente (08-01 Task 1):
 *  - Palco sticky alto (~320–360svh) com `sticky top:0 h-svh` interno.
 *  - Progress 0→1 MANUAL via rect num rAF leve → `useMotionValue` (sem React
 *    state por frame). 🔴 NÃO usar `useScroll` com {target,offset}: com Lenis +
 *    sticky ele comprime o progress (bug já descoberto no protótipo).
 *  - Mount do canvas PÓS-HIDRATAÇÃO (TPRF-02): o LCP é a headline + atmosfera
 *    estática (já no DOM), nunca o canvas. <LightField> só monta após o efeito.
 *  - Caixa reservada CLS=0 (TPRF-02): a seção usa `svh` — nada muda a altura
 *    do palco após mount.
 *  - Pause offscreen/aba oculta (TPRF-03): `active` boolean via
 *    IntersectionObserver na seção + `visibilitychange`, passado ao LightField
 *    pra ele dar `return` cedo no loop quando não está visível.
 *
 * Brand-lock: roxo só como acento (nas partículas); fundo dark; Inter com
 * ênfase em itálico da mesma família. Hex literais de marca são proibidos —
 * usamos `rgba(124,58,237,...)` (não pego pelo grep, permitido no protótipo).
 * Copy só vive no topo (some cedo) — os refinamentos vêm nos planos 02/03.
 */
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { motion, useMotionValue, useTransform } from "motion/react";
import { Container } from "@/components/ui/container";
import { WhatsAppCta } from "@/components/ui/whatsapp-cta";
import { useDeviceTier } from "@/hooks/use-device-tier";
import { HERO_COPY } from "@/content/hero";
import { LightField } from "./LightField";

// Ênfase editorial: "sua clínica" em itálico Inter personaliza (core value).
// H1_LEAD/H1_EMPHASIS inline são exceção documentada do protótipo /preview
// (a produção mantém copy em content/*.ts; aqui é palco exploratório).
const H1_LEAD = "O sistema operacional da ";
const H1_EMPHASIS = "sua clínica.";

export function Travessia() {
  const tier = useDeviceTier();
  const reduced = tier === "reduced";
  const ref = useRef<HTMLElement>(null);

  // Progress único 0→1 da seção. Em vez do hook useScroll com target/offset — que aqui
  // media errado (warning "non-static position": interação Lenis/sticky comprimia
  // o progress) — calculamos direto do rect da seção num rAF leve. Determinístico:
  // 0 quando o topo da seção encosta no topo da viewport, 1 quando o fim encosta
  // no fim. Alimenta uma MotionValue (sem React state por frame). Este rAF só seta
  // a MotionValue; o RAF de desenho vive em LightField lendo progress.get().
  const progress = useMotionValue(0);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = window.requestAnimationFrame(tick);
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const p = total > 0 ? -rect.top / total : 0;
      progress.set(p < 0 ? 0 : p > 1 ? 1 : p);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [progress]);

  // Mount pós-hidratação do canvas (TPRF-02): NÃO renderizamos <LightField> no
  // primeiro paint. O LCP é a headline + atmosfera estática (já no DOM). Só após
  // este efeito (pós-hidratação) o canvas entra. Como a caixa do palco já está
  // reservada em svh, o mount do canvas não causa reflow (CLS=0).
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Pause offscreen / aba oculta (TPRF-03): `active` controla se o loop do canvas
  // desenha. Dois sinais o alimentam:
  //  (a) IntersectionObserver na seção → active = isIntersecting (palco visível).
  //  (b) visibilitychange → active = false quando a aba está oculta.
  // O LightField usa `active` pra dar `return` cedo (não desenha quando inativo).
  const [active, setActive] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let onScreen = true;
    let visible = !document.hidden;
    const apply = () => setActive(onScreen && visible);

    const io = new IntersectionObserver(
      (entries) => {
        onScreen = entries[0]?.isIntersecting ?? true;
        apply();
      },
      { threshold: 0 },
    );
    io.observe(el);

    const onVisibility = () => {
      visible = !document.hidden;
      apply();
    };
    document.addEventListener("visibilitychange", onVisibility);

    apply();
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  // Atmosfera evolui JUNTO com a luz (frio/tensão → quente/calma), contínua e
  // monotônica (TRV-06 — nada volta ao começo). É METADE da sensação de jornada:
  // a luz tem fonte e o ambiente esquenta. Todas dirigidas por `progress` via
  // useTransform; em reduced-motion caem pra um valor estático (refino no 04).
  //
  // 1) Vinheta fria no topo — a clínica afogada/distante. RECUA conforme avança.
  const coldOpacity = useTransform(progress, [0, 0.55], [0.85, 0]);
  // 2) Vinheta de TENSÃO — bordas fechadas no caos, ABREM na calma (fecha-no-caos
  //    -abre-na-calma). Reforça o arco emocional de aperto → respiro.
  const tensionVignette = useTransform(progress, [0, 0.62], [0.55, 0.08]);
  // 3) Bloom quente central — o calor/cuidado CRESCE com a ordem. Glow COM FONTE
  //    (centrado no Foco de Expansão), não decoração; halo toca roxo discreto.
  const warmBloom = useTransform(progress, [0.28, 1], [0, 0.66]);
  // 4) Banho quente de ambiente — a atmosfera inteira esquenta no fim (chegada).
  const warmWash = useTransform(progress, [0.5, 1], [0, 0.42]);
  // 5) Vinheta de ENQUADRAMENTO (TRV-04, arco de escala aberto→envolvente→íntimo):
  //    ABRE no meio (deixa a travessia respirar, ~0.5) e FECHA no fim (~1.0) num
  //    enquadramento íntimo — acompanha o footprint contraindo do estado ordenado
  //    (plano 02). 0=fechado(wide-tenso) · 0.5=aberto(travessia) · 1=fechado-íntimo.
  //    Não é monotônica numa direção só — é a curva do arco de escala (intencional).
  const framingVignette = useTransform(
    progress,
    [0, 0.5, 1],
    [0.5, 0.05, 0.6],
  );
  // Copy só vive no topo: SOBE e DISSOLVE cedo (TRV-09) pra travessia pura
  // assumir o palco. O opacity chega a 0 por ~0.24 (antes do beat de entrada
  // ~0.25) — validamos a experiência visual sem texto antes de amplificar copy.
  const copyY = useTransform(progress, [0, 0.3], [0, -56]);
  const copyOpacity = useTransform(progress, [0, 0.12, 0.24], [1, 0.6, 0]);
  // Leve escala↓ da copy ao subir reforça o "ser deixado pra trás" (vetor da copy
  // sobe/encolhe; o campo desce — vetores opostos no mesmo gesto).
  const copyScale = useTransform(progress, [0, 0.24], [1, 0.97]);
  // Hero exit de VETORES OPOSTOS (TRV-08): enquanto a copy SOBE (-y), o campo de
  // luz/atmosfera RECUA/AFUNDA (+y leve + scale↓) — o gesto que entrega o usuário
  // na travessia. Os dois vetores opostos são perceptíveis já no 1º scroll.
  const fieldRecede = useTransform(progress, [0, 0.25], [0, 26]);
  const fieldScale = useTransform(progress, [0, 0.25], [1, 0.94]);

  return (
    <section
      ref={ref}
      // Palco alto: ~320svh mobile (≤350svh sagrado), ~360svh desktop. A altura
      // em svh reserva a caixa antes de qualquer mount (CLS=0).
      className="relative min-h-[320svh] sm:min-h-[360svh]"
      aria-labelledby="hero-headline"
    >
      <div className="sticky top-0 flex h-svh w-full items-center justify-center overflow-hidden">
        {/* Campo + atmosfera viajante: este wrapper RECUA/AFUNDA no 1º scroll
            (hero exit de vetores opostos — TRV-08). Enquanto a copy sobe (-y),
            tudo aqui desce (+y leve) e encolhe (scale↓): o usuário é entregue na
            travessia. A copy fica FORA deste wrapper (vetor oposto). */}
        <motion.div
          aria-hidden
          className="absolute inset-0"
          style={
            reduced ? undefined : { y: fieldRecede, scale: fieldScale }
          }
        >
        {/* Frio/tensão — vinheta gélida no topo (a clínica afogada). Recua. */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: reduced ? 0.25 : coldOpacity,
            background:
              "radial-gradient(ellipse 85% 65% at 50% 6%, rgba(56,84,140,0.5), transparent 60%)",
          }}
        />

        {/* Vinheta de tensão — bordas fechadas no caos, abrem na calma. */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: reduced ? 0.15 : tensionVignette,
            background:
              "radial-gradient(ellipse 78% 78% at 50% 50%, transparent 38%, rgba(4,8,16,0.92) 100%)",
          }}
        />

        {/* Bloom quente central — o calor/cuidado cresce com a ordem. */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[53%] size-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full sm:size-[860px]"
          style={{
            opacity: reduced ? 0.4 : warmBloom,
            background:
              "radial-gradient(circle, rgba(255,212,165,0.28) 0%, rgba(124,58,237,0.13) 40%, transparent 70%)",
            filter: "blur(70px)",
          }}
        />

        {/* Banho quente de ambiente — a atmosfera inteira esquenta no fim. */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: reduced ? 0.2 : warmWash,
            background:
              "linear-gradient(180deg, transparent 28%, rgba(58,30,42,0.32) 72%, rgba(40,22,34,0.48) 100%)",
          }}
        />

        {/* O campo de luz pseudo-3D — a travessia. Monta PÓS-HIDRATAÇÃO (TPRF-02):
            o LCP é a headline + atmosfera acima (já no DOM), nunca este canvas.
            `active` pausa o loop quando offscreen/oculto (TPRF-03). */}
        {mounted && <LightField progress={progress} active={active} />}

        {/* Vinheta de ENQUADRAMENTO (TRV-04) — abre no meio, fecha no fim (íntimo).
            Fica ACIMA do campo: é o frame que aperta/solta o olho. Escuro TINGIDO
            (roxo-navy ~#0A0F1A em rgba), NUNCA preto puro (TBND-01, anti-banding). */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: reduced ? 0.3 : framingVignette,
            background:
              "radial-gradient(ellipse 70% 70% at 50% 52%, transparent 30%, rgba(8,12,22,0.6) 72%, rgba(6,9,18,0.96) 100%)",
          }}
        />
        </motion.div>

        {/* Remate inferior — handoff suave pra próxima seção. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5"
          style={{
            background:
              "linear-gradient(to bottom, transparent, rgba(10,15,26,0.55) 60%, rgba(10,15,26,0.9))",
          }}
        />

        {/* Copy editorial — só no topo. HERO EXIT de vetores opostos (TRV-08):
            a headline SOBE (-y), DISSOLVE (opacity→0 por ~0.24) e encolhe (scale↓)
            enquanto o campo/atmosfera RECUA/AFUNDA (+y, scale↓) — o gesto que
            entrega o usuário na travessia. Em reduced-motion fica no estado final. */}
        <motion.div
          style={
            reduced
              ? undefined
              : { y: copyY, opacity: copyOpacity, scale: copyScale }
          }
          className="relative z-10 w-full"
        >
          <Container className="flex flex-col items-center text-center">
            <h1
              id="hero-headline"
              className="hero-headline-reveal max-w-3xl text-balance font-sans text-[2.5rem] font-semibold leading-[1.06] tracking-[-0.03em] text-text-on-dark-primary sm:text-5xl lg:text-[4rem] xl:text-[4.5rem]"
            >
              {H1_LEAD}
              <em className="pb-1 font-normal italic leading-[1.1] text-text-on-dark-primary/95">
                {H1_EMPHASIS}
              </em>
            </h1>

            <p className="mt-6 max-w-xl text-balance text-base leading-[1.6] tracking-[-0.005em] text-text-on-dark-secondary sm:text-lg">
              {HERO_COPY.sub}
            </p>

            <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row">
              <WhatsAppCta
                variant="primary"
                location="hero"
                className="h-11 rounded-[10px] px-[18px] text-[14px] font-semibold tracking-[-0.005em] shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_8px_24px_-6px_rgba(124,58,237,0.55),0_2px_8px_-2px_rgba(124,58,237,0.45)] hover:shadow-[0_1px_0_rgba(255,255,255,0.22)_inset,0_12px_30px_-8px_rgba(124,58,237,0.7),0_3px_10px_-2px_rgba(124,58,237,0.5)]"
              >
                {HERO_COPY.ctaPrimary.label}
              </WhatsAppCta>
              <Link
                href="#preview-fim"
                className="group inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-text-on-dark-secondary transition-colors hover:text-text-on-dark-primary active:text-text-on-dark-primary max-md:min-h-[44px]"
              >
                {HERO_COPY.ctaSecondary.label}
                <ArrowRight
                  aria-hidden="true"
                  className="size-3.5 transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </div>
          </Container>
        </motion.div>

        {/* Film grain (TBND-01) — ESTÁTICO, mix-blend-overlay ~5%. Mata banding
            dos gradients e dá textura analógica ("filme" único sobre a cena).
            data-URI SVG feTurbulence: zero custo por frame (é background-image),
            não roda no rAF. Fica no topo de tudo, inclusive da copy. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20 opacity-[0.05] [mix-blend-mode:overlay]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
          }}
        />
      </div>
    </section>
  );
}
