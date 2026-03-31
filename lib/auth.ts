import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase";

function createAuthClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function authenticateRequest(request: NextRequest): Promise<{
  user: { id: string } | null;
  error: string | null;
}> {
  const authHeader = request.headers.get("authorization") ?? "";
  let token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    token = request.cookies.get("sb-access-token")?.value ?? null;
  }

  if (!token) {
    return { user: null, error: "No token provided" };
  }

  const supabase = createAuthClient();
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return { user: null, error: "Invalid or expired token" };
  }

  return { user: { id: data.user.id }, error: null };
}

export async function authorizeVenue(
  userId: string,
  venueId: string
): Promise<{ authorized: boolean }> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("venues")
    .select("id")
    .eq("id", venueId)
    .eq("owner_id", userId)
    .single();

  return { authorized: !!data };
}
