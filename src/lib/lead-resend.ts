/**
 * sendLeadEmail — envio de email transacional ao Lenny via Resend.
 *
 * Edge-compatible (Resend SDK v6.x é fetch-based — verified em RESEARCH.md).
 * Domínio sender PRECISA estar verificado em resend.com/domains antes de prod
 * (Pitfall 2 do RESEARCH). Em preview/dev sem domínio, usar from sandbox.
 *
 * Threat mitigations:
 * - T-05-09 (XSS via campo `message` refletido no email): `escapeHtml()` em
 *   todo dynamic data (name, whatsapp, message, utm).
 * - T-05-11 (sender spoofing): `from:` hard-coded server-side; cliente JAMAIS
 *   controla. Em prod requer DNS DKIM/SPF verificado.
 * - T-05-03 (lazy env): `serverEnv` é Proxy lazy — primeira leitura dispara
 *   validação; importar este módulo no top-level do route handler NÃO valida
 *   env vars até `sendLeadEmail` ser de fato chamado.
 */
import "server-only";
import { Resend } from "resend";
import { serverEnv } from "@/lib/server-env";
import type { Lead } from "@/lib/lead-schema";

// Sandbox do Resend — funciona sempre, mas só entrega para o email da
// própria conta Resend. Suficiente enquanto o domínio não é verificado.
const FROM_SANDBOX = "Likro Leads <onboarding@resend.dev>";

function fromAddress(): string {
  // Pitfall 2 (RESEARCH): estar em produção NÃO significa domínio verificado —
  // são independentes. Usa o remetente custom só quando RESEND_FROM está
  // explicitamente setado (depois de verificar likro.com.br em resend.com/domains).
  // Sem isso, cai no sandbox, que sempre funciona.
  return process.env.RESEND_FROM ?? FROM_SANDBOX;
}

export async function sendLeadEmail(lead: Lead): Promise<void> {
  // serverEnv é Proxy lazy — validação só dispara aqui (não no module load).
  const resend = new Resend(serverEnv.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: fromAddress(),
    to: serverEnv.LEAD_TO_EMAIL,
    subject: `Novo lead — ${lead.name}`,
    html: buildLeadHtml(lead),
  });
  if (error) {
    throw new Error(`[lead-resend] ${error.message}`);
  }
}

function buildLeadHtml(lead: Lead): string {
  return `<div style="font-family: system-ui, -apple-system, sans-serif; max-width: 480px;">
      <h2 style="font-size: 18px; margin: 0 0 12px;">Novo lead da landing</h2>
      <p style="margin: 4px 0;"><strong>Nome:</strong> ${escapeHtml(lead.name)}</p>
      <p style="margin: 4px 0;"><strong>WhatsApp:</strong> ${escapeHtml(lead.whatsapp)}</p>
      ${lead.message ? `<p style="margin: 12px 0 4px;"><strong>Mensagem:</strong></p><p style="margin: 0; white-space: pre-wrap;">${escapeHtml(lead.message)}</p>` : ""}
      ${lead.utm ? `<p style="color:#666;font-size:12px;margin-top:16px;">UTM: ${escapeHtml(lead.utm)}</p>` : ""}
    </div>`;
}

function escapeHtml(s: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return s.replace(/[&<>"']/g, (c) => map[c] ?? c);
}
