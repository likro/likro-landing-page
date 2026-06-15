"use client";
/**
 * Hero — "A Travessia da Luz" (redesign v2.0, milestone Hero Premium).
 *
 * O Hero é um palco "câmera presa": uma matéria de luz pseudo-3D que o usuário
 * ATRAVESSA ao scrollar (held camera + optic flow), evoluindo caos → jornada →
 * ordem. Não é uma forma, não são slides — é uma única matéria se transformando.
 * Referência sentida: Cairn (o ambiente evolui porque você avança).
 *
 * Princípio narrativo (felt-semantics): a LUZ carrega o significado comercial
 * (conversas espalhadas, esfriando, vazando → costuradas → unificadas → chegada);
 * a copy só CRISTALIZA depois, nunca lidera. O topo diz O QUE a Likro é; a
 * travessia faz SENTIR o caos; a chegada NOMEIA a captura.
 *
 * Arquitetura (08-RESEARCH §4):
 *  - Palco sticky alto (~200–220svh) com `sticky top:0 h-svh` interno. Prender o
 *    frame re-atribui o scroll ao espaço ("eu avanço", não "a página rola").
 *  - Progress 0→1 MANUAL via rect num rAF leve → `useMotionValue` (sem React
 *    state por frame). 🔴 NÃO usar `useScroll` com {target,offset}: com Lenis +
 *    sticky ele comprime o progress (bug descoberto no protótipo).
 *  - Mount do canvas PÓS-HIDRATAÇÃO (HERO-04/LCP): o LCP é a headline + atmosfera
 *    estática (já no DOM SSR), NUNCA o canvas. <LightField> só monta após o efeito.
 *  - Caixa reservada CLS=0: a seção usa `svh` — nada muda a altura após mount.
 *  - Pause offscreen/aba oculta: `active` via IntersectionObserver + visibilitychange.
 *
 * Brand-lock: roxo só como acento (partículas); fundo dark; Inter com ênfase em
 * itálico. Hex literais de marca são proibidos — usamos `rgba(124,58,237,...)`.
 * COPY-01: toda copy vem de content/hero.ts (HERO_COPY) — zero string inline.
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

export function Hero() {
  const tier = useDeviceTier();
  const reduced = tier === "reduced";
  const ref = useRef<HTMLElement>(null);
  // Espelha `active` num ref pro rAF de progress pular o trabalho (forced reflow)
  // quando o palco está offscreen/aba oculta — sem recriar o loop por mudança de state.
  const activeRef = useRef(true);

  // Progress único 0→1 da seção. Em vez do hook useScroll com target/offset — que aqui
  // media errado (warning "non-static position": interação Lenis/sticky comprimia
  // o progress) — calculamos direto do rect da seção num rAF leve. Determinístico:
  // 0 quando o topo da seção encosta no topo da viewport, 1 quando o fim encosta
  // no fim. Alimenta uma MotionValue (sem React state por frame). Este rAF só seta
  // a MotionValue; o RAF de desenho vive em LightField lendo progress.get().
  const progress = useMotionValue(0);
  useEffect(() => {
    let raf = 0;
    // Offset absoluto do topo da seção + altura rolável, CACHEADOS. Antes o tick
    // chamava getBoundingClientRect() TODA frame → forced reflow ~60x/s somado ao
    // RAF de desenho do canvas = micro-stutter (o "travado" residual, p95). Agora o
    // rect é medido só no mount/resize/load; a frame lê só window.scrollY (barato,
    // não força layout). A caixa do Hero é reservada em svh (CLS=0), então baseTop
    // é estável e não precisa re-medir por frame.
    let baseTop = 0;
    let total = 0;
    const measure = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      baseTop = rect.top + window.scrollY;
      total = el.offsetHeight - window.innerHeight;
    };
    // Shaping de PLATÔS (entrada/saída): segura o CAOS no começo (até A) e a
    // CHEGADA no fim (a partir de B, vira 1 e FICA), com a travessia concentrada
    // no meio via smoothstep. Efeito: parar um pouco antes/depois ainda mostra um
    // estado COMPLETO e intencional (caos pleno ou chegada plena), nunca um morph
    // cortado. (Lenny: "mais planejado/cinematográfico, não dependente do scroll bruto".)
    const A = 0.08;
    const B = 0.8;
    const shape = (p: number) => {
      if (p <= A) return 0;
      if (p >= B) return 1;
      const t = (p - A) / (B - A);
      return t * t * (3 - 2 * t); // smoothstep
    };
    const tick = () => {
      raf = window.requestAnimationFrame(tick);
      if (!activeRef.current || total <= 0) return;
      const raw = (window.scrollY - baseTop) / total;
      const target = shape(raw < 0 ? 0 : raw > 1 ? 1 : raw);
      // Damped follower: a cena é GUIADA PELA ANIMAÇÃO (ease por frame em direção ao
      // alvo), não pelo scroll bruto. Suaviza o jitter do scroll, faz a transição
      // parecer conduzida/planejada e ASSENTA SUAVE ao parar (não trava no ponto cru).
      const cur = progress.get();
      const next = cur + (target - cur) * 0.12;
      progress.set(Math.abs(next - target) < 0.0004 ? target : next);
    };
    measure();
    window.addEventListener("resize", measure, { passive: true });
    window.addEventListener("load", measure);
    raf = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
      window.removeEventListener("load", measure);
    };
  }, [progress]);

  // Mount pós-hidratação do canvas (LCP): NÃO renderizamos <LightField> no
  // primeiro paint. O LCP é a headline + atmosfera estática (já no DOM). Só após
  // este efeito (pós-hidratação) o canvas entra. Como a caixa do palco já está
  // reservada em svh, o mount do canvas não causa reflow (CLS=0).
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Pause offscreen / aba oculta: `active` controla se o loop do canvas desenha.
  // Dois sinais o alimentam:
  //  (a) IntersectionObserver na seção → active = isIntersecting (palco visível).
  //  (b) visibilitychange → active = false quando a aba está oculta.
  // O LightField usa `active` pra dar `return` cedo (não desenha quando inativo).
  const [active, setActive] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let onScreen = true;
    let visible = !document.hidden;
    const apply = () => {
      const next = onScreen && visible;
      activeRef.current = next; // espelho síncrono pro rAF de progress
      setActive(next); // re-render pro LightField (prop `active`)
    };

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
  // monotônica (nada volta ao começo). É METADE da sensação de jornada: a luz tem
  // fonte e o ambiente esquenta. Todas dirigidas por `progress` via useTransform;
  // em reduced-motion caem pra valores ESTÁTICOS do estado-DEPOIS (ordenado/quente
  // /íntimo) — coerente com o LightField estático desenhando o end-state.
  //
  // 1) Vinheta fria no topo — a clínica afogada/distante. RECUA conforme avança.
  const coldOpacity = useTransform(progress, [0, 0.55], [0.08, 0]);
  // 2) Vinheta de TENSÃO — bordas fechadas no caos, ABREM na calma. Reforça o
  //    arco emocional de aperto → respiro.
  const tensionVignette = useTransform(progress, [0, 0.62], [0.26, 0.05]);
  // 3) Bloom quente central — o calor/cuidado CRESCE com a ordem. Glow COM FONTE
  //    (centrado no Foco de Expansão), não decoração; halo toca roxo discreto.
  const warmBloom = useTransform(progress, [0.28, 1], [0, 0.66]);
  // 4) Banho quente de ambiente — a atmosfera inteira esquenta no fim (chegada).
  const warmWash = useTransform(progress, [0.5, 1], [0, 0.42]);
  // 5) Vinheta de ENQUADRAMENTO: ABRE cedo e FICA ABERTA (regra 1: o campo NÃO
  //    pode comprimir/perder ocupação ao scrollar). A intimidade da chegada vem do
  //    calor/roxo/calma, NÃO de fechar o frame. Só um respiro tenso no caos inicial.
  const framingVignette = useTransform(
    progress,
    [0, 0.4, 1],
    [0.05, 0.02, 0.03],
  );
  // Copy só vive no topo: SOBE e DISSOLVE cedo pra travessia pura assumir o palco.
  // O opacity chega a 0 por ~0.24 (antes do beat de entrada ~0.25).
  const copyY = useTransform(progress, [0, 0.3], [0, -56]);
  const copyOpacity = useTransform(progress, [0, 0.12, 0.24], [1, 0.6, 0]);
  // Leve escala↓ da copy ao subir reforça o "ser deixado pra trás" (vetor da copy
  // sobe/encolhe; o campo desce — vetores opostos no mesmo gesto).
  const copyScale = useTransform(progress, [0, 0.24], [1, 0.97]);
  // Hero exit de VETORES OPOSTOS: enquanto a copy SOBE (-y), o campo dá um RESPIRO
  // (dip momentâneo) e VOLTA pra escala cheia — NUNCA fica encolhido (regra 1).
  const fieldRecede = useTransform(progress, [0, 0.12, 0.25], [0, 16, 0]);
  const fieldScale = useTransform(progress, [0, 0.12, 0.25], [1, 0.975, 1]);
  // BEAT DE RESOLUÇÃO — UMA linha que dá nome ao que foi sentido. Entra depois que
  // o caos foi sentido e a ordem assenta (~0.6→0.8) e fica até o fim, com o CTA.
  // Conquistada (não anunciada): surge no auge da chegada, não no meio.
  const resolveOpacity = useTransform(progress, [0.6, 0.8], [0, 1]);
  const resolveY = useTransform(progress, [0.6, 0.82], [28, 0]);

  return (
    <section
      ref={ref}
      // Palco alto p/ a travessia scroll-driven: ~200svh mobile (≤350svh sagrado),
      // ~220svh desktop. Em reduced-motion NÃO há jornada por scroll — colapsa pra 1
      // viewport (evita ~2 telas de scroll morto). svh reserva a caixa (CLS=0; HERO-05).
      className={
        reduced
          ? "relative min-h-svh bg-surface-darker"
          : "relative min-h-[200svh] bg-surface-darker sm:min-h-[220svh]"
      }
      aria-labelledby="hero-headline"
    >
      <div className="sticky top-0 flex h-svh w-full items-center justify-center overflow-hidden">
        {/* Campo + atmosfera viajante: este wrapper RECUA/AFUNDA no 1º scroll
            (hero exit de vetores opostos). Enquanto a copy sobe (-y), tudo aqui
            desce (+y leve) e encolhe (scale↓): o usuário é entregue na travessia.
            A copy fica FORA deste wrapper (vetor oposto). */}
        <motion.div
          aria-hidden
          className="absolute inset-0"
          style={reduced ? undefined : { y: fieldRecede, scale: fieldScale }}
        >
          {/* Frio/tensão — vinheta gélida no topo (a clínica afogada). Recua.
              reduced: estado-DEPOIS (ordenado/quente) → o frio já recuou (≈0). */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              opacity: reduced ? 0.04 : coldOpacity,
              background:
                "radial-gradient(ellipse 85% 65% at 50% 6%, rgba(56,84,140,0.5), transparent 60%)",
            }}
          />

          {/* Vinheta de tensão — bordas fechadas no caos, abrem na calma. */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              opacity: reduced ? 0.08 : tensionVignette,
              background:
                "radial-gradient(ellipse 78% 78% at 50% 50%, transparent 38%, rgba(4,8,16,0.92) 100%)",
            }}
          />

          {/* Bloom quente central — o calor/cuidado cresce com a ordem. */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[53%] size-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full sm:size-[860px]"
            style={{
              opacity: reduced ? 0.6 : warmBloom,
              background:
                "radial-gradient(circle, rgba(255,212,165,0.28) 0%, rgba(124,58,237,0.13) 40%, transparent 70%)",
              filter: "blur(42px)",
            }}
          />

          {/* Banho quente de ambiente — a atmosfera inteira esquenta no fim. */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              opacity: reduced ? 0.36 : warmWash,
              background:
                "linear-gradient(180deg, transparent 28%, rgba(58,30,42,0.32) 72%, rgba(40,22,34,0.48) 100%)",
            }}
          />

          {/* O campo de luz pseudo-3D — a travessia. Monta PÓS-HIDRATAÇÃO (LCP):
              o LCP é a headline + atmosfera acima (já no DOM), nunca este canvas.
              `active` pausa o loop quando offscreen/oculto. */}
          {mounted && <LightField progress={progress} active={active} />}

          {/* Vinheta de ENQUADRAMENTO — o frame que aperta/solta o olho. Escuro
              TINGIDO (roxo-navy em rgba), NUNCA preto puro (anti-banding). */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              opacity: reduced ? 0.55 : framingVignette,
              background:
                "radial-gradient(ellipse 70% 70% at 50% 52%, transparent 30%, rgba(8,12,22,0.6) 72%, rgba(6,9,18,0.96) 100%)",
            }}
          />
        </motion.div>

        {/* Handoff inferior — DISSOLVE o campo no fundo da próxima seção (Pain usa
            o MESMO `surface-darker` #0A0F1A). Sem isso, as partículas eram clipadas
            pelo overflow-hidden numa LINHA DURA contra o fundo flat da Pain. O fade
            vai a #0A0F1A SÓLIDO na borda (= bg da Pain), então a costura some; mas a
            opacidade só sobe perto do fim (sólido só no último sliver) pra NÃO criar
            faixa morta no fim do campo (regra 1: ocupação). Lê como profundidade. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[28%]"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(10,15,26,0.55) 50%, rgb(10,15,26) 88%)",
          }}
        />

        {/* Copy editorial — só no topo. HERO EXIT de vetores opostos: a headline
            SOBE (-y), DISSOLVE (opacity→0 por ~0.24) e encolhe (scale↓) enquanto o
            campo/atmosfera RECUA/AFUNDA. Em reduced-motion fica no estado final
            (sem transform). O H1 é texto SSR e pinta no estado final imediatamente
            (sem entrada JS nem reveal CSS) — é o elemento de LCP. */}
        <motion.div
          style={
            reduced
              ? undefined
              : { y: copyY, opacity: copyOpacity, scale: copyScale }
          }
          className="relative z-10 w-full"
        >
          <Container className="flex flex-col items-center text-center">
            {/* SEM animação de entrada (HERO-01/HERO-02): o H1 É o elemento de LCP.
                O reveal CSS `hero-headline-reveal` (Phase 3) começava em opacity:0 e
                empurrava o render delay do LCP pra ~3s (medido em produção 2026-06-14)
                — removido. O H1 pinta no estado final imediatamente. */}
            <h1
              id="hero-headline"
              className="max-w-3xl text-balance font-sans text-[2.5rem] font-semibold leading-[1.06] tracking-[-0.03em] text-text-on-dark-primary sm:text-5xl lg:text-[4rem] xl:text-[4.5rem]"
            >
              {HERO_COPY.h1Lead}
              <em className="pb-1 font-normal italic leading-[1.1] text-text-on-dark-primary/95">
                {HERO_COPY.h1Emphasis}
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
                href={HERO_COPY.ctaSecondary.href}
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

        {/* BEAT DE RESOLUÇÃO — UMA linha que dá nome ao que foi sentido (+ CTA).
            Entra no auge da chegada (~0.6→0.8). Só no modo animado — reduced-motion
            mantém o CTA do topo (sempre visível); a conclusão é follow-up (08-04). */}
        {!reduced && (
          <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center">
            <motion.p
              style={{ y: resolveY, opacity: resolveOpacity }}
              className="max-w-2xl text-balance font-sans text-[2.25rem] font-medium leading-[1.12] tracking-[-0.02em] text-text-on-dark-primary [text-shadow:0_1px_2px_rgba(6,9,18,0.6),0_0_28px_rgba(6,9,18,0.7)] sm:text-[3rem] lg:text-[3.5rem]"
            >
              {HERO_COPY.resolveLead}
              <em className="font-normal italic text-text-on-dark-primary/95">
                {HERO_COPY.resolveEmphasis}
              </em>
            </motion.p>
            <motion.div
              style={{ opacity: resolveOpacity }}
              className="pointer-events-auto mt-7"
            >
              <WhatsAppCta
                variant="primary"
                location="hero"
                className="h-11 rounded-[10px] px-[18px] text-[14px] font-semibold tracking-[-0.005em] shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_8px_24px_-6px_rgba(124,58,237,0.55),0_2px_8px_-2px_rgba(124,58,237,0.45)] hover:shadow-[0_1px_0_rgba(255,255,255,0.22)_inset,0_12px_30px_-8px_rgba(124,58,237,0.7),0_3px_10px_-2px_rgba(124,58,237,0.5)]"
              >
                {HERO_COPY.ctaPrimary.label}
              </WhatsAppCta>
            </motion.div>
          </div>
        )}

        {/* Film grain — ESTÁTICO, mix-blend-overlay ~5%. Mata banding dos gradients
            e dá textura analógica. data-URI SVG feTurbulence: zero custo por frame
            (é background-image), não roda no rAF. Fica no topo de tudo. */}
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
