import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServiceClient } from "@/lib/supabase";

function isSuperAdmin(email: string | null | undefined): boolean {
  const allowed = process.env.SUPER_ADMIN_EMAIL ?? "";
  return !!email && allowed.split(",").map((e) => e.trim()).includes(email);
}

export async function GET(req: NextRequest) {
  // Verify super admin via Supabase JWT
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  let userEmail: string | null = null;
  if (token) {
    try {
      const sb = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data } = await sb.auth.getUser(token);
      userEmail = data.user?.email ?? null;
    } catch {
      // ignore
    }
  }

  if (!isSuperAdmin(userEmail)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = createServiceClient();

  const [venuesRes, usageRes] = await Promise.all([
    supabase
      .from("venues")
      .select("id, name, type, country, subscription_status, subscription_plan, onboarding_completed, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("ai_usage_logs")
      .select("venue_id, model, prompt_tokens, completion_tokens, cost_eur, created_at")
      .order("created_at", { ascending: false })
      .limit(500),
  ]);

  if (venuesRes.error) {
    return NextResponse.json({ error: venuesRes.error.message }, { status: 500 });
  }

  // Aggregate usage per venue
  const usageLogs = usageRes.data ?? [];
  const usageByVenue: Record<string, { messages: number; tokens: number; costEur: number }> = {};
  for (const log of usageLogs) {
    if (!usageByVenue[log.venue_id]) {
      usageByVenue[log.venue_id] = { messages: 0, tokens: 0, costEur: 0 };
    }
    usageByVenue[log.venue_id].messages += 1;
    usageByVenue[log.venue_id].tokens += (log.prompt_tokens ?? 0) + (log.completion_tokens ?? 0);
    usageByVenue[log.venue_id].costEur += log.cost_eur ?? 0;
  }

  const venues = (venuesRes.data ?? []).map((v) => ({
    ...v,
    usage: usageByVenue[v.id] ?? { messages: 0, tokens: 0, costEur: 0 },
  }));

  const totalCost = usageLogs.reduce((sum, l) => sum + (l.cost_eur ?? 0), 0);
  const totalMessages = usageLogs.length;

  return NextResponse.json({ venues, totalMessages, totalCost });
}
