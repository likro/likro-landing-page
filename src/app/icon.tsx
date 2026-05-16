import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand-tokens";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * FOUND-10: Favicon dinâmico via next/og. "L" branco sobre roxo Likro.
 * Phase 7 polish final pode trocar por logo Likro renderizado.
 * WR-03: usa BRAND.accentPrimary (brand-tokens.ts) em vez de hex literal.
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: BRAND.accentPrimary,
          color: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          borderRadius: 6,
        }}
      >
        L
      </div>
    ),
    { ...size },
  );
}
