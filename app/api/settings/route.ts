import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

// For demo, use the first demo venue id from seed data
const DEMO_VENUE_ID = "00000000-0000-0000-0000-000000000001";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const venueId = searchParams.get("venueId") ?? DEMO_VENUE_ID;

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("venues")
    .select("owner_email, email_notifications_enabled, email_notify_messages, email_notify_bookings, email_notify_negative_reviews")
    .eq("id", venueId)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? {});
}

export async function PATCH(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const venueId = searchParams.get("venueId") ?? DEMO_VENUE_ID;

  const body = await req.json();
  const allowed = ["owner_email", "email_notifications_enabled", "email_notify_messages", "email_notify_bookings", "email_notify_negative_reviews"];
  const update: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) update[key] = body[key];
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("venues")
    .update(update)
    .eq("id", venueId)
    .select("owner_email, email_notifications_enabled, email_notify_messages, email_notify_bookings, email_notify_negative_reviews")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
