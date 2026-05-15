import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// FOUND-04: Inter, 3 pesos, swap, variable CSS — NUNCA mais que 3 pesos (brand book)
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-inter",
  adjustFontFallback: true,
});

// Metadata stub — Plan 04 expande para FOUND-10 completo (OG, twitter, manifest, themeColor=#0a0a0b)
export const metadata: Metadata = {
  title: "Likro",
  description: "Operação comercial moderna para clínicas e estéticas.",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
