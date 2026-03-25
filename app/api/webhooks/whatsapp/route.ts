import { NextRequest, NextResponse } from "next/server";

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
  try {
    const body = await req.json();

    // TODO: Process incoming WhatsApp messages
    // See MON-4 for full implementation
    console.log("WhatsApp webhook received:", JSON.stringify(body, null, 2));

    return NextResponse.json({ status: "ok" });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
