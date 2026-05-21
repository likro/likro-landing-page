import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Likro · CRM e atendimento para clínicas e estéticas";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * SEO-03: OG image 1200×630 — polish final da Phase 7.
 *
 * Composição editorial alinhada à esquerda (não centralizada genérica): a
 * marca e a tagline ancoram a vertical esquerda, com respiro à direita —
 * leitura premium, hierarquia clara. Fundo escuro `#0a0a0b` com um brilho
 * radial roxo `#7C3AED` sutil no canto superior direito (destaque pontual,
 * respeitando o brand book — roxo nunca domina o fundo).
 *
 * Contraste do texto sobre o fundo escuro validado: branco-quase-puro para a
 * marca, cinza claro para a tagline e o eyebrow.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#0a0a0b",
          color: "#fafafa",
          padding: "96px 100px",
          position: "relative",
        }}
      >
        {/* Brilho radial roxo sutil — destaque pontual no canto superior direito */}
        <div
          style={{
            position: "absolute",
            top: -200,
            right: -160,
            width: 620,
            height: 620,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(124,58,237,0.42) 0%, rgba(124,58,237,0) 70%)",
          }}
        />

        {/* Eyebrow */}
        <div
          style={{
            fontSize: 26,
            fontWeight: 500,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#8b8b95",
          }}
        >
          Plataforma de operação comercial
        </div>

        {/* Marca */}
        <div
          style={{
            fontSize: 148,
            fontWeight: 700,
            letterSpacing: -5,
            lineHeight: 1,
            marginTop: 28,
            color: "#fafafa",
          }}
        >
          Likro
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 40,
            fontWeight: 400,
            lineHeight: 1.3,
            marginTop: 32,
            maxWidth: 760,
            color: "#c4c4cc",
          }}
        >
          CRM e atendimento para clínicas e estéticas
        </div>

        {/* Filete de destaque roxo — acento de marca na base */}
        <div
          style={{
            width: 120,
            height: 6,
            borderRadius: 3,
            marginTop: 44,
            background: "#7C3AED",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
