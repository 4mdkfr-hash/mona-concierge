import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

/**
 * GET /api/settings/google-calendar/callback?code=...&state=venueId
 * Exchanges OAuth code for refresh token and saves to venue.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const venueId = searchParams.get("state");
  const error = searchParams.get("error");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL
    ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3001");

  const settingsUrl = `${appUrl}/dashboard/settings`;

  if (error || !code || !venueId) {
    return NextResponse.redirect(
      `${settingsUrl}?calendar_error=${error ?? "missing_code"}`
    );
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${settingsUrl}?calendar_error=not_configured`);
  }

  const redirectUri = `${appUrl}/api/settings/google-calendar/callback`;

  try {
    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      console.error("Google token exchange error:", err);
      return NextResponse.redirect(`${settingsUrl}?calendar_error=token_exchange_failed`);
    }

    const tokens = await tokenRes.json();
    const refreshToken = tokens.refresh_token;

    if (!refreshToken) {
      return NextResponse.redirect(`${settingsUrl}?calendar_error=no_refresh_token`);
    }

    // Save to venue
    const supabase = createServiceClient();
    await supabase
      .from("venues")
      .update({ google_calendar_refresh_token: refreshToken })
      .eq("id", venueId);

    return NextResponse.redirect(`${settingsUrl}?calendar_connected=1`);
  } catch (err) {
    console.error("Google Calendar callback error:", err);
    return NextResponse.redirect(`${settingsUrl}?calendar_error=unexpected`);
  }
}
