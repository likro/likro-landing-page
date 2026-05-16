import { cn } from "@/lib/utils";

/**
 * Placeholder visual premium para showcases de /dev/* (Phase 2 Plan 5).
 *
 * Aesthetic intencional: spacing generoso, tipografia limpa, paleta
 * neutra (surface tokens — NÃO accent). Brand book: roxo é exclusivo
 * de CTAs e elementos ativos. Placeholders aqui não devem competir.
 */
export interface PlaceholderBlockProps {
  /** Label grande central — ex: "1", "Hero", "Pillar 1". */
  label?: string;
  /** Caption pequeno em uppercase — ex: "RevealOnView · delay 0ms". */
  caption?: string;
  /** Surface tone — sem accent. Default "tinted" (neutral-100). */
  tone?: "dark" | "light" | "tinted";
  /** Altura preset. Default "md". */
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZE_CLASS: Record<NonNullable<PlaceholderBlockProps["size"]>, string> = {
  sm: "h-24",
  md: "h-40",
  lg: "h-64",
  xl: "h-96",
};

const TONE_CLASS: Record<NonNullable<PlaceholderBlockProps["tone"]>, string> = {
  // Tokens já existentes em globals.css (Phase 1):
  // - bg-surface-dark / bg-surface-light / bg-neutral-100 (substitui "tinted")
  // - text-text-on-dark-primary / text-text-secondary
  // - border-border-subtle
  // Roxo proibido aqui — brand book.
  dark: "bg-surface-dark text-text-on-dark-primary",
  light:
    "bg-surface-lighter text-text-secondary border border-border-subtle",
  tinted:
    "bg-neutral-100 text-text-secondary border border-border-subtle",
};

export function PlaceholderBlock({
  label,
  caption,
  tone = "tinted",
  size = "md",
  className,
}: PlaceholderBlockProps) {
  return (
    <div
      className={cn(
        "w-full rounded-xl grid place-items-center text-center px-6",
        "transition-shadow",
        SIZE_CLASS[size],
        TONE_CLASS[tone],
        className,
      )}
    >
      <div className="space-y-1">
        {label ? (
          <div className="text-2xl font-medium tracking-tight">{label}</div>
        ) : null}
        {caption ? (
          <div className="text-xs uppercase tracking-wider opacity-70">
            {caption}
          </div>
        ) : null}
      </div>
    </div>
  );
}
