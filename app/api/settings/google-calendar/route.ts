import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { authenticateRequest, authorizeVenue } from "@/lib/auth";

/**
 * GET  /api/settings/google-calendar?venueId=... — get connection status
 * POST /api/settings/google-calendar               — save tokens (callback)
 * DELETE /api/settings/google-calendar?venueId=... — disconnect
 */

export async function GET(req: NextRequest) {
  const { user } = await authenticateRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const venueId = new URL(req.url).searchParams.get("venueId");
  if (!venueId) return NextResponse.json({ error: "venueId required" }, { status: 400 });

  const { authorized } = await authorizeVenue(user.id, venueId);
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const supabase = createServiceClient();
  const { data } = await supabase
    .from("venues")
    .select("google_calendar_refresh_token, google_calendar_id")
    .eq("id", venueId)
    .single();

  return NextResponse.json({
    connected: !!data?.google_calendar_refresh_token,
    calendarId: data?.google_calendar_id ?? "primary",
  });
}

export async function POST(req: NextRequest) {
  const { user } = await authenticateRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { venueId, refreshToken, calendarId } = await req.json();
  if (!venueId || !refreshToken) {
    return NextResponse.json({ error: "venueId and refreshToken required" }, { status: 400 });
  }

  const { authorized } = await authorizeVenue(user.id, venueId);
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("venues")
    .update({
      google_calendar_refresh_token: refreshToken,
      google_calendar_id: calendarId ?? "primary",
    })
    .eq("id", venueId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ status: "connected" });
}

export async function DELETE(req: NextRequest) {
  const { user } = await authenticateRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const venueId = new URL(req.url).searchParams.get("venueId");
  if (!venueId) return NextResponse.json({ error: "venueId required" }, { status: 400 });

  const { authorized } = await authorizeVenue(user.id, venueId);
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const supabase = createServiceClient();
  await supabase
    .from("venues")
    .update({ google_calendar_refresh_token: null })
    .eq("id", venueId);

  return NextResponse.json({ status: "disconnected" });
}
