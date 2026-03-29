import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const venueId = searchParams.get("venueId");

  const supabase = createServiceClient();

  let query = supabase
    .from("bookings")
    .select("id, customer_name, customer_phone, booked_at, party_size, status, customer_channel, notes, created_at")
    .order("booked_at", { ascending: false })
    .limit(100);

  if (venueId) {
    query = query.eq("venue_id", venueId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const bookings = (data ?? []).map((b) => {
    const dt = new Date(b.booked_at);
    return {
      id: b.id,
      customer_name: b.customer_name ?? "Guest",
      customer_phone: b.customer_phone ?? null,
      date: dt.toISOString().split("T")[0],
      time: dt.toTimeString().slice(0, 5),
      party_size: b.party_size ?? 2,
      status: b.status,
      channel: b.customer_channel ?? "whatsapp",
      notes: b.notes ?? null,
      created_at: b.created_at,
    };
  });

  return NextResponse.json(bookings);
}
