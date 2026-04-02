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
  const status = searchParams.get("status");

  if (!venueId) {
    return NextResponse.json({ error: "venueId required" }, { status: 400 });
  }

  const { authorized } = await authorizeVenue(user.id, venueId);
  if (!authorized) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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
      ai_enabled,
      needs_attention,
      messages (
        id,
        direction,
        content,
        created_at,
        ai_generated
      )
    `
    )
    .eq("venue_id", venueId)
    .order("needs_attention", { ascending: false })
    .order("last_message_at", { ascending: false })
    .limit(50);

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
