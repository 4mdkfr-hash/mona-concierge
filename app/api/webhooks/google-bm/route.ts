import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { type GbmWebhookBody } from "@/lib/google-bm";

// POST: Incoming Google Business Messages
export async function POST(req: NextRequest) {
  const body = (await req.json()) as GbmWebhookBody;

  if (!body.message || !body.conversationId) {
    return NextResponse.json({ status: "ignored" });
  }

  const gbmConversationId = body.conversationId;
  const msg = body.message;

  const supabase = createServiceClient();

  // Find venue for this GBM agent — stored as channel_account_id
  // GBM conversations include the agent name in the conversation name: "conversations/{conversationId}"
  // We match via the agent config stored in venue_channels
  // For now, use a single GBM agent per deployment (single venue channel with channel='google_bm')
  const { data: channel } = await supabase
    .from("venue_channels")
    .select("venue_id, access_token")
    .eq("channel", "google_bm")
    .limit(1)
    .single();

  if (!channel) {
    return NextResponse.json({ status: "no channel configured" });
  }

  const venueId = channel.venue_id;
  const accessToken = channel.access_token as string;
  const content = msg.text ?? "[attachment]";
  const customerId = gbmConversationId;

  // Upsert conversation
  const { data: conversation } = await supabase
    .from("conversations")
    .upsert(
      {
        venue_id: venueId,
        channel: "google_bm",
        customer_id: customerId,
        last_message_at: new Date().toISOString(),
        status: "open",
      },
      {
        onConflict: "venue_id,channel,customer_id",
        ignoreDuplicates: false,
      }
    )
    .select("id")
    .single();

  if (!conversation) {
    return NextResponse.json({ status: "ok" });
  }

  // Save inbound message
  await supabase.from("messages").insert({
    conversation_id: conversation.id,
    direction: "inbound",
    content,
    ai_generated: false,
    status: "delivered",
    external_message_id: msg.messageId,
  });

  // Trigger AI response
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
        channel: "google_bm",
        customerId: gbmConversationId,
        accessToken,
      }),
    });
  } catch (err) {
    console.error("Failed to trigger AI respond:", err);
  }

  return NextResponse.json({ status: "ok" });
}
