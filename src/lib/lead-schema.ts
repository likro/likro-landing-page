/**
 * Lead form schema — compartilhado client ↔ server.
 *
 * Client: usado via @hookform/resolvers/zod no <LeadForm>.
 * Server: usado em /api/lead/route.ts via leadSchema.safeParse(body).
 *
 * normalizeWhatsapp DEVE ser idêntico nos dois lados — dedup depende disso.
 *
 * Honeypot: campo `website` (NÃO `company` — RESEARCH Pitfall 8: 1Password/LastPass
 * autofila `company` em contexto B2B, gerando falso-positivo).
 */
import { z } from "zod";

/** Remove tudo que não é dígito. "+55 (11) 99999-9999" → "5511999999999". */
export function normalizeWhatsapp(raw: string): string {
  return raw.replace(/\D/g, "");
}

export const leadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nome muito curto")
    .max(120, "Nome muito longo"),
  whatsapp: z
    .string()
    .trim()
    .min(8, "WhatsApp inválido")
    .max(40, "WhatsApp muito longo")
    .transform(normalizeWhatsapp)
    .refine((v) => /^\d{10,13}$/.test(v), {
      message: "WhatsApp deve ter 10 a 13 dígitos (DDD + número)",
    }),
  message: z
    .string()
    .trim()
    .max(1000, "Mensagem muito longa (máximo 1000 caracteres)")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  utm: z.string().max(500).optional(),
  // Honeypot — schema aceita mas route handler trata.
  // Nome `website` evita autofill 1Password/LastPass (Pitfall 8 RESEARCH).
  website: z.string().optional(),
});

export type Lead = z.infer<typeof leadSchema>;
