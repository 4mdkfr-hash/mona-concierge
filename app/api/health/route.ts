import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function GET() {
  const checks: Record<string, boolean> = {};

  // Supabase check
  try {
    const supabase = createServiceClient();
    const { error } = await supabase.from("venues").select("id").limit(1);
    checks.supabase = !error;
  } catch {
    checks.supabase = false;
  }

  // Twilio check (env presence)
  checks.twilio = !!(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_WHATSAPP_FROM
  );

  // AI (env presence)
  checks.ai = !!(process.env.ANTHROPIC_API_KEY);

  const allOk = Object.values(checks).every(Boolean);
  const anyFailed = Object.values(checks).some((v) => !v);

  return NextResponse.json(
    {
      status: allOk ? "ok" : anyFailed ? "degraded" : "ok",
      ...checks,
    },
    {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    }
  );
}
