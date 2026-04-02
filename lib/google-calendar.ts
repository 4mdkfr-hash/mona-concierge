/**
 * Google Calendar helper — server-side only.
 *
 * Supports two auth modes:
 *   1. Per-venue OAuth2 — pass `refreshToken` explicitly (preferred)
 *   2. Global service-account fallback — uses env var GOOGLE_REFRESH_TOKEN
 *
 * Env vars required: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
 * Optional fallback: GOOGLE_REFRESH_TOKEN (global)
 */

import { google } from "googleapis";

function getAuth(refreshToken?: string | null) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const globalRefreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  const token = refreshToken ?? globalRefreshToken;

  if (!clientId || !clientSecret || !token) {
    throw new Error("Google Calendar credentials not configured");
  }

  const oauth2 = new google.auth.OAuth2(clientId, clientSecret);
  oauth2.setCredentials({ refresh_token: token });
  return oauth2;
}

export interface CalendarEventInput {
  title: string;
  start: string; // ISO 8601
  end: string;   // ISO 8601
  description?: string;
  location?: string;
  calendarId?: string;
  /** Per-venue OAuth2 refresh token (overrides global env var) */
  refreshToken?: string | null;
}

export async function createCalendarEvent(
  input: CalendarEventInput
): Promise<string> {
  const auth = getAuth(input.refreshToken);
  const calendar = google.calendar({ version: "v3", auth });

  const res = await calendar.events.insert({
    calendarId: input.calendarId ?? "primary",
    requestBody: {
      summary: input.title,
      description: input.description,
      location: input.location,
      start: { dateTime: input.start, timeZone: "Europe/Monaco" },
      end: { dateTime: input.end, timeZone: "Europe/Monaco" },
    },
  });

  return res.data.id ?? "";
}

export async function deleteCalendarEvent(
  eventId: string,
  calendarId = "primary",
  refreshToken?: string | null
): Promise<void> {
  const auth = getAuth(refreshToken);
  const calendar = google.calendar({ version: "v3", auth });
  await calendar.events.delete({ calendarId, eventId });
}
