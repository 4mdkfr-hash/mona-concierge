import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { sendTextMessage } from "@/lib/whatsapp";
import { sendDM } from "@/lib/instagram";
import { sendGbmMessage } from "@/lib/google-bm";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const conversationId = params.id;
  const { text } = await req.json();

  if (!text) {
    return NextResponse.json({ error: "text required" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Load conversation + venue channel
  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, venue_id, channel, customer_id, customer_phone")
    .eq("id", conversationId)
    .single();

  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const { data: channel } = await supabase
    .from("venue_channels")
    .select("access_token, channel_account_id")
    .eq("venue_id", conversation.venue_id)
    .eq("channel", conversation.channel)
    .single();

  if (!channel) {
    return NextResponse.json({ error: "Channel not configured" }, { status: 400 });
  }

  let externalMessageId: string | undefined;

  try {
    if (conversation.channel === "whatsapp" && conversation.customer_phone) {
      externalMessageId = await sendTextMessage(conversation.customer_phone, text);
    } else if (conversation.channel === "instagram" && conversation.customer_id) {
      externalMessageId = await sendDM(
        conversation.customer_id,
        text,
        channel.access_token as string
      );
    } else if (conversation.channel === "google_bm" && conversation.customer_id) {
      externalMessageId = await sendGbmMessage(
        conversation.customer_id,
        text,
        channel.access_token as string
      );
    }
  } catch (err) {
    console.error("Send reply error:", err);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }

  // Save manual reply to DB
  await supabase.from("messages").insert({
    conversation_id: conversationId,
    direction: "outbound",
    content: text,
    ai_generated: false,
    status: externalMessageId ? "delivered" : "pending",
    external_message_id: externalMessageId,
  });

  await supabase
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", conversationId);

  return NextResponse.json({ status: "sent" });
}
