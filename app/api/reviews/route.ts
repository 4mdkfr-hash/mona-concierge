import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { authenticateRequest, authorizeVenue } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { user } = await authenticateRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const venueId = searchParams.get("venueId");

  if (!venueId) {
    return NextResponse.json({ error: "venueId required" }, { status: 400 });
  }

  const { authorized } = await authorizeVenue(user.id, venueId);
  if (!authorized) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("google_reviews")
    .select("id, venue_id, review_id, author_name, rating, content, reply_text, replied_at, sentiment, created_at")
    .eq("venue_id", venueId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const reviews = (data ?? []).map((r) => ({
    id: r.id,
    venue_id: r.venue_id,
    author_name: r.author_name ?? "Anonymous",
    rating: r.rating,
    text: r.content ?? "",
    ai_reply: r.reply_text ?? null,
    reply_status: r.replied_at ? "replied" : "pending",
    sentiment: r.sentiment ?? "neutral",
    created_at: r.created_at,
  }));

  return NextResponse.json(reviews);
}
