import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { createCalendarEvent } from "@/lib/google-calendar";
import { sendTextMessage } from "@/lib/whatsapp";

interface CreateBookingBody {
  venueId: string;
  customerName: string;
  customerPhone: string;
  customerChannel?: string;
  serviceType?: string;
  /** ISO 8601 start datetime */
  bookedAt: string;
  /** Duration in minutes — defaults to 60 */
  durationMinutes?: number;
  notes?: string;
  partySize?: number;
  conversationId?: string;
}

export async function POST(req: NextRequest) {
  const body: CreateBookingBody = await req.json();

  const {
    venueId,
    customerName,
    customerPhone,
    customerChannel = "whatsapp",
    serviceType,
    bookedAt,
    durationMinutes = 60,
    notes,
    partySize,
    conversationId,
  } = body;

  if (!venueId || !customerPhone || !bookedAt) {
    return NextResponse.json(
      { error: "venueId, customerPhone, and bookedAt are required" },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();

  // Fetch venue to build calendar event title
  const { data: venue } = await supabase
    .from("venues")
    .select("id, name, timezone")
    .eq("id", venueId)
    .single();

  if (!venue) {
    return NextResponse.json({ error: "Venue not found" }, { status: 404 });
  }

  const startDt = new Date(bookedAt);
  const endDt = new Date(startDt.getTime() + durationMinutes * 60_000);

  // Create Google Calendar event
  let googleEventId: string | null = null;
  try {
    googleEventId = await createCalendarEvent({
      title: `${serviceType ?? "Booking"} — ${customerName} (${customerPhone})`,
      start: startDt.toISOString(),
      end: endDt.toISOString(),
      description: [
        `Venue: ${venue.name}`,
        serviceType ? `Service: ${serviceType}` : null,
        partySize ? `Party size: ${partySize}` : null,
        notes ? `Notes: ${notes}` : null,
      ]
        .filter(Boolean)
        .join("\n"),
      location: venue.name,
    });
  } catch (err) {
    console.error("Google Calendar error:", err);
    // Non-fatal — continue without calendar event
  }

  // Persist booking
  const { data: booking, error: dbError } = await supabase
    .from("bookings")
    .insert({
      venue_id: venueId,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_channel: customerChannel,
      service_type: serviceType ?? null,
      booked_at: startDt.toISOString(),
      google_event_id: googleEventId,
      status: "confirmed",
      confirmation_sent: false,
      notes: notes ?? null,
      party_size: partySize ?? null,
      conversation_id: conversationId ?? null,
    })
    .select("id")
    .single();

  if (dbError || !booking) {
    console.error("DB insert error:", dbError);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }

  // Send WhatsApp confirmation
  let confirmationSent = false;
  try {
    const dateStr = startDt.toLocaleString("fr-FR", {
      timeZone: "Europe/Monaco",
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
    const confirmText =
      `✅ Votre réservation chez *${venue.name}* est confirmée !\n` +
      `📅 ${dateStr}\n` +
      (serviceType ? `🛎️ ${serviceType}\n` : "") +
      `\nÀ bientôt ! 🙏`;

    await sendTextMessage(customerPhone, confirmText);
    confirmationSent = true;

    await supabase
      .from("bookings")
      .update({ confirmation_sent: true })
      .eq("id", booking.id);
  } catch (err) {
    console.error("WhatsApp confirmation error:", err);
    // Non-fatal
  }

  return NextResponse.json({
    bookingId: booking.id,
    googleEventId,
    confirmationSent,
  });
}
