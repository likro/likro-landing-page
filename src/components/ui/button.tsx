import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * D-02 / D-03 / D-04 — Button base brand Likro.
 *
 * Refinement Linear (peso visual leve, foco bem resolvido) + Stripe (profundidade
 * sutil via shadow + active translate). Easing premium-out (cubic-bezier(0.16,1,0.3,1))
 * em transitions. Focus ring sempre via `accent-primary` (brand-lock).
 *
 * Defaults shadcn substituídos por variants Likro:
 *   default    → roxo accent CTA principal
 *   secondary  → outline com texto roxo
 *   ghost      → sem fundo, hover sutil
 *   outline    → border neutral
 *   destructive
 *   link
 */
const buttonVariants = cva(
  // Base
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium " +
    "transition-all duration-200 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 " +
    "disabled:pointer-events-none disabled:opacity-50 " +
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary: roxo accent CTA principal (Stripe-like depth)
        default:
          "bg-accent-primary text-white shadow-sm hover:bg-accent-hover hover:shadow-md active:translate-y-px",
        // Secondary: outline com texto roxo (Linear-like minimal)
        // active: equivalente do hover para feedback touch (MOBILE-05).
        secondary:
          "border border-accent-primary bg-transparent text-accent-primary hover:bg-accent-primary/5 active:bg-accent-primary/10",
        // Ghost: sem fundo, hover sutil — active fallback para touch
        ghost: "hover:bg-neutral-100 active:bg-neutral-200 text-text-primary",
        // Outline: border neutral — active fallback para touch
        outline:
          "border border-border-default bg-surface-lighter text-text-primary hover:bg-neutral-50 active:bg-neutral-100",
        // Destructive
        destructive: "bg-red-600 text-white hover:bg-red-700",
        // Link — hover:underline com active:underline (fallback touch, MOBILE-05)
        link: "text-accent-primary underline-offset-4 hover:underline active:underline",
      },
      size: {
        // MOBILE-03: tap targets touch-safe. `max-md:min-h-[44px]` garante
        // ≥44px de altura em viewport mobile/tablet pequeno (<768px) sem
        // alterar o visual desktop (h-10/h-9 permanecem em telas ≥md).
        default: "h-10 px-4 py-2 max-md:min-h-[44px]",
        sm: "h-9 rounded-md px-3 max-md:min-h-[44px]",
        lg: "h-12 rounded-md px-6 text-base",
        // icon mobile: 44×44 mínimo (size-10 = 40px é insuficiente para touch).
        icon: "size-10 max-md:min-h-[44px] max-md:min-w-[44px]",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot.Root : "button";
    return (
      <Comp
        data-slot="button"
        data-variant={variant}
        data-size={size}
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
