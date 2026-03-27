/**
 * Weekly WhatsApp report cron handler — MON-23
 * Schedule: every Monday at 09:00 UTC (vercel.json)
 * Auth: Bearer CRON_SECRET header
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { generateReply } from "@/lib/claude";
import { sendTextMessage } from "@/lib/whatsapp";
import {
  buildRecommendationsPrompt,
  formatWeeklyReport,
  type WeeklyReportStats,
} from "@/lib/weekly-report-prompts";

const CRON_SECRET = process.env.CRON_SECRET ?? "";
const BATCH_SIZE = 20;

function getPeriod(): { periodStart: Date; periodEnd: Date } {
  const now = new Date();
  // period_end = this Monday 00:00 UTC
  const endDay = new Date(now);
  endDay.setUTCHours(0, 0, 0, 0);
  const dayOfWeek = endDay.getUTCDay(); // 0=Sun,1=Mon
  endDay.setUTCDate(endDay.getUTCDate() - ((dayOfWeek + 6) % 7)); // roll to Monday

  const periodEnd = new Date(endDay);
  const periodStart = new Date(endDay);
  periodStart.setUTCDate(periodStart.getUTCDate() - 7);

  return { periodStart, periodEnd };
}

export async function POST(req: NextRequest) {
  // Auth
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace("Bearer ", "");
  if (!CRON_SECRET || token !== CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { periodStart, periodEnd } = getPeriod();

  // Fetch opted-in venues (cap at BATCH_SIZE)
  const { data: venues, error: venueErr } = await supabase
    .from("venues")
    .select("id, name, type, owner_phone, owner_language")
    .eq("subscription_status", "active")
    .eq("weekly_report_enabled", true)
    .not("owner_phone", "is", null)
    .limit(BATCH_SIZE);

  if (venueErr || !venues) {
    return NextResponse.json({ error: "Failed to fetch venues" }, { status: 500 });
  }

  let processed = 0;
  let failed = 0;

  for (const venue of venues) {
    const lang = ((venue.owner_language as string) ?? "fr") as "fr" | "en" | "ru";

    try {
      // --- Aggregate stats ---
      const [msgResult, bookingResult, upsellResult, prevRatingResult, currRatingResult] =
        await Promise.all([
          // Inbound message count this week
          supabase
            .from("messages")
            .select("id", { count: "exact", head: true })
            .eq("direction", "inbound")
            .gte("created_at", periodStart.toISOString())
            .lt("created_at", periodEnd.toISOString())
            .in(
              "conversation_id",
              (await supabase.from("conversations").select("id").eq("venue_id", venue.id))
                .data?.map((c) => c.id) ?? []
            ),

          // Bookings this week
          supabase
            .from("bookings")
            .select("id", { count: "exact", head: true })
            .eq("venue_id", venue.id)
            .gte("created_at", periodStart.toISOString())
            .lt("created_at", periodEnd.toISOString()),

          // Upsell/follow-up events sent this week
          supabase
            .from("follow_up_events")
            .select("id", { count: "exact", head: true })
            .eq("venue_id", venue.id)
            .eq("status", "sent")
            .gte("fired_at", periodStart.toISOString())
            .lt("fired_at", periodEnd.toISOString()),

          // Avg rating previous 7 days (for delta)
          supabase
            .from("google_reviews")
            .select("rating")
            .eq("venue_id", venue.id)
            .gte(
              "created_at",
              new Date(periodStart.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
            )
            .lt("created_at", periodStart.toISOString()),

          // Avg rating this week
          supabase
            .from("google_reviews")
            .select("rating")
            .eq("venue_id", venue.id)
            .gte("created_at", periodStart.toISOString())
            .lt("created_at", periodEnd.toISOString()),
        ]);

      const calcAvg = (rows: Array<{ rating: number }> | null): number | null => {
        if (!rows || rows.length === 0) return null;
        return Math.round((rows.reduce((s, r) => s + r.rating, 0) / rows.length) * 100) / 100;
      };

      const avgRating = calcAvg(currRatingResult.data as Array<{ rating: number }> | null);
      const prevAvg = calcAvg(prevRatingResult.data as Array<{ rating: number }> | null);
      const ratingDelta =
        avgRating !== null && prevAvg !== null
          ? Math.round((avgRating - prevAvg) * 100) / 100
          : null;

      const stats: WeeklyReportStats = {
        venueName: venue.name as string,
        venueType: (venue.type as string) ?? "business",
        messageCount: msgResult.count ?? 0,
        bookingsMade: bookingResult.count ?? 0,
        upsellsSent: upsellResult.count ?? 0,
        avgRating,
        ratingDelta,
      };

      // --- AI recommendations ---
      const systemPrompt = buildRecommendationsPrompt(stats, lang);
      const { text: recommendations } = await generateReply({
        systemPrompt,
        messages: [{ role: "user", content: "Generate the 3 recommendations now." }],
        maxTokens: 300,
      });

      // --- Format message ---
      const reportText = formatWeeklyReport(
        stats,
        recommendations,
        periodStart,
        periodEnd,
        lang
      );

      // --- Send WhatsApp ---
      const whatsappMessageId = await sendTextMessage(venue.owner_phone as string, reportText);

      // --- Log to DB ---
      await supabase.from("weekly_reports").insert({
        venue_id: venue.id,
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
        message_count: stats.messageCount,
        bookings_made: stats.bookingsMade,
        upsells_sent: stats.upsellsSent,
        avg_rating: avgRating,
        rating_delta: ratingDelta,
        ai_recommendations: recommendations,
        report_text: reportText,
        whatsapp_message_id: whatsappMessageId,
        status: "sent",
        sent_at: new Date().toISOString(),
      });

      processed++;
    } catch (err) {
      console.error(`Weekly report failed for venue ${venue.id}:`, err);
      failed++;

      // Log failure
      await supabase.from("weekly_reports").insert({
        venue_id: venue.id,
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
        message_count: 0,
        bookings_made: 0,
        upsells_sent: 0,
        status: "failed",
        error_message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return NextResponse.json({ processed, failed });
}
