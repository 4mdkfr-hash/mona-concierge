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
        Update: {
          id?: string;
          name?: string;
          type?: string;
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
        Update: {
          id?: string;
          venue_id?: string;
          channel?: string;
          channel_account_id?: string | null;
          access_token?: string | null;
          webhook_verified?: boolean;
          status?: string;
          created_at?: string;
        };
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
        Update: {
          id?: string;
          venue_id?: string;
          channel?: string;
          customer_id?: string;
          customer_name?: string | null;
          customer_phone?: string | null;
          language?: string | null;
          status?: string;
          last_message_at?: string | null;
          created_at?: string;
        };
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
        Update: {
          id?: string;
          conversation_id?: string;
          direction?: string;
          content?: string;
          media_url?: string | null;
          ai_generated?: boolean;
          ai_model?: string | null;
          status?: string;
          external_message_id?: string | null;
          created_at?: string;
        };
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
        Update: {
          id?: string;
          venue_id?: string;
          review_id?: string;
          author_name?: string | null;
          rating?: number;
          content?: string | null;
          reply_text?: string | null;
          replied_at?: string | null;
          sentiment?: string | null;
          created_at?: string;
        };
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
          status: 'confirmed' | 'cancelled' | 'completed' | 'no_show' | 'rescheduled';
          confirmation_sent: boolean;
          no_show_notified_at: string | null;
          rescheduled_from_booking_id: string | null;
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
          status?: 'confirmed' | 'cancelled' | 'completed' | 'no_show' | 'rescheduled';
          confirmation_sent?: boolean;
          no_show_notified_at?: string | null;
          rescheduled_from_booking_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          venue_id?: string;
          customer_name?: string | null;
          customer_phone?: string | null;
          customer_channel?: string | null;
          service_type?: string | null;
          booked_at?: string;
          google_event_id?: string | null;
          status?: 'confirmed' | 'cancelled' | 'completed' | 'no_show' | 'rescheduled';
          confirmation_sent?: boolean;
          no_show_notified_at?: string | null;
          rescheduled_from_booking_id?: string | null;
          created_at?: string;
        };
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
        Update: {
          id?: string;
          venue_id?: string | null;
          conversation_id?: string | null;
          model?: string | null;
          prompt_tokens?: number | null;
          completion_tokens?: number | null;
          cost_eur?: number | null;
          created_at?: string;
        };
      };
    };
      client_profiles: {
        Row: {
          id: string;
          venue_id: string;
          phone: string | null;
          channel: string | null;
          channel_id: string | null;
          full_name: string | null;
          preferred_name: string | null;
          language: string;
          favourite_services: string[];
          disliked_services: string[];
          preferred_staff: string[];
          allergies: string[];
          notes: string | null;
          visit_count: number;
          last_visit_at: string | null;
          last_service: string | null;
          vip_tier: 'standard' | 'regular' | 'vip';
          lifetime_spend_eur: number;
          consent_given: boolean;
          consent_given_at: string | null;
          data_deletion_requested_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          venue_id: string;
          phone?: string | null;
          channel?: string | null;
          channel_id?: string | null;
          full_name?: string | null;
          preferred_name?: string | null;
          language?: string;
          favourite_services?: string[];
          disliked_services?: string[];
          preferred_staff?: string[];
          allergies?: string[];
          notes?: string | null;
          visit_count?: number;
          last_visit_at?: string | null;
          last_service?: string | null;
          vip_tier?: 'standard' | 'regular' | 'vip';
          lifetime_spend_eur?: number;
          consent_given?: boolean;
          consent_given_at?: string | null;
          data_deletion_requested_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          venue_id?: string;
          phone?: string | null;
          channel?: string | null;
          channel_id?: string | null;
          full_name?: string | null;
          preferred_name?: string | null;
          language?: string;
          favourite_services?: string[];
          disliked_services?: string[];
          preferred_staff?: string[];
          allergies?: string[];
          notes?: string | null;
          visit_count?: number;
          last_visit_at?: string | null;
          last_service?: string | null;
          vip_tier?: 'standard' | 'regular' | 'vip';
          lifetime_spend_eur?: number;
          consent_given?: boolean;
          consent_given_at?: string | null;
          data_deletion_requested_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Functions: {
      upsert_client_profile_from_booking: {
        Args: {
          p_venue_id: string;
          p_phone: string;
          p_full_name: string;
          p_service_type: string;
          p_channel?: string;
          p_channel_id?: string | null;
        };
        Returns: string;
      };
      build_vip_context_snippet: {
        Args: { p_venue_id: string; p_phone: string };
        Returns: string | null;
      };
    };
  };
}
