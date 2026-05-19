"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { leadSchema, type Lead } from "@/lib/lead-schema";
import { track } from "@/lib/analytics";
import { FORM_COPY } from "@/content/form";
import { cn } from "@/lib/utils";
import { FormSuccess } from "./FormSuccess";
import { FormError } from "./FormError";

type FormState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success" }
  | { status: "error" };

function readUtm(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const params = new URLSearchParams(window.location.search);
  const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
  const found = keys
    .map((k) => {
      const v = params.get(k);
      return v ? `${k}=${v}` : null;
    })
    .filter((v): v is string => v !== null);
  return found.length > 0 ? found.join("&") : undefined;
}

const fieldClasses = cn(
  "mt-1 block w-full rounded-lg border bg-surface-card px-3 py-2 text-base text-text-primary",
  "placeholder:text-text-muted",
  "focus:outline-none focus:ring-2 focus:ring-accent-primary/40 focus:border-accent-primary",
  "transition-colors duration-200",
);

export function LeadForm() {
  const [state, setState] = useState<FormState>({ status: "idle" });
  const focusFiredRef = useRef(false);
  const utmRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    utmRef.current = readUtm();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Lead>({
    resolver: zodResolver(leadSchema),
    defaultValues: { name: "", whatsapp: "", message: "", website: "" },
  });

  const handleFirstFocus = () => {
    if (focusFiredRef.current) return;
    focusFiredRef.current = true;
    track("form_focus", {});
  };

  const onSubmit = handleSubmit(async (values) => {
    setState({ status: "submitting" });
    track("form_submit_attempt", { has_message: Boolean(values.message) });

    const payload = { ...values, utm: utmRef.current };

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean };
      if (res.ok && json.ok) {
        setState({ status: "success" });
        track("form_submit_success", {});
      } else {
        setState({ status: "error" });
        track("form_submit_error", { status: res.status });
      }
    } catch (err) {
      setState({ status: "error" });
      track("form_submit_error", { reason: String(err) });
    }
  });

  const handleRetry = () => {
    reset(undefined, { keepValues: true });
    setState({ status: "idle" });
  };

  // success/error states preservam data-clarity-mask no root para PII masking
  // continuar válido em qualquer estado da máquina (defense in depth com Form/index).
  if (state.status === "success") {
    return (
      <div data-clarity-mask="true">
        <FormSuccess />
      </div>
    );
  }
  if (state.status === "error") {
    return (
      <div data-clarity-mask="true">
        <FormError onRetry={handleRetry} />
      </div>
    );
  }

  const submitting = state.status === "submitting";

  return (
    <form
      data-clarity-mask="true"
      onSubmit={onSubmit}
      onFocus={handleFirstFocus}
      noValidate
      className="space-y-5"
      aria-label="Form de contato Likro"
    >
      {/* Honeypot — off-screen (Pattern 6 RESEARCH). NÃO display:none.
          Field name `website` evita autofill 1Password/LastPass (Pitfall 8). */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-9999px",
          top: 0,
          width: "1px",
          height: "1px",
          overflow: "hidden",
        }}
      >
        <label htmlFor="website">{FORM_COPY.fields.honeypot.label}</label>
        <input
          id="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register("website")}
        />
      </div>

      <div>
        <label
          htmlFor="lead-name"
          className="block text-sm font-medium text-text-primary"
        >
          {FORM_COPY.fields.name.label}
        </label>
        <input
          id="lead-name"
          type="text"
          autoComplete="name"
          placeholder={FORM_COPY.fields.name.placeholder}
          aria-invalid={errors.name ? "true" : "false"}
          aria-describedby={errors.name ? "lead-name-error" : undefined}
          className={cn(
            fieldClasses,
            errors.name ? "border-red-500" : "border-border-default",
          )}
          {...register("name")}
        />
        {errors.name && (
          <p id="lead-name-error" className="mt-1 text-sm text-red-600">
            {errors.name.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="lead-whatsapp"
          className="block text-sm font-medium text-text-primary"
        >
          {FORM_COPY.fields.whatsapp.label}
        </label>
        <input
          id="lead-whatsapp"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder={FORM_COPY.fields.whatsapp.placeholder}
          aria-invalid={errors.whatsapp ? "true" : "false"}
          aria-describedby={errors.whatsapp ? "lead-whatsapp-error" : undefined}
          className={cn(
            fieldClasses,
            errors.whatsapp ? "border-red-500" : "border-border-default",
          )}
          {...register("whatsapp")}
        />
        {errors.whatsapp && (
          <p id="lead-whatsapp-error" className="mt-1 text-sm text-red-600">
            {errors.whatsapp.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="lead-message"
          className="block text-sm font-medium text-text-primary"
        >
          {FORM_COPY.fields.message.label}
        </label>
        <textarea
          id="lead-message"
          rows={3}
          placeholder={FORM_COPY.fields.message.placeholder}
          aria-invalid={errors.message ? "true" : "false"}
          aria-describedby={errors.message ? "lead-message-error" : undefined}
          className={cn(
            fieldClasses,
            "resize-y",
            errors.message ? "border-red-500" : "border-border-default",
          )}
          {...register("message")}
        />
        {errors.message && (
          <p id="lead-message-error" className="mt-1 text-sm text-red-600">
            {errors.message.message}
          </p>
        )}
      </div>

      <div className="pt-2">
        <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
          {submitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              {FORM_COPY.submit.submitting}
            </>
          ) : (
            FORM_COPY.submit.idle
          )}
        </Button>
      </div>

      <p className="text-xs text-text-muted">{FORM_COPY.privacyNote}</p>
    </form>
  );
}
