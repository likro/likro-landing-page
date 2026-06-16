/**
 * POST /api/lead — edge route handler do form de leads (Phase 5).
 *
 * Flow:
 *   1. Parse JSON; 400 se inválido.
 *   2. Honeypot check (body.website); 200 fake-success se preenchido.
 *      Field name `website` evita autofill 1Password/LastPass (RESEARCH Pitfall 8).
 *   3. Zod safeParse; 422 se falhar.
 *   4. Dedup window 60s por número; 200 deduped se hit.
 *   5. Promise.allSettled([Resend, Sheets]); 200 se ENTREGOU por pelo menos um
 *      canal; 502 se nenhum entregou. Sheets off (no-op → resolve false) NÃO
 *      conta como entrega — evita mascarar falha do Resend (lead silencioso).
 */
import "server-only";
import { leadSchema } from "@/lib/lead-schema";
import { sendLeadEmail } from "@/lib/lead-resend";
import { appendLeadRow } from "@/lib/lead-sheets";
import { checkAndRegisterDedup } from "@/lib/lead-dedup";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  // Honeypot — bot preencheu o campo escondido `website` → silently 200.
  // (Field name `website` em vez de `company` evita falso-positivo de password
  // managers que autofilam `company` em forms B2B — Pitfall 8 RESEARCH.)
  if (
    typeof body === "object" &&
    body !== null &&
    typeof (body as Record<string, unknown>).website === "string" &&
    ((body as Record<string, unknown>).website as string).length > 0
  ) {
    return Response.json({ ok: true });
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { ok: false, error: "validation_failed", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }
  const lead = parsed.data;

  // Dedup (lead.whatsapp já está normalizado pelo schema transform)
  if (checkAndRegisterDedup(lead.whatsapp)) {
    return Response.json({ ok: true, deduped: true });
  }

  const [emailResult, sheetResult] = await Promise.allSettled([
    sendLeadEmail(lead),
    appendLeadRow(lead),
  ]);

  const emailOK = emailResult.status === "fulfilled";
  // Sheets só conta como ENTREGA quando de fato anexou (value === true).
  // Quando o Sheets está off, appendLeadRow resolve com `false` (no-op): isso
  // NÃO pode contar como sucesso, senão mascararia uma falha do Resend e o lead
  // sumiria em silêncio. Sheets off => só o Resend determina o sucesso.
  const sheetOK = sheetResult.status === "fulfilled" && sheetResult.value === true;

  if (!emailOK) {
    console.error("[lead] resend failed:", emailResult.reason);
  }
  if (sheetResult.status === "rejected") {
    console.error("[lead] sheets failed:", sheetResult.reason);
  }

  if (emailOK || sheetOK) {
    return Response.json({ ok: true });
  }
  return Response.json({ ok: false, error: "delivery_failed" }, { status: 502 });
}

export function GET(): Response {
  return new Response("Method Not Allowed", { status: 405 });
}
