/**
 * HeroMicroCard — RSC com 1 micro-card sobreposto estático + lucide icon.
 *
 * D-05: 1 único micro-card sobreposto, ESTÁTICO no carregamento.
 *   HERO-03 veta animação de entrada mesmo em elementos "secundários" do hero
 *   pra evitar competir visualmente com o protagonista.
 * Icon: lucide-react SVG inline (não <Image>) — preserva o slot priority do mockup.
 * Decorativo: aria-hidden="true" (texto não é status semântico de feed real).
 */
import { BellRing, Instagram, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { HERO_COPY } from "@/content/hero";

const ICONS = {
  Instagram,
  MessageSquare,
  BellRing,
} as const;

interface Props {
  className?: string;
}

export function HeroMicroCard({ className }: Props) {
  const Icon = ICONS[HERO_COPY.microCard.iconName];
  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex items-center gap-2 rounded-md border border-border-subtle bg-surface-lighter px-4 py-3 shadow-lg",
        className,
      )}
    >
      <Icon className="size-4 text-accent-primary" />
      <span className="text-sm font-medium text-text-primary">
        {HERO_COPY.microCard.text}
      </span>
    </div>
  );
}
