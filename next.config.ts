import type { NextConfig } from "next";

/**
 * SEO-11 (T-07-05): defesa em profundidade contra indexação de previews.
 * Todo deploy não-produção (preview/branch/dev na Vercel) recebe o header
 * HTTP `X-Robots-Tag: noindex, nofollow` — complementa o `Disallow: /` do
 * robots.txt. Produção retorna `[]` (nenhum header, indexação permitida).
 *
 * NOTA: o `nextConfig` é exportado como const nomeada para que o plano 07-05
 * (wave 5) possa envolvê-lo com `withBundleAnalyzer` como drop-in.
 */
const nextConfig: NextConfig = {
  async headers() {
    const isProd = process.env.VERCEL_ENV === "production";
    if (isProd) return [];
    return [
      {
        source: "/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
