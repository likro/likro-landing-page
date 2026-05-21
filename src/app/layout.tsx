import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { SkipLink } from "@/components/a11y/skip-link";
import { AnalyticsProvider } from "@/components/providers/analytics-provider";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import { OrganizationJsonLd, WebPageJsonLd } from "@/components/seo/json-ld";
import { Toaster } from "@/components/ui/sonner";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

// FOUND-04: Inter, 3 pesos, swap, variable CSS — NUNCA mais que 3 pesos (brand book)
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-inter",
  adjustFontFallback: true,
});

// FOUND-10: Metadata completa — title.template, OG, Twitter, robots, manifest.
export const metadata: Metadata = {
  // SEO-03 (Pitfall 5): metadataBase derivada de getSiteUrl() — resolve a OG
  // image / Twitter image para a URL .vercel.app ativa durante a v1, sem
  // esperar o DNS do domínio final.
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Likro · Operação comercial moderna para clínicas",
    template: "%s · Likro",
  },
  // SEO-01/02: title 49c, description 87c — auditado, dentro dos limites.
  description:
    "CRM, atendimento multicanal e automação com IA, feito para clínicas e estéticas brasileiras.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://likro.com.br",
    siteName: "Likro",
    title: "Likro · Operação comercial moderna para clínicas",
    description:
      "CRM, atendimento multicanal e automação com IA, feito para clínicas e estéticas brasileiras.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Likro" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Likro",
    description: "Operação comercial moderna para clínicas e estéticas.",
    // SEO-04: reusa a OG image 1200×630 para completar o Twitter Card.
    images: ["/opengraph-image"],
  },
  robots: { index: true, follow: true },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
};

/**
 * Provider tree (otimizada pra TBT — Phase 3 redesign):
 *   AnalyticsProvider (gated por env vars, scripts afterInteractive)
 *     > SmoothScrollProvider (Lenis LAZY via dynamic import pós-idle)
 *       > children
 *       > Toaster
 *
 * MotionConfigProvider foi removido daqui — motion/react bundle não vai pro
 * root chunk. Quando Phase 4 introduzir motion.* em seções, re-adiciona
 * localmente onde for usado (ou via wrapper de seção).
 *
 * Root layout permanece Server Component (sem "use client") — providers
 * têm "use client" próprio, RSC boundary é resolvida automaticamente.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body>
        {/*
         * A11Y-05: SkipLink é o primeiro elemento focável do body — alvo do
         * Tab inicial. Renderiza um <a href="#main-content"> com o texto
         * "Pular para o conteúdo principal", saltando para o <main> da página.
         */}
        <SkipLink />
        <OrganizationJsonLd />
        <WebPageJsonLd />
        <AnalyticsProvider>
          <SmoothScrollProvider>
            {children}
            <Toaster richColors position="bottom-right" />
          </SmoothScrollProvider>
        </AnalyticsProvider>
      </body>
    </html>
  );
}
