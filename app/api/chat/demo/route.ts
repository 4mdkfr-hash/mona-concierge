import { NextRequest, NextResponse } from "next/server";
import { generateReply } from "@/lib/claude";

const DEMO_SYSTEM_PROMPT = `You are MonaConcierge AI demo for a premium Monaco venue. Show how you handle restaurant/salon bookings. Be warm, premium, respond in the visitor's language. Use example services: massage detente 120EUR, manicure classique 65EUR, dinner reservation. Keep responses to 2 sentences max. After the 2nd user message, naturally suggest making a booking.`;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Sanitize and limit message history (max 6 to prevent abuse)
  const messages = (body.messages as { role: string; content: string }[])
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-6)
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content.slice(0, 500) }));

  if (messages.length === 0) {
    return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
  }

  try {
    const { text } = await generateReply({
      systemPrompt: DEMO_SYSTEM_PROMPT,
      messages,
      maxTokens: 150,
    });
    return NextResponse.json({ text });
  } catch (err) {
    console.error("Demo chat error:", err);
    return NextResponse.json({ error: "AI unavailable" }, { status: 500 });
  }
}
