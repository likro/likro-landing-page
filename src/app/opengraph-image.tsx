import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Likro — Operação comercial moderna para clínicas";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * FOUND-10: OG image dinâmica via next/og. Phase 1 entrega versão
 * minimalista (logo textual + tagline) sobre surface-dark; Phase 7
 * faz polish final com mockup do produto.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 80,
          background: "#0a0a0b",
          color: "#fafafa",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: 80,
        }}
      >
        <div style={{ fontWeight: 700, letterSpacing: -2 }}>Likro</div>
        <div
          style={{
            fontSize: 32,
            marginTop: 24,
            color: "#a1a1aa",
            textAlign: "center",
          }}
        >
          Operação comercial moderna para clínicas
        </div>
      </div>
    ),
    { ...size },
  );
}
