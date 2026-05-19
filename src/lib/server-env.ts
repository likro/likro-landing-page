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
 */
import "server-only";
import { z } from "zod";

const schema = z.object({
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY ausente"),
  LEAD_TO_EMAIL: z.string().email("LEAD_TO_EMAIL deve ser email válido"),
  GOOGLE_SA_CLIENT_EMAIL: z.string().email("GOOGLE_SA_CLIENT_EMAIL deve ser email válido"),
  GOOGLE_SA_PRIVATE_KEY: z.string().min(1, "GOOGLE_SA_PRIVATE_KEY ausente"),
  GOOGLE_SHEET_ID: z.string().min(1, "GOOGLE_SHEET_ID ausente"),
});

type ServerEnv = z.infer<typeof schema>;

let cached: ServerEnv | null = null;

/**
 * Acessa env vars server-only. Valida na primeira chamada e cacheia.
 *
 * @throws Error se qualquer var faltar/inválida — mensagem lista todas as issues.
 */
export function getServerEnv(): ServerEnv {
  if (cached) return cached;

  const parsed = schema.safeParse({
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    LEAD_TO_EMAIL: process.env.LEAD_TO_EMAIL,
    GOOGLE_SA_CLIENT_EMAIL: process.env.GOOGLE_SA_CLIENT_EMAIL,
    GOOGLE_SA_PRIVATE_KEY: process.env.GOOGLE_SA_PRIVATE_KEY,
    GOOGLE_SHEET_ID: process.env.GOOGLE_SHEET_ID,
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
 * (`serverEnv.RESEND_API_KEY`) sem validar até primeiro uso real.
 */
export const serverEnv = new Proxy({} as ServerEnv, {
  get(_target, prop: string) {
    return getServerEnv()[prop as keyof ServerEnv];
  },
});
