import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { AnalyticsProvider } from "@/components/providers/analytics-provider";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import { MotionConfigProvider } from "@/components/providers/motion-config-provider";
import { Toaster } from "@/components/ui/sonner";
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
  metadataBase: new URL("https://likro.com.br"),
  title: {
    default: "Likro — Operação comercial moderna para clínicas",
    template: "%s · Likro",
  },
  description:
    "CRM, atendimento multicanal e automação com IA — feito para clínicas e estéticas brasileiras.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://likro.com.br",
    siteName: "Likro",
    title: "Likro — Operação comercial moderna para clínicas",
    description:
      "CRM, atendimento multicanal e automação com IA — feito para clínicas e estéticas brasileiras.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Likro" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Likro",
    description: "Operação comercial moderna para clínicas e estéticas.",
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
 * FOUND-07: Provider tree em ORDEM EXATA — não trocar.
 *   AnalyticsProvider (fora — não re-renderiza no scroll)
 *     > SmoothScrollProvider (Lenis singleton, RAF único)
 *       > MotionConfigProvider (reducedMotion="user" global)
 *         > children
 *         > Toaster (overlay sonner, mesmo nível dos children)
 *
 * Root layout permanece Server Component (sem "use client") — providers
 * têm "use client" próprio, RSC boundary é resolvida automaticamente.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body>
        <AnalyticsProvider>
          <SmoothScrollProvider>
            <MotionConfigProvider>
              {children}
              <Toaster richColors position="bottom-right" />
            </MotionConfigProvider>
          </SmoothScrollProvider>
        </AnalyticsProvider>
      </body>
    </html>
  );
}
