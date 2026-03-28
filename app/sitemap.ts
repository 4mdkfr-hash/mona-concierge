import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://monaconcierge.com";
const locales = ["fr", "en", "ru"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    { path: "", priority: 1.0 as const },
    { path: "/demo", priority: 0.7 as const },
  ];

  return locales.flatMap((locale) =>
    pages.map(({ path, priority }) => ({
      url: `${BASE_URL}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority,
    }))
  );
}
