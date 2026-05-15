import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * FOUND-10: Favicon dinâmico via next/og. "L" branco sobre roxo Likro.
 * Phase 7 polish final pode trocar por logo Likro renderizado.
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: "#7c3aed",
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
