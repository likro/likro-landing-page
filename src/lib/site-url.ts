/**
 * Ponto único de verdade para a URL absoluta do site.
 *
 * Resolve o Pitfall 5 (RESEARCH § Pitfall 5): OG image / sitemap / robots
 * quebram quando a URL base é hardcodada para um domínio cujo DNS ainda não
 * resolve. Durante a v1 o site vive em `.vercel.app`; `getSiteUrl()` deriva a
 * URL do ambiente Vercel para que previews e o domínio final funcionem sem
 * edição manual.
 *
 * Ordem de resolução:
 *  1. VERCEL_ENV === "production" → domínio final fixo. Quando o DNS resolver,
 *     fica correto automaticamente, sem mudança de código.
 *  2. VERCEL_URL definida → host do deploy atual (preview/branch) com https.
 *  3. Fallback dev local → http://localhost:3000.
 */
export function getSiteUrl(): string {
  if (process.env.VERCEL_ENV === "production") {
    return "https://likro.com.br";
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}
