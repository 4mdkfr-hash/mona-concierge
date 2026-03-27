/**
 * Google Calendar helper — server-side only.
 * Uses service-account / OAuth2 credentials from env vars:
 *   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN
 */

import { google } from "googleapis";

function getAuth() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Google Calendar credentials not configured");
  }

  const oauth2 = new google.auth.OAuth2(clientId, clientSecret);
  oauth2.setCredentials({ refresh_token: refreshToken });
  return oauth2;
}

export interface CalendarEventInput {
  title: string;
  start: string; // ISO 8601
  end: string;   // ISO 8601
  description?: string;
  location?: string;
  calendarId?: string;
}

export async function createCalendarEvent(
  input: CalendarEventInput
): Promise<string> {
  const auth = getAuth();
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
  calendarId = "primary"
): Promise<void> {
  const auth = getAuth();
  const calendar = google.calendar({ version: "v3", auth });
  await calendar.events.delete({ calendarId, eventId });
}
