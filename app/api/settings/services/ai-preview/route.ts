import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { generateReply } from "@/lib/claude";
import { authenticateRequest, authorizeVenue } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { user } = await authenticateRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { venueId } = await req.json();

  if (!venueId) {
    return NextResponse.json({ error: "venueId required" }, { status: 400 });
  }

  const { authorized } = await authorizeVenue(user.id, venueId);
  if (!authorized) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = createServiceClient();
  const { data: services, error } = await supabase
    .from("venue_services")
    .select("name, description, price, duration_min, category")
    .eq("venue_id", venueId)
    .eq("active", true)
    .order("category", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!services || services.length === 0) {
    return NextResponse.json({ preview: null, count: 0 });
  }

  const servicesList = services
    .map((s) => {
      const parts = [`• ${s.name}`];
      if (s.category) parts.push(`(${s.category})`);
      if (s.price != null) parts.push(`— ${s.price} EUR`);
      if (s.duration_min != null) parts.push(`— ${s.duration_min} min`);
      if (s.description) parts.push(`\n  ${s.description}`);
      return parts.join(" ");
    })
    .join("\n");

  const systemPrompt = `You are a luxury concierge AI assistant. Based on the services list below, write a short, elegant summary (3-5 sentences) of what you can help customers with. Use a warm, professional tone. Respond in English.

Services available:
${servicesList}`;

  try {
    const { text } = await generateReply({
      systemPrompt,
      messages: [
        {
          role: "user",
          content: "What services can you help me with?",
        },
      ],
      maxTokens: 300,
    });

    return NextResponse.json({ preview: text, count: services.length });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "AI preview failed" },
      { status: 500 }
    );
  }
}
