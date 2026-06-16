/**
 * Server-only env vars. Phase 5 (Lead form).
 *
 * Importar este módulo de qualquer arquivo client (mesmo via cadeia transitiva)
 * causa erro de build — "server-only" garante o gate.
 *
 * Validação LAZY (RESEARCH Pitfall 3 — additional_constraints override do plan):
 * em vez de validar no module load, valida na primeira chamada de `getServerEnv()`.
 * Motivo: build do Next.js executa módulos server durante prerender; se validássemos
 * no top-level e as vars ainda não estivessem populadas (`next build` em CI sem env),
 * o build inteiro quebra antes do route handler ter chance de existir. Com lazy:
 * - Build passa sem env vars (route handler nunca é executado em prerender).
 * - Primeira chamada em runtime valida e cacheia o resultado.
 * - Se faltar, throw com lista de issues clara — mesma UX de erro.
 *
 * VARS OBRIGATÓRIAS vs OPCIONAIS:
 * - Obrigatórias (Resend): RESEND_API_KEY + LEAD_TO_EMAIL — validadas por
 *   `getServerEnv()`. Ler `serverEnv.RESEND_API_KEY` NUNCA dispara validação de
 *   nenhuma var do Google.
 * - Opcionais (Google Sheets): GOOGLE_SA_CLIENT_EMAIL + GOOGLE_SA_PRIVATE_KEY +
 *   GOOGLE_SHEET_ID — validadas à parte por `getGoogleEnv()`. Sheets é entrega
 *   secundária: pode ficar 100% off (form entrega só por email).
 */
import "server-only";
import { z } from "zod";

const requiredSchema = z.object({
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY ausente"),
  LEAD_TO_EMAIL: z.string().email("LEAD_TO_EMAIL deve ser email válido"),
});

type ServerEnv = z.infer<typeof requiredSchema>;

let cached: ServerEnv | null = null;

/**
 * Acessa env vars server-only OBRIGATÓRIAS (Resend). Valida na primeira chamada
 * e cacheia. NÃO valida nem lê nenhuma var do Google.
 *
 * @throws Error se RESEND_API_KEY ou LEAD_TO_EMAIL faltar/inválida.
 */
export function getServerEnv(): ServerEnv {
  if (cached) return cached;

  const parsed = requiredSchema.safeParse({
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    LEAD_TO_EMAIL: process.env.LEAD_TO_EMAIL,
  });

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(
      `[server-env] env vars inválidas/ausentes:\n${issues}\n\nVeja .env.example para o formato esperado.`,
    );
  }

  cached = parsed.data;
  return cached;
}

/**
 * Alias para callers que preferem object access. Internamente chama getServerEnv()
 * em cada acesso ao field — Proxy lazy mantém a API ergonômica do plan original
 * (`serverEnv.RESEND_API_KEY`) sem validar até primeiro uso real. Cobre só as
 * vars obrigatórias (Resend).
 */
export const serverEnv = new Proxy({} as ServerEnv, {
  get(_target, prop: string) {
    return getServerEnv()[prop as keyof ServerEnv];
  },
});

export interface GoogleEnv {
  clientEmail: string;
  privateKey: string;
  sheetId: string;
}

// undefined = ainda não resolvido; null = Sheets off; objeto = Sheets habilitado.
let googleCached: GoogleEnv | null | undefined;

/**
 * Estado do Google Sheets (entrega secundária, opcional):
 *  - null      → 3 vars ausentes → Sheets desabilitado (caller faz no-op).
 *  - GoogleEnv → 3 vars presentes → Sheets habilitado.
 *  - throw     → config parcial (1 ou 2 de 3) → erro claro listando faltantes.
 *
 * O caso parcial é quase sempre erro de config (operador setou metade). Esconder
 * como "off" silencioso seria perigoso — então lançamos. Como `appendLeadRow` roda
 * dentro de `Promise.allSettled` na route, esse throw NÃO derruba a entrega: o
 * Resend ainda entrega, a rota devolve 200, e o erro aparece nos logs.
 *
 * Lazy + cacheado (exceto o caso parcial, que não cacheia para permitir que
 * correções de env durante dev sejam reavaliadas).
 */
export function getGoogleEnv(): GoogleEnv | null {
  if (googleCached !== undefined) return googleCached;

  const clientEmail = process.env.GOOGLE_SA_CLIENT_EMAIL?.trim() ?? "";
  const privateKey = process.env.GOOGLE_SA_PRIVATE_KEY?.trim() ?? "";
  const sheetId = process.env.GOOGLE_SHEET_ID?.trim() ?? "";

  const present = [clientEmail, privateKey, sheetId].filter(Boolean).length;

  if (present === 0) {
    googleCached = null; // Sheets desabilitado
    return googleCached;
  }
  if (present === 3) {
    googleCached = { clientEmail, privateKey, sheetId };
    return googleCached;
  }
  // 1 ou 2 → config parcial → erro claro (NÃO cacheia; deixa o caller decidir)
  const missing = [
    !clientEmail && "GOOGLE_SA_CLIENT_EMAIL",
    !privateKey && "GOOGLE_SA_PRIVATE_KEY",
    !sheetId && "GOOGLE_SHEET_ID",
  ].filter(Boolean);
  throw new Error(
    `[server-env] config parcial do Google Sheets — defina todas as 3 vars ou nenhuma. ` +
      `Faltando: ${missing.join(", ")}.`,
  );
}

/** Test-only: limpa caches internos entre testes. */
export function __resetServerEnvForTests(): void {
  cached = null;
  googleCached = undefined;
}
