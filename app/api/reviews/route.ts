import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const venueId = searchParams.get("venueId");

  const supabase = createServiceClient();

  let query = supabase
    .from("google_reviews")
    .select("id, venue_id, review_id, author_name, rating, content, reply_text, replied_at, sentiment, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (venueId) {
    query = query.eq("venue_id", venueId);
  }

  const { data, error } = await query;

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
