import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const venueId = searchParams.get("venueId");

  if (!venueId) {
    return NextResponse.json({ error: "venueId required" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("client_profiles")
    .select("id, phone, full_name, preferred_name, language, favourite_services, disliked_services, allergies, notes, visit_count, last_visit_at, last_service, vip_tier, created_at")
    .eq("venue_id", venueId)
    .order("last_visit_at", { ascending: false, nullsFirst: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
