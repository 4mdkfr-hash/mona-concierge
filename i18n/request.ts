import { getRequestConfig } from "next-intl/server";
import { routing } from "../i18n";

export default getRequestConfig(async ({ locale }) => {
  const resolvedLocale: string = routing.locales.includes(locale as "fr" | "en" | "ru")
    ? (locale as string)
    : routing.defaultLocale;

  return {
    locale: resolvedLocale,
    messages: (await import(`../messages/${resolvedLocale}.json`)).default,
  };
});
