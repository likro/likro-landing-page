import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Input brand Likro — Linear-like minimal.
 * Border default no resting; foco vira accent-primary com ring sutil.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full rounded-md border border-border-default bg-surface-lighter px-3 py-2 text-sm text-text-primary",
        "transition-colors placeholder:text-text-muted",
        "focus-visible:outline-none focus-visible:border-accent-primary focus-visible:ring-1 focus-visible:ring-accent-primary",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-red-500 aria-invalid:ring-1 aria-invalid:ring-red-500",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
