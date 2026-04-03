import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, authorizeVenue } from "@/lib/auth";

const SCOPES = ["https://www.googleapis.com/auth/calendar.events"];

/**
 * GET /api/settings/google-calendar/connect?venueId=...
 * Redirects to Google OAuth2 consent screen.
 */
export async function GET(req: NextRequest) {
  const { user } = await authenticateRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const venueId = new URL(req.url).searchParams.get("venueId");
  if (!venueId) return NextResponse.json({ error: "venueId required" }, { status: 400 });

  const { authorized } = await authorizeVenue(user.id, venueId);
  if (!authorized) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "Google OAuth not configured" }, { status: 503 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://mona-concierge.com";

  const redirectUri = `${appUrl}/api/settings/google-calendar/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent",
    state: venueId,
  });

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );
}
