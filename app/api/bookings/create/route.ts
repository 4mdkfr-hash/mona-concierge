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

  // Email notification for new booking
  try {
    const { data: venueEmail } = await supabase
      .from("venues")
      .select("owner_email, email_notifications_enabled, email_notify_bookings")
      .eq("id", venueId)
      .single();

    if (venueEmail?.owner_email && venueEmail.email_notifications_enabled && venueEmail.email_notify_bookings) {
      const { sendNewBookingNotification } = await import("@/lib/email");
      await sendNewBookingNotification({
        ownerEmail: venueEmail.owner_email,
        venueName: venue.name,
        customerName,
        customerPhone: customerPhone ?? null,
        service: serviceType ?? "Booking",
        dateTime: startDt.toLocaleString("fr-FR", { timeZone: "Europe/Monaco", weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }),
      });
    }
  } catch (err) {
    console.error("Email booking notification error:", err);
    // Non-fatal
  }

  // Schedule follow-up events for this booking
  let followUpEventsCreated = 0;
  try {
    // Determine customer language from conversation (fallback: 'fr')
    let language: 'fr' | 'en' | 'ru' = 'fr';
    if (conversationId) {
      const { data: conv } = await supabase
        .from('conversations')
        .select('language')
        .eq('id', conversationId)
        .single();
      if (conv?.language && ['fr', 'en', 'ru'].includes(conv.language)) {
        language = conv.language as 'fr' | 'en' | 'ru';
      }
    }

    // Look up active upsell mappings for this venue + service type
    const { data: mappings } = serviceType
      ? await supabase
          .from('upsell_mappings')
          .select('id, event_type, fire_offset_hours')
          .eq('venue_id', venueId)
          .eq('trigger_service', serviceType)
          .eq('active', true)
      : { data: [] };

    const channelId = customerPhone; // WhatsApp uses phone as channel id
    const validChannel = ['whatsapp', 'instagram', 'google_bm'].includes(customerChannel)
      ? customerChannel
      : 'whatsapp';

    // Build events from mappings; if none found, create default pre/post events
    const eventsToInsert: Array<{
      venue_id: string;
      booking_id: string;
      conversation_id: string | null;
      upsell_mapping_id: string | null;
      event_type: string;
      fire_at: string;
      customer_name: string | null;
      customer_phone: string | null;
      customer_channel: string;
      customer_channel_id: string;
      language: string;
    }> = [];

    if (mappings && mappings.length > 0) {
      for (const mapping of mappings) {
        const fireAt = new Date(
          startDt.getTime() + mapping.fire_offset_hours * 60 * 60 * 1000
        );
        // Skip events that would fire in the past
        if (fireAt <= new Date()) continue;
        eventsToInsert.push({
          venue_id: venueId,
          booking_id: booking.id,
          conversation_id: conversationId ?? null,
          upsell_mapping_id: mapping.id,
          event_type: mapping.event_type,
          fire_at: fireAt.toISOString(),
          customer_name: customerName ?? null,
          customer_phone: customerPhone,
          customer_channel: validChannel,
          customer_channel_id: channelId,
          language,
        });
      }
    } else {
      // No mappings configured — create generic pre-visit (24h before) and post-visit (2h after)
      const preVisitAt = new Date(startDt.getTime() - 24 * 60 * 60 * 1000);
      const postVisitAt = new Date(endDt.getTime() + 2 * 60 * 60 * 1000);

      if (preVisitAt > new Date()) {
        eventsToInsert.push({
          venue_id: venueId,
          booking_id: booking.id,
          conversation_id: conversationId ?? null,
          upsell_mapping_id: null,
          event_type: 'pre_visit_upsell',
          fire_at: preVisitAt.toISOString(),
          customer_name: customerName ?? null,
          customer_phone: customerPhone,
          customer_channel: validChannel,
          customer_channel_id: channelId,
          language,
        });
      }
      eventsToInsert.push({
        venue_id: venueId,
        booking_id: booking.id,
        conversation_id: conversationId ?? null,
        upsell_mapping_id: null,
        event_type: 'post_visit_cross_sell',
        fire_at: postVisitAt.toISOString(),
        customer_name: customerName ?? null,
        customer_phone: customerPhone,
        customer_channel: validChannel,
        customer_channel_id: channelId,
        language,
      });
    }

    if (eventsToInsert.length > 0) {
      const { error: evErr } = await supabase
        .from('follow_up_events')
        .insert(eventsToInsert);
      if (evErr) {
        console.error('follow_up_events insert error:', evErr);
      } else {
        followUpEventsCreated = eventsToInsert.length;
      }
    }
  } catch (err) {
    console.error('Follow-up scheduling error:', err);
    // Non-fatal — booking is already confirmed
  }

  return NextResponse.json({
    bookingId: booking.id,
    googleEventId,
    confirmationSent,
    followUpEventsCreated,
  });
}
