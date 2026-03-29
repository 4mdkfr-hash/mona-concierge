import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, type, address, tone, languages } = body;

    if (!name || !type) {
      return NextResponse.json({ error: "name and type are required" }, { status: 400 });
    }

    // Get authenticated user from session cookie
    const cookieStore = cookies();
    const authClient = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { session } } = await authClient.auth.getSession();
    const userId = session?.user?.id ?? null;

    const db = createServiceClient();

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
        ...(userId ? { owner_id: userId } : {}),
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
