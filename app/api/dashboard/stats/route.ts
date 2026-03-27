import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

function startOf(unit: "day" | "week" | "month"): string {
  const now = new Date();
  if (unit === "day") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  }
  if (unit === "week") {
    const day = now.getDay(); // 0=Sun
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Mon
    return new Date(now.getFullYear(), now.getMonth(), diff).toISOString();
  }
  // month
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const venueId = searchParams.get("venueId");

  if (!venueId) {
    return NextResponse.json({ error: "venueId required" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const now = new Date().toISOString();

  // Run all queries in parallel
  const [
    openConversations,
    resolvedConversations,
    unrepliedReviews,
    upcomingBookings,
    allConversations,
    allReviews,
    msgsToday,
    msgsWeek,
    msgsMonth,
  ] = await Promise.all([
    // Conversations: open count
    supabase
      .from("conversations")
      .select("id", { count: "exact", head: true })
      .eq("venue_id", venueId)
      .eq("status", "open"),

    // Conversations: resolved count
    supabase
      .from("conversations")
      .select("id", { count: "exact", head: true })
      .eq("venue_id", venueId)
      .eq("status", "resolved"),

    // Reviews: unreplied
    supabase
      .from("google_reviews")
      .select("id", { count: "exact", head: true })
      .eq("venue_id", venueId)
      .is("reply_text", null),

    // Bookings: upcoming
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("venue_id", venueId)
      .eq("status", "confirmed")
      .gte("booked_at", now),

    // All conversations: channel + language breakdown
    supabase
      .from("conversations")
      .select("channel, language")
      .eq("venue_id", venueId),

    // All reviews: rating + replied_at
    supabase
      .from("google_reviews")
      .select("rating, reply_text, replied_at")
      .eq("venue_id", venueId),

    // Messages today (via conversation join)
    supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startOf("day"))
      .in(
        "conversation_id",
        (
          await supabase
            .from("conversations")
            .select("id")
            .eq("venue_id", venueId)
        ).data?.map((c) => c.id) ?? []
      ),

    // Messages this week
    supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startOf("week"))
      .in(
        "conversation_id",
        (
          await supabase
            .from("conversations")
            .select("id")
            .eq("venue_id", venueId)
        ).data?.map((c) => c.id) ?? []
      ),

    // Messages this month
    supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startOf("month"))
      .in(
        "conversation_id",
        (
          await supabase
            .from("conversations")
            .select("id")
            .eq("venue_id", venueId)
        ).data?.map((c) => c.id) ?? []
      ),
  ]);

  // Channel breakdown
  const channelMap: Record<string, number> = {};
  for (const conv of allConversations.data ?? []) {
    const ch = conv.channel as string;
    channelMap[ch] = (channelMap[ch] ?? 0) + 1;
  }

  // Language breakdown
  const langMap: Record<string, number> = {};
  const totalWithLang = (allConversations.data ?? []).filter((c) => c.language).length;
  for (const conv of allConversations.data ?? []) {
    const lang = (conv.language as string) ?? "unknown";
    langMap[lang] = (langMap[lang] ?? 0) + 1;
  }
  const langBreakdown: Record<string, number> = {};
  for (const [lang, count] of Object.entries(langMap)) {
    langBreakdown[lang] = totalWithLang > 0 ? Math.round((count / totalWithLang) * 100) : 0;
  }

  // Reviews stats
  const reviews = allReviews.data ?? [];
  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? Math.round((reviews.reduce((s, r) => s + (r.rating as number), 0) / totalReviews) * 10) / 10
      : null;
  const repliedReviews = reviews.filter((r) => r.reply_text).length;
  const replyRate = totalReviews > 0 ? Math.round((repliedReviews / totalReviews) * 100) : 0;

  return NextResponse.json({
    conversations: {
      open: openConversations.count ?? 0,
      resolved: resolvedConversations.count ?? 0,
    },
    messages: {
      today: msgsToday.count ?? 0,
      thisWeek: msgsWeek.count ?? 0,
      thisMonth: msgsMonth.count ?? 0,
    },
    channels: channelMap,
    languages: langBreakdown,
    reviews: {
      total: totalReviews,
      avgRating,
      unreplied: unrepliedReviews.count ?? 0,
      replyRate,
    },
    bookings: {
      upcoming: upcomingBookings.count ?? 0,
    },
  });
}
