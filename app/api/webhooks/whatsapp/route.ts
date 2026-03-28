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

  // Generate AI response and send directly
  try {
    // Load venue info
    const { data: venue } = await supabase
      .from("venues")
      .select("name, type, tone_brief, languages")
      .eq("id", venueId)
      .single();

    if (venue) {
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
Keep responses concise (under 200 words). Do not mention you are an AI unless directly asked.`;

      const { text: aiText, promptTokens, completionTokens } = await generateReply({
        systemPrompt,
        messages: history,
        maxTokens: 300,
      });

      // Save AI reply
      await supabase.from("messages").insert({
        conversation_id: conversation.id,
        direction: "outbound",
        content: aiText,
        ai_generated: true,
        ai_model: CLAUDE_MODEL,
        status: "pending",
      });

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
