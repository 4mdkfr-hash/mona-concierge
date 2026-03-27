import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import {
  markMessageRead,
  type WhatsAppWebhookBody,
  type WhatsAppMessage,
} from "@/lib/whatsapp";

// GET: WhatsApp webhook verification
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

// POST: Incoming WhatsApp messages
export async function POST(req: NextRequest) {
  const body = (await req.json()) as WhatsAppWebhookBody;

  // Validate it's a WhatsApp event
  if (body.object !== "whatsapp_business_account") {
    return NextResponse.json({ status: "ignored" });
  }

  const supabase = createServiceClient();

  for (const entry of body.entry) {
    for (const change of entry.changes) {
      if (change.field !== "messages") continue;

      const { value } = change;
      const phoneNumberId = value.metadata.phone_number_id;

      // Find the venue for this WhatsApp number
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
        // STOP opt-out: if message is from owner_phone and body matches STOP/СТОП
        if (msg.type === "text" && msg.text?.body) {
          const body = msg.text.body.trim();
          if (/^(STOP|СТОП)$/i.test(body)) {
            await supabase
              .from("venues")
              .update({ weekly_report_enabled: false })
              .eq("id", venueId)
              .eq("owner_phone", msg.from);
            continue;
          }
        }
        await handleInboundMessage(msg, venueId, contactName, supabase);
      }

      // Update message delivery statuses
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

async function handleInboundMessage(
  msg: WhatsAppMessage,
  venueId: string,
  contactName: string | null,
  supabase: ReturnType<typeof createServiceClient>
) {
  const customerId = msg.from;
  const content =
    msg.type === "text" ? (msg.text?.body ?? "") : `[${msg.type}]`;

  // Upsert conversation
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
      {
        onConflict: "venue_id,channel,customer_id",
        ignoreDuplicates: false,
      }
    )
    .select("id, language")
    .single();

  if (!conversation) return;

  // Save inbound message
  await supabase.from("messages").insert({
    conversation_id: conversation.id,
    direction: "inbound",
    content,
    ai_generated: false,
    status: "delivered",
    external_message_id: msg.id,
  });

  // Mark as read (best-effort)
  markMessageRead(msg.id).catch(console.error);

  // Trigger AI response via internal API
  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

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
