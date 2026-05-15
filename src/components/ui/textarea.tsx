import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Textarea brand Likro — Linear-like minimal (mesmo padrão do Input).
 * min-h-20 dá espaço confortável para mensagens curtas; field-sizing-content
 * cresce conforme o usuário digita.
 */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-20 w-full rounded-md border border-border-default bg-surface-lighter px-3 py-2 text-sm text-text-primary",
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

export { Textarea };
