import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import {
  type InstagramWebhookBody,
  type InstagramMessaging,
} from "@/lib/instagram";

// GET: Instagram webhook verification
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.INSTAGRAM_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// POST: Incoming Instagram DMs
export async function POST(req: NextRequest) {
  const body = (await req.json()) as InstagramWebhookBody;

  if (body.object !== "instagram") {
    return NextResponse.json({ status: "ignored" });
  }

  const supabase = createServiceClient();

  for (const entry of body.entry) {
    const igAccountId = entry.id;

    // Find venue for this Instagram account
    const { data: channel } = await supabase
      .from("venue_channels")
      .select("venue_id, access_token")
      .eq("channel", "instagram")
      .eq("channel_account_id", igAccountId)
      .single();

    if (!channel) continue;

    const venueId = channel.venue_id;
    const pageAccessToken = channel.access_token as string;

    for (const messaging of entry.messaging ?? []) {
      if (!messaging.message) continue;
      if (messaging.message.is_echo) continue; // skip outbound echoes to prevent loop
      await handleInboundDM(messaging, venueId, pageAccessToken, supabase);
    }
  }

  return NextResponse.json({ status: "ok" });
}

async function handleInboundDM(
  messaging: InstagramMessaging,
  venueId: string,
  pageAccessToken: string,
  supabase: ReturnType<typeof createServiceClient>
) {
  const senderId = messaging.sender.id;
  const msgId = messaging.message?.mid ?? "";
  const content = messaging.message?.text ?? `[attachment]`;

  // Upsert conversation
  const { data: conversation } = await supabase
    .from("conversations")
    .upsert(
      {
        venue_id: venueId,
        channel: "instagram",
        customer_id: senderId,
        last_message_at: new Date().toISOString(),
        status: "open",
      },
      {
        onConflict: "venue_id,channel,customer_id",
        ignoreDuplicates: false,
      }
    )
    .select("id, ai_enabled")
    .single();

  if (!conversation) return;

  // Save inbound message
  await supabase.from("messages").insert({
    conversation_id: conversation.id,
    direction: "inbound",
    content,
    ai_generated: false,
    status: "delivered",
    external_message_id: msgId,
  });

  // Skip AI if disabled for this conversation
  if (conversation.ai_enabled === false) return;

  // Trigger AI response
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://mona-concierge.com";

    await fetch(`${baseUrl}/api/ai/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId: conversation.id,
        venueId,
        channel: "instagram",
        customerId: senderId,
        pageAccessToken,
      }),
    });
  } catch (err) {
    console.error("Failed to trigger AI respond:", err);
  }
}
