export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      venues: {
        Row: {
          id: string;
          name: string;
          type: string;
          country: string;
          timezone: string;
          tone_brief: string | null;
          languages: string[];
          google_place_id: string | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          subscription_status: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: string;
          country?: string;
          timezone?: string;
          tone_brief?: string | null;
          languages?: string[];
          google_place_id?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          subscription_status?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["venues"]["Insert"]>;
      };
      venue_channels: {
        Row: {
          id: string;
          venue_id: string;
          channel: string;
          channel_account_id: string | null;
          access_token: string | null;
          webhook_verified: boolean;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          venue_id: string;
          channel: string;
          channel_account_id?: string | null;
          access_token?: string | null;
          webhook_verified?: boolean;
          status?: string;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["venue_channels"]["Insert"]
        >;
      };
      conversations: {
        Row: {
          id: string;
          venue_id: string;
          channel: string;
          customer_id: string;
          customer_name: string | null;
          customer_phone: string | null;
          language: string | null;
          status: string;
          last_message_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          venue_id: string;
          channel: string;
          customer_id: string;
          customer_name?: string | null;
          customer_phone?: string | null;
          language?: string | null;
          status?: string;
          last_message_at?: string | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["conversations"]["Insert"]
        >;
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          direction: string;
          content: string;
          media_url: string | null;
          ai_generated: boolean;
          ai_model: string | null;
          status: string;
          external_message_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          direction: string;
          content: string;
          media_url?: string | null;
          ai_generated?: boolean;
          ai_model?: string | null;
          status?: string;
          external_message_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["messages"]["Insert"]>;
      };
      google_reviews: {
        Row: {
          id: string;
          venue_id: string;
          review_id: string;
          author_name: string | null;
          rating: number;
          content: string | null;
          reply_text: string | null;
          replied_at: string | null;
          sentiment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          venue_id: string;
          review_id: string;
          author_name?: string | null;
          rating: number;
          content?: string | null;
          reply_text?: string | null;
          replied_at?: string | null;
          sentiment?: string | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["google_reviews"]["Insert"]
        >;
      };
      bookings: {
        Row: {
          id: string;
          venue_id: string;
          customer_name: string | null;
          customer_phone: string | null;
          customer_channel: string | null;
          service_type: string | null;
          booked_at: string;
          google_event_id: string | null;
          status: string;
          confirmation_sent: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          venue_id: string;
          customer_name?: string | null;
          customer_phone?: string | null;
          customer_channel?: string | null;
          service_type?: string | null;
          booked_at: string;
          google_event_id?: string | null;
          status?: string;
          confirmation_sent?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["bookings"]["Insert"]>;
      };
      ai_usage_logs: {
        Row: {
          id: string;
          venue_id: string | null;
          conversation_id: string | null;
          model: string | null;
          prompt_tokens: number | null;
          completion_tokens: number | null;
          cost_eur: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          venue_id?: string | null;
          conversation_id?: string | null;
          model?: string | null;
          prompt_tokens?: number | null;
          completion_tokens?: number | null;
          cost_eur?: number | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["ai_usage_logs"]["Insert"]
        >;
      };
    };
  };
}
