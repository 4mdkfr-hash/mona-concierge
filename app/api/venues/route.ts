import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { authenticateRequest } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { user } = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, type, address, tone, languages } = body;

    if (!name || !type) {
      return NextResponse.json({ error: "name and type are required" }, { status: 400 });
    }

    const db = createServiceClient();

    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    const { data, error } = await db
      .from("venues")
      .insert({
        name,
        type,
        country: "MC",
        timezone: "Europe/Monaco",
        tone_brief: address ? `Address: ${address}\nTone: ${tone ?? "luxury"}` : `Tone: ${tone ?? "luxury"}`,
        languages: languages && languages.length > 0 ? languages : ["fr", "en", "ru"],
        subscription_status: "trialing",
        trial_ends_at: trialEndsAt.toISOString(),
        owner_id: user.id,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ venueId: data.id });
  } catch (err) {
    console.error("POST /api/venues error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
