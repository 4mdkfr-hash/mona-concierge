import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { generateReply, CLAUDE_MODEL, estimateCostEur } from "@/lib/claude";
import { sendTextMessage } from "@/lib/whatsapp";
import { sendDM } from "@/lib/instagram";
import { sendGbmMessage } from "@/lib/google-bm";

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

export async function POST(req: NextRequest) {
  const {
    conversationId,
    venueId,
    channel,
    // WhatsApp
    customerPhone,
    // Instagram
    customerId,
    pageAccessToken,
    // Google BM
    accessToken,
  } = await req.json();

  const supabase = createServiceClient();

  // Load venue tone and language
  const { data: venue } = await supabase
    .from("venues")
    .select("name, type, tone_brief, languages")
    .eq("id", venueId)
    .single();

  if (!venue) {
    return NextResponse.json({ error: "Venue not found" }, { status: 404 });
  }

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

  // Load recent messages for context
  const { data: messages } = await supabase
    .from("messages")
    .select("direction, content, ai_generated")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(20);

  if (!messages || messages.length === 0) {
    return NextResponse.json({ status: "no messages" });
  }

  const lastMessage = messages[messages.length - 1];
  if (lastMessage.direction === "outbound") {
    return NextResponse.json({ status: "last message was outbound, skipping" });
  }

  // Build system prompt
  const langs = (venue.languages as string[]).join(", ");
  const systemPrompt = `You are a friendly AI concierge for ${venue.name}, a ${venue.type} in Monaco.
${venue.tone_brief ? `Tone: ${venue.tone_brief}` : "Be warm, professional, and helpful."}
You respond in the language the customer writes in. You speak: ${langs}.
Keep responses concise (under 200 words). Do not mention you are an AI unless directly asked.${servicesText}
If the customer asks to book or make a reservation, collect: name, date (YYYY-MM-DD), time (HH:MM), number of guests. When you have ALL four pieces of information, respond with ONLY this JSON (no other text): {"intent":"booking","name":"","date":"YYYY-MM-DD","time":"HH:MM","guests":0}`;

  // Build conversation history for Claude
  const history = messages.map((m) => ({
    role: m.direction === "inbound" ? ("user" as const) : ("assistant" as const),
    content: m.content,
  }));

  try {
    const { text, promptTokens, completionTokens } = await generateReply({
      systemPrompt,
      messages: history,
      maxTokens: 300,
    });

    // Check for booking intent
    const booking = extractBookingIntent(text);
    let outgoingText = text;

    if (booking && customerPhone) {
      // Save booking to Supabase
      const bookedAt = `${booking.date}T${booking.time}:00`;
      const { data: newBooking } = await supabase
        .from("bookings")
        .insert({
          venue_id: venueId,
          customer_name: booking.name,
          customer_phone: customerPhone,
          customer_channel: channel ?? "whatsapp",
          booked_at: bookedAt,
          party_size: booking.guests,
          status: "confirmed",
          confirmation_sent: false,
          conversation_id: conversationId,
        })
        .select("id")
        .single();

      if (newBooking) {
        await supabase
          .from("bookings")
          .update({ confirmation_sent: true })
          .eq("id", newBooking.id);
      }

      // Replace JSON with friendly confirmation
      const dateObj = new Date(bookedAt);
      const dateStr = dateObj.toLocaleString("fr-FR", {
        timeZone: "Europe/Monaco",
        weekday: "long",
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      });
      outgoingText =
        `✅ Parfait ${booking.name} ! Votre réservation chez ${venue.name} est confirmée.\n` +
        `📅 ${dateStr} · ${booking.guests} pers.\n\nÀ très bientôt ! 🙏`;
    }

    // Save AI reply to DB
    await supabase.from("messages").insert({
      conversation_id: conversationId,
      direction: "outbound",
      content: outgoingText,
      ai_generated: true,
      ai_model: CLAUDE_MODEL,
      status: "pending",
    });

    // Log usage
    const costEur = estimateCostEur(promptTokens, completionTokens);
    await supabase.from("ai_usage_logs").insert({
      venue_id: venueId,
      conversation_id: conversationId,
      model: CLAUDE_MODEL,
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      cost_eur: costEur,
    });

    // Send via appropriate channel
    let externalMessageId: string | undefined;

    if (channel === "whatsapp" && customerPhone) {
      externalMessageId = await sendTextMessage(customerPhone, outgoingText);
    } else if (channel === "instagram" && customerId && pageAccessToken) {
      externalMessageId = await sendDM(customerId, outgoingText, pageAccessToken);
    } else if (channel === "google_bm" && customerId && accessToken) {
      externalMessageId = await sendGbmMessage(customerId, outgoingText, accessToken);
    }

    if (externalMessageId) {
      await supabase
        .from("messages")
        .update({ status: "delivered", external_message_id: externalMessageId })
        .eq("conversation_id", conversationId)
        .eq("direction", "outbound")
        .eq("content", outgoingText);
    }

    return NextResponse.json({ status: "sent", text: outgoingText, bookingCreated: !!booking });
  } catch (err) {
    console.error("AI respond error:", err);
    return NextResponse.json(
      { error: "AI generation failed" },
      { status: 500 }
    );
  }
}
