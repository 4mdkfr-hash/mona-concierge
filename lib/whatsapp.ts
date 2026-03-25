/**
 * WhatsApp Business API client
 * Docs: https://developers.facebook.com/docs/whatsapp/cloud-api
 */

const WHATSAPP_API_URL = "https://graph.facebook.com/v19.0";
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN!;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;

async function callWhatsAppApi(
  endpoint: string,
  body: Record<string, unknown>
): Promise<{ messages?: Array<{ id: string }> }> {
  const res = await fetch(
    `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/${endpoint}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`WhatsApp API error ${res.status}: ${error}`);
  }

  return res.json();
}

export async function sendTextMessage(
  to: string,
  text: string
): Promise<string> {
  const result = await callWhatsAppApi("messages", {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "text",
    text: { preview_url: false, body: text },
  });
  return result.messages?.[0]?.id ?? "";
}

export async function sendTemplateMessage(
  to: string,
  templateName: string,
  languageCode: string,
  params: string[]
): Promise<string> {
  const components =
    params.length > 0
      ? [
          {
            type: "body",
            parameters: params.map((text) => ({ type: "text", text })),
          },
        ]
      : [];

  const result = await callWhatsAppApi("messages", {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: templateName,
      language: { code: languageCode },
      components,
    },
  });
  return result.messages?.[0]?.id ?? "";
}

export async function markMessageRead(messageId: string): Promise<void> {
  await callWhatsAppApi("messages", {
    messaging_product: "whatsapp",
    status: "read",
    message_id: messageId,
  });
}

// Types for incoming webhook payloads
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
