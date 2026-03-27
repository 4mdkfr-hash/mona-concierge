export interface WeeklyReportStats {
  venueName: string;
  venueType: string;
  messageCount: number;
  bookingsMade: number;
  upsellsSent: number;
  avgRating: number | null;
  ratingDelta: number | null;
}

export function buildRecommendationsPrompt(
  stats: WeeklyReportStats,
  language: "fr" | "en" | "ru"
): string {
  const langLabel = { fr: "French", en: "English", ru: "Russian" }[language];

  return (
    `You are a business advisor for a ${stats.venueType} in Monaco.\n` +
    `Based on last week data: ${stats.messageCount} messages, ` +
    `${stats.bookingsMade} bookings, ${stats.upsellsSent} follow-ups, ` +
    (stats.avgRating !== null ? `rating ${stats.avgRating}` : "no rating data") +
    `.\n` +
    `Generate exactly 3 concise, actionable recommendations for this week.\n` +
    `Language: ${langLabel}. Format: numbered list, max 20 words each. Plain text only.`
  );
}

function fmt(date: Date, lang: "fr" | "en" | "ru"): string {
  const locale = lang === "fr" ? "fr-FR" : lang === "ru" ? "ru-RU" : "en-GB";
  return date.toLocaleDateString(locale, { day: "numeric", month: "long" });
}

export function formatWeeklyReport(
  stats: WeeklyReportStats,
  recommendations: string,
  periodStart: Date,
  periodEnd: Date,
  language: "fr" | "en" | "ru"
): string {
  const dateRange = `${fmt(periodStart, language)} – ${fmt(periodEnd, language)}`;
  const ratingStr =
    stats.avgRating !== null
      ? `${stats.avgRating}${stats.ratingDelta !== null && stats.ratingDelta !== 0 ? ` _(${stats.ratingDelta > 0 ? "+" : ""}${stats.ratingDelta})_` : ""}`
      : "—";

  if (language === "fr") {
    return (
      `*📊 Rapport hebdomadaire — ${stats.venueName}*\n` +
      `_${dateRange}_\n\n` +
      `💬 *Messages reçus :* ${stats.messageCount}\n` +
      `📅 *Réservations :* ${stats.bookingsMade}\n` +
      `🎁 *Relances envoyées :* ${stats.upsellsSent}\n` +
      `⭐ *Note Google :* ${ratingStr}\n\n` +
      `*🤖 Recommandations IA :*\n${recommendations}\n\n` +
      `_Répondez STOP pour vous désabonner._`
    );
  }

  if (language === "ru") {
    return (
      `*📊 Недельный отчёт — ${stats.venueName}*\n` +
      `_${dateRange}_\n\n` +
      `💬 *Сообщений:* ${stats.messageCount}\n` +
      `📅 *Записей:* ${stats.bookingsMade}\n` +
      `🎁 *Follow-up отправлено:* ${stats.upsellsSent}\n` +
      `⭐ *Рейтинг Google:* ${ratingStr}\n\n` +
      `*🤖 Рекомендации ИИ:*\n${recommendations}\n\n` +
      `_Ответьте СТОП для отписки._`
    );
  }

  // English (default)
  return (
    `*📊 Weekly Report — ${stats.venueName}*\n` +
    `_${dateRange}_\n\n` +
    `💬 *Messages received:* ${stats.messageCount}\n` +
    `📅 *Bookings made:* ${stats.bookingsMade}\n` +
    `🎁 *Follow-ups sent:* ${stats.upsellsSent}\n` +
    `⭐ *Google rating:* ${ratingStr}\n\n` +
    `*🤖 AI Recommendations:*\n${recommendations}\n\n` +
    `_Reply STOP to unsubscribe._`
  );
}
