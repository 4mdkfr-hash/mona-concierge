import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const venueId = searchParams.get("venueId");

  if (!venueId) {
    return NextResponse.json({ error: "venueId required" }, { status: 400 });
  }

  const supabase = createServiceClient();

  const [openConversations, unrepliedReviews, upcomingBookings] =
    await Promise.all([
      supabase
        .from("conversations")
        .select("id", { count: "exact" })
        .eq("venue_id", venueId)
        .eq("status", "open"),
      supabase
        .from("google_reviews")
        .select("id", { count: "exact" })
        .eq("venue_id", venueId)
        .is("reply_text", null),
      supabase
        .from("bookings")
        .select("id", { count: "exact" })
        .eq("venue_id", venueId)
        .eq("status", "confirmed")
        .gte("booked_at", new Date().toISOString()),
    ]);

  return NextResponse.json({
    openConversations: openConversations.count ?? 0,
    unrepliedReviews: unrepliedReviews.count ?? 0,
    upcomingBookings: upcomingBookings.count ?? 0,
  });
}
