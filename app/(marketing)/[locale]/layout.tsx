import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { routing } from "@/i18n";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://monaconcierge.com";

const META: Record<string, { title: string; description: string; ogLocale: string }> = {
  fr: {
    title: "MonaConcierge — Concierge IA pour restaurants, salons et boutiques à Monaco",
    description:
      "Répondez à chaque client en moins de 5 secondes, 24h/24, en français, anglais et russe. La solution IA pour les établissements d'exception à Monaco et sur la Côte d'Azur.",
    ogLocale: "fr_FR",
  },
  en: {
    title: "MonaConcierge — AI Concierge for Restaurants, Salons & Boutiques in Monaco",
    description:
      "Reply to every guest in under 5 seconds, 24/7, in French, English and Russian. The AI platform built for Monaco's finest establishments.",
    ogLocale: "en_GB",
  },
  ru: {
    title: "MonaConcierge — ИИ-консьерж для ресторанов, салонов и бутиков в Монако",
    description:
      "Отвечайте каждому гостю менее чем за 5 секунд, круглосуточно, на французском, английском и русском. Платформа для премиальных заведений Монако.",
    ogLocale: "ru_RU",
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const locale = params.locale as "fr" | "en" | "ru";
  const meta = META[locale] ?? META.fr;

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages: {
        fr: `${BASE_URL}/fr`,
        en: `${BASE_URL}/en`,
        ru: `${BASE_URL}/ru`,
        "x-default": `${BASE_URL}/fr`,
      },
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `${BASE_URL}/${locale}`,
      siteName: "MonaConcierge",
      locale: meta.ogLocale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
    },
  };
}

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      name: "MonaConcierge",
      url: BASE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/icon.png`,
      },
    },
    {
      "@type": "LocalBusiness",
      "@id": `${BASE_URL}/#localbusiness`,
      name: "MonaConcierge",
      description:
        "AI-powered concierge platform for restaurants, salons and boutiques in Monaco and the Côte d'Azur. Multilingual responses in French, English and Russian, 24/7.",
      url: BASE_URL,
      areaServed: [
        { "@type": "City", name: "Monaco" },
        { "@type": "Place", name: "Côte d'Azur" },
      ],
      address: {
        "@type": "PostalAddress",
        addressCountry: "MC",
      },
      priceRange: "€€€",
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${BASE_URL}/#product`,
      name: "MonaConcierge",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        name: "Essential",
        price: "200",
        priceCurrency: "EUR",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: "200",
          priceCurrency: "EUR",
          billingDuration: 1,
          billingIncrement: 1,
          unitText: "MON",
        },
        eligibleRegion: [
          { "@type": "Place", name: "Monaco" },
          { "@type": "Place", name: "France" },
        ],
      },
    },
  ],
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;
  if (!routing.locales.includes(locale as "fr" | "en" | "ru")) {
    notFound();
  }

  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </NextIntlClientProvider>
  );
}
