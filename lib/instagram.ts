/**
 * Instagram Graph API client for Direct Messages
 * Docs: https://developers.facebook.com/docs/messenger-platform/instagram
 */

const GRAPH_API_URL = "https://graph.facebook.com/v19.0";

export async function sendDM(
  recipientIgId: string,
  text: string,
  pageAccessToken: string
): Promise<string> {
  const res = await fetch(`${GRAPH_API_URL}/me/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${pageAccessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      recipient: { id: recipientIgId },
      message: { text },
      messaging_type: "RESPONSE",
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Instagram Graph API error ${res.status}: ${error}`);
  }

  const data = (await res.json()) as { message_id?: string };
  return data.message_id ?? "";
}

// Types for incoming webhook payloads
export interface InstagramWebhookBody {
  object: string;
  entry: InstagramEntry[];
}

export interface InstagramEntry {
  id: string;
  time: number;
  messaging?: InstagramMessaging[];
}

export interface InstagramMessaging {
  sender: { id: string };
  recipient: { id: string };
  timestamp: number;
  message?: {
    mid: string;
    text?: string;
    attachments?: Array<{ type: string; payload: { url?: string } }>;
  };
}
