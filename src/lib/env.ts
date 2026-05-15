/**
 * Type-safe access a env vars NEXT_PUBLIC_*.
 *
 * Todas as vars são opcionais por design — lib/analytics e lib/whatsapp
 * tratam undefined gracefully (no-op em prod até o env estar populado).
 *
 * Vars NEXT_PUBLIC_* são públicas por design (IDs de Pixel/GA4/Clarity);
 * secrets server-side (LEAD_WEBHOOK_URL etc) NÃO vivem aqui.
 */
export const env = {
  NEXT_PUBLIC_WA_NUMBER: process.env.NEXT_PUBLIC_WA_NUMBER,
  NEXT_PUBLIC_GA4_ID: process.env.NEXT_PUBLIC_GA4_ID,
  NEXT_PUBLIC_META_PIXEL_ID: process.env.NEXT_PUBLIC_META_PIXEL_ID,
  NEXT_PUBLIC_CLARITY_ID: process.env.NEXT_PUBLIC_CLARITY_ID,
} as const;
