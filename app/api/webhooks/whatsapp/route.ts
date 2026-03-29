import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { generateReply, CLAUDE_MODEL, estimateCostEur } from "@/lib/claude";
import {
  sendTextMessage,
  markMessageRead,
  type WhatsAppWebhookBody,
  type WhatsAppMessage,
} from "@/lib/whatsapp";

const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID;

interface BookingIntent {
  intent: "booking";
  name: string;
  date: string;
  time: string;
  guests: number;
}

function extractBookingIntent(text: string): BookingIntent | null {
  const jsonMatch = text.match(/\{[^{}]*"intent"\s*:\s*"booking"[^{}]*\}/);
  if (!jsonMatch) return null;
  try {
    const parsed = JSON.parse(jsonMatch[0]);
    if (
      parsed.intent === "booking" &&
      parsed.name &&
      parsed.date &&
      parsed.time &&
      parsed.guests
    ) {
      return parsed as BookingIntent;
    }
  } catch {
    // not valid JSON
  }
  return null;
}

// GET: Meta WhatsApp webhook verification
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// POST: Incoming WhatsApp messages (Twilio or Meta)
export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") ?? "";

  // Twilio sends form-encoded data
  if (TWILIO_SID && contentType.includes("application/x-www-form-urlencoded")) {
    return handleTwilioWebhook(req);
  }

  // Meta sends JSON
  return handleMetaWebhook(req);
}

// ─── TWILIO HANDLER ─────────────────────────────────

async function handleTwilioWebhook(req: NextRequest) {
  const formData = await req.formData();
  const from = (formData.get("From") as string) ?? "";
  const body = (formData.get("Body") as string) ?? "";
  const profileName = (formData.get("ProfileName") as string) ?? null;
  const messageSid = (formData.get("MessageSid") as string) ?? "";

  // Strip "whatsapp:" prefix → phone number
  const phone = from.replace("whatsapp:", "");

  if (!body.trim()) {
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      { headers: { "Content-Type": "text/xml" } }
    );
  }

  const supabase = createServiceClient();

  // STOP opt-out
  if (/^(STOP|СТОП)$/i.test(body.trim())) {
    await supabase
      .from("venues")
      .update({ weekly_report_enabled: false })
      .eq("owner_phone", phone);

    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      { headers: { "Content-Type": "text/xml" } }
    );
  }

  // Find venue — for sandbox testing, use the first active venue
  const { data: channel } = await supabase
    .from("venue_channels")
    .select("venue_id")
    .eq("channel", "whatsapp")
    .limit(1)
    .single();

  // Fallback: get any venue if no channel configured
  let venueId: string;
  if (channel) {
    venueId = channel.venue_id;
  } else {
    const { data: venue } = await supabase
      .from("venues")
      .select("id")
      .limit(1)
      .single();

    if (!venue) {
      console.error("No venues found in database");
      return new NextResponse(
        '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
        { headers: { "Content-Type": "text/xml" } }
      );
    }
    venueId = venue.id;
  }

  // Upsert conversation
  const { data: conversation } = await supabase
    .from("conversations")
    .upsert(
      {
        venue_id: venueId,
        channel: "whatsapp",
        customer_id: phone,
        customer_name: profileName,
        customer_phone: phone,
        last_message_at: new Date().toISOString(),
        status: "open",
      },
      { onConflict: "venue_id,channel,customer_id", ignoreDuplicates: false }
    )
    .select("id")
    .single();

  if (!conversation) {
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      { headers: { "Content-Type": "text/xml" } }
    );
  }

  // Save inbound message
  await supabase.from("messages").insert({
    conversation_id: conversation.id,
    direction: "inbound",
    content: body,
    ai_generated: false,
    status: "delivered",
    external_message_id: messageSid,
  });

  // Email notification for new inbound message
  try {
    const { data: venueEmail } = await supabase
      .from("venues")
      .select("name, owner_email, email_notifications_enabled, email_notify_messages")
      .eq("id", venueId)
      .single();

    if (venueEmail?.owner_email && venueEmail.email_notifications_enabled && venueEmail.email_notify_messages) {
      const { sendNewMessageNotification } = await import("@/lib/email");
      await sendNewMessageNotification({
        ownerEmail: venueEmail.owner_email,
        venueName: venueEmail.name,
        customerName: profileName ?? phone,
        channel: "WhatsApp",
        messageSummary: body.length > 120 ? body.slice(0, 120) + "…" : body,
      });
    }
  } catch (err) {
    console.error("Email message notification error:", err);
    // Non-fatal
  }

  // Generate AI response and send directly
  try {
    // Load venue info
    const { data: venue } = await supabase
      .from("venues")
      .select("name, type, tone_brief, languages")
      .eq("id", venueId)
      .single();

    if (venue) {
      // Load active services for AI context
      const { data: services } = await supabase
        .from("venue_services")
        .select("name, price, duration_minutes, category")
        .eq("venue_id", venueId)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      const servicesText =
        services && services.length > 0
          ? `\nOur services:\n${services
              .map(
                (s) =>
                  `- ${s.name} — €${s.price}, ${s.duration_minutes} min (${s.category})`
              )
              .join("\n")}`
          : "";

      // Load VIP client profile
      const { data: clientProfile } = await supabase
        .from("client_profiles")
        .select("full_name, preferred_name, favourite_services, allergies, notes, visit_count, last_service, vip_tier")
        .eq("venue_id", venueId)
        .eq("phone", phone)
        .single();

      let vipContext = "";
      if (clientProfile && clientProfile.visit_count > 0) {
        const name = clientProfile.preferred_name ?? clientProfile.full_name;
        vipContext = `\n\n## Client Context`;
        if (name) vipContext += `\nName: ${name}`;
        vipContext += `\nVisits: ${clientProfile.visit_count}`;
        if (clientProfile.last_service) vipContext += `\nLast service: ${clientProfile.last_service}`;
        if (clientProfile.favourite_services?.length > 0)
          vipContext += `\nFavourite services: ${clientProfile.favourite_services.join(", ")}`;
        if (clientProfile.allergies?.length > 0)
          vipContext += `\n⚠️ Allergies: ${clientProfile.allergies.join(", ")}`;
        if (clientProfile.notes) vipContext += `\nStaff notes: ${clientProfile.notes}`;
        if (clientProfile.vip_tier !== "standard")
          vipContext += `\nTier: ${clientProfile.vip_tier.toUpperCase()}`;
      }

      // Load recent messages for context
      const { data: messages } = await supabase
        .from("messages")
        .select("direction, content")
        .eq("conversation_id", conversation.id)
        .order("created_at", { ascending: true })
        .limit(20);

      const history = (messages ?? []).map((m) => ({
        role: m.direction === "inbound" ? ("user" as const) : ("assistant" as const),
        content: m.content,
      }));

      const langs = (venue.languages as string[]).join(", ");
      const systemPrompt = `You are a friendly AI concierge for ${venue.name}, a ${venue.type} in Monaco.
${venue.tone_brief ?? "Be warm, professional, and helpful."}
You respond in the language the customer writes in. You speak: ${langs}.
Keep responses concise (under 200 words). Do not mention you are an AI unless directly asked.${servicesText}${vipContext}
If the customer asks to book or make a reservation, collect: name, date (YYYY-MM-DD), time (HH:MM), number of guests. When you have ALL four pieces of information, respond with ONLY this JSON (no other text): {"intent":"booking","name":"","date":"YYYY-MM-DD","time":"HH:MM","guests":0}`;

      const { text: rawAiText, promptTokens, completionTokens } = await generateReply({
        systemPrompt,
        messages: history,
        maxTokens: 300,
      });

      // Check for booking intent
      const bookingIntent = extractBookingIntent(rawAiText);
      let aiText = rawAiText;

      if (bookingIntent) {
        const bookedAt = `${bookingIntent.date}T${bookingIntent.time}:00`;

        // Availability check: look for confirmed/pending bookings within ±60 min window
        const windowStart = new Date(new Date(bookedAt).getTime() - 60 * 60_000).toISOString();
        const windowEnd = new Date(new Date(bookedAt).getTime() + 60 * 60_000).toISOString();
        const { data: conflicts } = await supabase
          .from("bookings")
          .select("id, booked_at")
          .eq("venue_id", venueId)
          .in("status", ["confirmed", "pending"])
          .gte("booked_at", windowStart)
          .lte("booked_at", windowEnd)
          .limit(1);

        if (conflicts && conflicts.length > 0) {
          aiText = `Désolé ${bookingIntent.name}, ce créneau (${bookingIntent.date} ${bookingIntent.time}) n'est pas disponible. Pouvez-vous choisir un autre horaire ?`;
        } else {
        const { data: newBooking } = await supabase
          .from("bookings")
          .insert({
            venue_id: venueId,
            customer_name: bookingIntent.name,
            customer_phone: phone,
            customer_channel: "whatsapp",
            booked_at: bookedAt,
            party_size: bookingIntent.guests,
            status: "confirmed",
            confirmation_sent: false,
            conversation_id: conversation.id,
          })
          .select("id")
          .single();

        if (newBooking) {
          await supabase
            .from("bookings")
            .update({ confirmation_sent: true })
            .eq("id", newBooking.id);
        }

        const dateObj = new Date(bookedAt);
        const dateStr = dateObj.toLocaleString("fr-FR", {
          timeZone: "Europe/Monaco",
          weekday: "long",
          day: "numeric",
          month: "long",
          hour: "2-digit",
          minute: "2-digit",
        });
        aiText =
          `✅ Parfait ${bookingIntent.name} ! Votre réservation chez ${venue.name} est confirmée.\n` +
          `📅 ${dateStr} · ${bookingIntent.guests} pers.\n\nÀ très bientôt ! 🙏`;
        } // end else (no conflict)
      }

      // Save AI reply
      await supabase.from("messages").insert({
        conversation_id: conversation.id,
        direction: "outbound",
        content: aiText,
        ai_generated: true,
        ai_model: CLAUDE_MODEL,
        status: "pending",
      });

      // Upsert client profile (non-fatal)
      try {
        await supabase.from("client_profiles").upsert(
          {
            venue_id: venueId,
            phone,
            full_name: profileName ?? clientProfile?.full_name ?? null,
            channel: "whatsapp",
            channel_id: phone,
            consent_given: true,
            consent_given_at: clientProfile?.visit_count ? undefined : new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "venue_id,phone", ignoreDuplicates: false }
        );
      } catch (err) {
        console.error("Client profile upsert error:", err);
      }

      // Log usage
      await supabase.from("ai_usage_logs").insert({
        venue_id: venueId,
        conversation_id: conversation.id,
        model: CLAUDE_MODEL,
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        cost_eur: estimateCostEur(promptTokens, completionTokens),
      });

      // Send via Twilio
      const msgId = await sendTextMessage(phone, aiText);
      await supabase
        .from("messages")
        .update({ status: "delivered", external_message_id: msgId })
        .eq("conversation_id", conversation.id)
        .eq("direction", "outbound")
        .eq("content", aiText);
    }
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("AI respond error:", errMsg);
  }

  return new NextResponse(
    '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
    { headers: { "Content-Type": "text/xml" } }
  );
}

// ─── META HANDLER ───────────────────────────────────

async function handleMetaWebhook(req: NextRequest) {
  const body = (await req.json()) as WhatsAppWebhookBody;

  if (body.object !== "whatsapp_business_account") {
    return NextResponse.json({ status: "ignored" });
  }

  const supabase = createServiceClient();

  for (const entry of body.entry) {
    for (const change of entry.changes) {
      if (change.field !== "messages") continue;

      const { value } = change;
      const phoneNumberId = value.metadata.phone_number_id;

      const { data: channel } = await supabase
        .from("venue_channels")
        .select("venue_id")
        .eq("channel", "whatsapp")
        .eq("channel_account_id", phoneNumberId)
        .single();

      if (!channel) continue;

      const venueId = channel.venue_id;
      const contactName = value.contacts?.[0]?.profile?.name ?? null;

      for (const msg of value.messages ?? []) {
        if (msg.type === "text" && msg.text?.body) {
          const text = msg.text.body.trim();
          if (/^(STOP|СТОП)$/i.test(text)) {
            await supabase
              .from("venues")
              .update({ weekly_report_enabled: false })
              .eq("id", venueId)
              .eq("owner_phone", msg.from);
            continue;
          }
        }
        await handleMetaInbound(msg, venueId, contactName, supabase);
      }

      for (const status of value.statuses ?? []) {
        await supabase
          .from("messages")
          .update({ status: status.status })
          .eq("external_message_id", status.id);
      }
    }
  }

  return NextResponse.json({ status: "ok" });
}

async function handleMetaInbound(
  msg: WhatsAppMessage,
  venueId: string,
  contactName: string | null,
  supabase: ReturnType<typeof createServiceClient>
) {
  const customerId = msg.from;
  const content = msg.type === "text" ? (msg.text?.body ?? "") : `[${msg.type}]`;

  const { data: conversation } = await supabase
    .from("conversations")
    .upsert(
      {
        venue_id: venueId,
        channel: "whatsapp",
        customer_id: customerId,
        customer_name: contactName,
        customer_phone: customerId,
        last_message_at: new Date().toISOString(),
        status: "open",
      },
      { onConflict: "venue_id,channel,customer_id", ignoreDuplicates: false }
    )
    .select("id, language")
    .single();

  if (!conversation) return;

  await supabase.from("messages").insert({
    conversation_id: conversation.id,
    direction: "inbound",
    content,
    ai_generated: false,
    status: "delivered",
    external_message_id: msg.id,
  });

  markMessageRead(msg.id).catch(console.error);

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
      ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    await fetch(`${baseUrl}/api/ai/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId: conversation.id,
        venueId,
        channel: "whatsapp",
        customerPhone: customerId,
      }),
    });
  } catch (err) {
    console.error("Failed to trigger AI respond:", err);
  }
}
