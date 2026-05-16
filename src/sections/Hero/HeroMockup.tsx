/**
 * HeroMockup — RSC com next/image priority único + micro-card sobreposto.
 *
 * HERO-04: este é o ÚNICO <Image priority> da landing.
 *   - Logo do Header é <img> direto (não next/image) — preserva esse slot.
 *   - Micro-card icon é lucide-react SVG inline — sem image.
 * HERO-02: zero animação de entrada no mockup. Renderiza estado final.
 * PERF-03: aspect-[4/3] reserva espaço, evita CLS no swap da imagem.
 * Pitfall G: sizes responsivo — mobile baixa 100vw, desktop 60vw.
 */
import Image from "next/image";
import { HeroMicroCard } from "./HeroMicroCard";

export function HeroMockup() {
  return (
    <div className="relative">
      <div className="relative aspect-[4/3] w-full max-w-[720px] overflow-hidden rounded-lg border border-border-on-dark-subtle shadow-2xl">
        <Image
          src="/mockups/atendimentos.png"
          alt="Caixa de entrada multicanal Likro: atendimentos centralizados de WhatsApp e Instagram para clínicas"
          fill
          priority
          fetchPriority="high"
          sizes="(max-width: 1024px) 100vw, 60vw"
          quality={85}
          className="object-cover"
        />
      </div>
      <HeroMicroCard className="absolute -bottom-4 -left-4 lg:-bottom-6 lg:-left-6" />
    </div>
  );
}
