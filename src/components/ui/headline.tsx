import * as React from "react";
import { cn } from "@/lib/utils";

type HeadlineSize = "hero" | "section" | "sub";
type HeadlineAs = "h1" | "h2" | "h3";

interface HeadlineProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: HeadlineAs;
  size?: HeadlineSize;
}

/**
 * Headline — hierarquia tipográfica brand book Likro.
 * - hero    → headlines gigantes em momentos-chave (4xl→7xl)
 * - section → titles de seção (3xl→5xl)
 * - sub     → subtítulos (xl→2xl)
 *
 * Sempre Inter (font-sans), text-text-primary; classes podem ser
 * sobrescritas via prop className para contexto dark.
 */
const SIZE_CLASSES: Record<HeadlineSize, string> = {
  hero: "text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight",
  section: "text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight",
  sub: "text-xl sm:text-2xl font-semibold",
};

export function Headline({
  as: Component = "h2",
  size = "section",
  className,
  ...props
}: HeadlineProps) {
  return (
    <Component
      className={cn("font-sans text-text-primary", SIZE_CLASSES[size], className)}
      {...props}
    />
  );
}
