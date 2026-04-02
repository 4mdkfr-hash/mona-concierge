-- Migration: AI ON/OFF toggle per conversation + needs_attention flag
-- B1 from MON-102 / MON-110 QA bug fix

ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS ai_enabled BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS needs_attention BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN conversations.ai_enabled IS 'When false, AI will not auto-reply to this conversation';
COMMENT ON COLUMN conversations.needs_attention IS 'Set to true when AI confidence is low or admin intervention is needed';

CREATE INDEX IF NOT EXISTS idx_conversations_needs_attention
  ON conversations(venue_id, needs_attention)
  WHERE needs_attention = true;

CREATE INDEX IF NOT EXISTS idx_conversations_ai_enabled
  ON conversations(venue_id, ai_enabled);
