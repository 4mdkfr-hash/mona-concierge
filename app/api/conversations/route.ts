import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const venueId = searchParams.get("venueId");
  const status = searchParams.get("status") ?? "open";

  const supabase = createServiceClient();

  let query = supabase
    .from("conversations")
    .select(
      `
      id,
      channel,
      customer_id,
      customer_name,
      customer_phone,
      status,
      last_message_at,
      messages (
        id,
        direction,
        content,
        created_at,
        ai_generated
      )
    `
    )
    .eq("status", status)
    .order("last_message_at", { ascending: false })
    .limit(50);

  if (venueId) {
    query = query.eq("venue_id", venueId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
