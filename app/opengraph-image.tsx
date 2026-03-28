import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "MonaConcierge — AI-powered customer engagement for Monaco & Côte d'Azur";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0a0a0f",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "serif",
        }}
      >
        {/* Gold star */}
        <div
          style={{
            fontSize: 96,
            color: "#D4AF37",
            lineHeight: 1,
          }}
        >
          ✦
        </div>

        {/* Product name */}
        <div
          style={{
            fontSize: 72,
            color: "#FFFFFF",
            fontWeight: 300,
            letterSpacing: "0.04em",
            marginTop: 28,
          }}
        >
          MonaConcierge
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: "#9CA3AF",
            marginTop: 20,
            letterSpacing: "0.06em",
            textAlign: "center",
            maxWidth: 800,
          }}
        >
          AI-powered customer engagement for Monaco &amp; Côte d&apos;Azur
        </div>

        {/* Bottom accent line */}
        <div
          style={{
            width: 80,
            height: 2,
            background: "#D4AF37",
            marginTop: 48,
            opacity: 0.6,
          }}
        />
      </div>
    ),
    { ...size }
  );
}
