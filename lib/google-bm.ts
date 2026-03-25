/**
 * Google Business Messages API client
 * Docs: https://developers.google.com/business-communications/business-messages/reference/rest
 *
 * Authentication: pass a pre-fetched OAuth2 access token.
 * Obtain one via: gcloud auth print-access-token (or a refresh_token exchange).
 * Store the access token in venue_channels.access_token.
 */

import { randomUUID } from "crypto";

const GBM_API_URL =
  "https://businessmessages.googleapis.com/v1/conversations";

export async function sendGbmMessage(
  gbmConversationId: string,
  text: string,
  accessToken: string
): Promise<string> {
  const messageId = randomUUID();

  const res = await fetch(`${GBM_API_URL}/${gbmConversationId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messageId,
      representative: {
        representativeType: "BOT",
      },
      text,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Google BM API error ${res.status}: ${error}`);
  }

  return messageId;
}

// Types for incoming webhook payloads
export interface GbmWebhookBody {
  message?: GbmMessage;
  conversationId?: string;
  context?: {
    customContext?: string;
    entryPoint?: string;
  };
}

export interface GbmMessage {
  messageId: string;
  name: string;
  text?: string;
  image?: { thumbnailUrl: string; url: string };
  containsRichText?: boolean;
  createTime: string;
}
