import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TAGLINES: Record<string, string> = {
  fr: "Concierge IA pour les établissements d'exception à Monaco",
  en: "AI Concierge for Monaco's finest establishments",
  ru: "ИИ-консьерж для премиальных заведений Монако",
};

export function generateStaticParams() {
  return [{ locale: "fr" }, { locale: "en" }, { locale: "ru" }];
}

export default async function Image({ params }: { params: { locale: string } }) {
  const locale = params?.locale ?? "fr";
  const tagline = TAGLINES[locale] ?? TAGLINES.fr;

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
        <div style={{ fontSize: 96, color: "#D4AF37", lineHeight: 1 }}>✦</div>

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

        {/* Locale-specific tagline */}
        <div
          style={{
            fontSize: 28,
            color: "#9CA3AF",
            marginTop: 20,
            letterSpacing: "0.04em",
            textAlign: "center",
            maxWidth: 820,
            lineHeight: 1.4,
          }}
        >
          {tagline}
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

        {/* Locale badge */}
        <div
          style={{
            position: "absolute",
            top: 40,
            right: 48,
            fontSize: 18,
            color: "#D4AF37",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            opacity: 0.7,
          }}
        >
          {locale.toUpperCase()}
        </div>
      </div>
    ),
    { ...size }
  );
}
