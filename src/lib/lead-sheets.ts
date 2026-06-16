/**
 * appendLeadRow — escreve uma linha na planilha de leads via Google Sheets API v4.
 *
 * Estratégia: JWT RS256 minted via jose (edge-compatible) → trocado por
 * access token na endpoint OAuth2 do Google → POST direto no values:append
 * via fetch nativo. Zero deps Node-only (googleapis SDK = 171MB, banido).
 *
 * PITFALL 1 (RESEARCH.md): GOOGLE_SA_PRIVATE_KEY armazena \n literal em env var;
 * unescape para \n real antes de importPKCS8.
 */
import "server-only";
import { SignJWT, importPKCS8 } from "jose";
import { getGoogleEnv, type GoogleEnv } from "@/lib/server-env";
import type { Lead } from "@/lib/lead-schema";

const SCOPES = "https://www.googleapis.com/auth/spreadsheets";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const RANGE = "Leads!A:E";

async function getAccessToken(google: GoogleEnv): Promise<string> {
  // Pitfall 1: unescape literal \n preservado no env var
  const privateKeyPem = google.privateKey.replace(/\\n/g, "\n");
  const privateKey = await importPKCS8(privateKeyPem, "RS256");

  const now = Math.floor(Date.now() / 1000);
  const jwt = await new SignJWT({ scope: SCOPES })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(google.clientEmail)
    .setAudience(TOKEN_URL)
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(privateKey);

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`[lead-sheets] token exchange failed: ${res.status} ${text}`);
  }
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) {
    throw new Error("[lead-sheets] token response missing access_token");
  }
  return json.access_token;
}

/**
 * Retorna `true` quando a linha foi de fato anexada na planilha; `false` quando
 * o Sheets está desabilitado (no-op). O caller (route) usa esse retorno para NÃO
 * contar um Sheets desligado como canal de entrega — senão um no-op fulfilled
 * mascararia uma falha real do Resend e o lead sumiria em silêncio.
 */
export async function appendLeadRow(lead: Lead): Promise<boolean> {
  const google = getGoogleEnv(); // null = off; throw = config parcial
  if (google === null) {
    return false; // Sheets desabilitado — no-op silencioso (sem fetch, sem log)
  }
  const token = await getAccessToken(google);
  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${google.sheetId}` +
    `/values/${encodeURIComponent(RANGE)}:append?valueInputOption=RAW`;

  const row: string[] = [
    new Date().toISOString(),
    lead.name,
    lead.whatsapp,
    lead.message ?? "",
    lead.utm ?? "",
  ];

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values: [row] }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`[lead-sheets] append failed: ${res.status} ${text}`);
  }
  return true;
}
