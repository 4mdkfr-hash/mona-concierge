/**
 * WhatsApp client — supports both Twilio and Meta Cloud API
 * Detects which provider to use based on available env vars.
 */

const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WA_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER; // e.g. +14155238886

// Meta Cloud API (fallback if Twilio not configured)
const META_API_URL = "https://graph.facebook.com/v19.0";
const META_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const META_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

const useTwilio = !!(TWILIO_SID && TWILIO_TOKEN && TWILIO_WA_NUMBER);

// ─── SEND ───────────────────────────────────────────

export async function sendTextMessage(
  to: string,
  text: string
): Promise<string> {
  if (useTwilio) return sendViaTwilio(to, text);
  return sendViaMeta(to, text);
}

async function sendViaTwilio(to: string, text: string): Promise<string> {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`;
  const from = `whatsapp:${TWILIO_WA_NUMBER}`;
  const toWa = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;

  const body = new URLSearchParams({ From: from, To: toWa, Body: text });
  const auth = Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString("base64");

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Twilio error ${res.status}: ${error}`);
  }

  const data = await res.json();
  return data.sid ?? "";
}

async function sendViaMeta(to: string, text: string): Promise<string> {
  const res = await fetch(
    `${META_API_URL}/${META_PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${META_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: { preview_url: false, body: text },
      }),
    }
  );

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`WhatsApp API error ${res.status}: ${error}`);
  }

  const data = await res.json();
  return data.messages?.[0]?.id ?? "";
}

// ─── MARK READ (Meta only) ─────────────────────────

export async function markMessageRead(messageId: string): Promise<void> {
  if (useTwilio) return; // Twilio doesn't support read receipts via API
  if (!META_PHONE_NUMBER_ID || !META_ACCESS_TOKEN) return;

  await fetch(`${META_API_URL}/${META_PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${META_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      status: "read",
      message_id: messageId,
    }),
  });
}

// ─── TEMPLATES (Meta only) ─────────────────────────

export async function sendTemplateMessage(
  to: string,
  templateName: string,
  languageCode: string,
  params: string[]
): Promise<string> {
  if (useTwilio) {
    // Twilio sandbox doesn't support templates — send as text
    const text = params.join(" ");
    return sendViaTwilio(to, text);
  }

  const components =
    params.length > 0
      ? [
          {
            type: "body",
            parameters: params.map((text) => ({ type: "text", text })),
          },
        ]
      : [];

  const res = await fetch(
    `${META_API_URL}/${META_PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${META_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: { name: templateName, language: { code: languageCode }, components },
      }),
    }
  );

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`WhatsApp API error ${res.status}: ${error}`);
  }

  const data = await res.json();
  return data.messages?.[0]?.id ?? "";
}

// ─── TYPES ─────────────────────────────────────────

// Twilio webhook fields (form-encoded)
export interface TwilioWhatsAppWebhook {
  MessageSid: string;
  From: string; // whatsapp:+XXXXXXXXXXX
  To: string;
  Body: string;
  NumMedia: string;
  ProfileName?: string;
}

// Meta webhook types
export interface WhatsAppWebhookBody {
  object: string;
  entry: WhatsAppEntry[];
}

export interface WhatsAppEntry {
  id: string;
  changes: WhatsAppChange[];
}

export interface WhatsAppChange {
  value: WhatsAppValue;
  field: string;
}

export interface WhatsAppValue {
  messaging_product: string;
  metadata: { display_phone_number: string; phone_number_id: string };
  contacts?: Array<{ profile: { name: string }; wa_id: string }>;
  messages?: WhatsAppMessage[];
  statuses?: WhatsAppStatus[];
}

export interface WhatsAppMessage {
  from: string;
  id: string;
  timestamp: string;
  type: "text" | "image" | "audio" | "video" | "document" | "location";
  text?: { body: string };
  image?: { id: string; mime_type: string; sha256: string; caption?: string };
}

export interface WhatsAppStatus {
  id: string;
  status: "sent" | "delivered" | "read" | "failed";
  timestamp: string;
  recipient_id: string;
}
