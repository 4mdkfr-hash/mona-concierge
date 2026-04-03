import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-display",
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://mona-concierge.com";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "MonaConcierge",
    template: "%s | MonaConcierge",
  },
  description:
    "AI-powered customer engagement for Monaco & Côte d'Azur venues — WhatsApp, Instagram, Google Reviews, in French, English & Russian.",
  openGraph: {
    title: "MonaConcierge",
    description:
      "AI-powered customer engagement for Monaco & Côte d'Azur venues",
    siteName: "MonaConcierge",
    locale: "fr_FR",
    type: "website",
    url: BASE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "MonaConcierge",
    description:
      "AI-powered customer engagement for Monaco & Côte d'Azur venues",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} ${cormorant.variable} ${inter.className}`}>{children}</body>
    </html>
  );
}
