import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { generateReply, CLAUDE_MODEL, estimateCostEur } from "@/lib/claude";
import { sendTextMessage } from "@/lib/whatsapp";

export async function POST(req: NextRequest) {
  const { conversationId, venueId, channel, customerPhone } =
    await req.json();

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
Keep responses concise (under 200 words). Do not mention you are an AI unless directly asked.
If the customer asks to book or make a reservation, collect: name, date/time, party size, and any special requests.`;

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

    // Save AI reply to DB
    await supabase.from("messages").insert({
      conversation_id: conversationId,
      direction: "outbound",
      content: text,
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
      externalMessageId = await sendTextMessage(customerPhone, text);
    }
    // TODO: Instagram and Google BM send implementations

    if (externalMessageId) {
      await supabase
        .from("messages")
        .update({ status: "delivered", external_message_id: externalMessageId })
        .eq("conversation_id", conversationId)
        .eq("direction", "outbound")
        .eq("content", text);
    }

    return NextResponse.json({ status: "sent", text });
  } catch (err) {
    console.error("AI respond error:", err);
    return NextResponse.json(
      { error: "AI generation failed" },
      { status: 500 }
    );
  }
}
