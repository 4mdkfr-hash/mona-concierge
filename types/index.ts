export type Channel = "whatsapp" | "instagram" | "google_business";
export type Language = "fr" | "en" | "ru";
export type VenueType = "restaurant" | "boutique" | "salon";
export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "cancelled";
export type ConversationStatus = "open" | "resolved" | "snoozed";
export type MessageDirection = "inbound" | "outbound";
export type MessageStatus = "pending" | "delivered" | "read" | "failed";
export type BookingStatus = "confirmed" | "cancelled" | "completed";
export type Sentiment = "positive" | "neutral" | "negative";

export interface Venue {
  id: string;
  name: string;
  type: VenueType;
  country: string;
  timezone: string;
  tone_brief: string | null;
  languages: Language[];
  google_place_id: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: SubscriptionStatus | null;
  created_at: string;
  updated_at: string;
}

export interface VenueChannel {
  id: string;
  venue_id: string;
  channel: Channel;
  channel_account_id: string | null;
  access_token: string | null;
  webhook_verified: boolean;
  status: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  venue_id: string;
  channel: Channel;
  customer_id: string;
  customer_name: string | null;
  customer_phone: string | null;
  language: Language | null;
  status: ConversationStatus;
  last_message_at: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  direction: MessageDirection;
  content: string;
  media_url: string | null;
  ai_generated: boolean;
  ai_model: string | null;
  status: MessageStatus;
  external_message_id: string | null;
  created_at: string;
}

export interface GoogleReview {
  id: string;
  venue_id: string;
  review_id: string;
  author_name: string | null;
  rating: number;
  content: string | null;
  reply_text: string | null;
  replied_at: string | null;
  sentiment: Sentiment | null;
  created_at: string;
}

export interface Booking {
  id: string;
  venue_id: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_channel: string | null;
  service_type: string | null;
  booked_at: string;
  google_event_id: string | null;
  status: BookingStatus;
  confirmation_sent: boolean;
  created_at: string;
}

export interface AiUsageLog {
  id: string;
  venue_id: string | null;
  conversation_id: string | null;
  model: string | null;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  cost_eur: number | null;
  created_at: string;
}
