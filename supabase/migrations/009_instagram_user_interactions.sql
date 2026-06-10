-- Instagram User Interactions table
CREATE TABLE IF NOT EXISTS instagram_user_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instagram_gift_offer_id UUID NOT NULL REFERENCES instagram_gift_offers(id) ON DELETE CASCADE,
  instagram_psid TEXT NOT NULL,
  interaction_type TEXT NOT NULL DEFAULT 'message_received',
  self_reported_followed BOOLEAN DEFAULT FALSE,
  gift_claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE instagram_user_interactions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own interactions (via gift offer)
CREATE POLICY "Users can view their own Instagram interactions"
  ON instagram_user_interactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM instagram_gift_offers
      WHERE instagram_gift_offers.id = instagram_user_interactions.instagram_gift_offer_id
      AND instagram_gift_offers.user_id = auth.uid()
    )
  );

-- Users can insert their own interactions
CREATE POLICY "Users can insert their own Instagram interactions"
  ON instagram_user_interactions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM instagram_gift_offers
      WHERE instagram_gift_offers.id = instagram_user_interactions.instagram_gift_offer_id
      AND instagram_gift_offers.user_id = auth.uid()
    )
  );

-- Users can update their own interactions
CREATE POLICY "Users can update their own Instagram interactions"
  ON instagram_user_interactions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM instagram_gift_offers
      WHERE instagram_gift_offers.id = instagram_user_interactions.instagram_gift_offer_id
      AND instagram_gift_offers.user_id = auth.uid()
    )
  );

-- Users can delete their own interactions
CREATE POLICY "Users can delete their own Instagram interactions"
  ON instagram_user_interactions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM instagram_gift_offers
      WHERE instagram_gift_offers.id = instagram_user_interactions.instagram_gift_offer_id
      AND instagram_gift_offers.user_id = auth.uid()
    )
  );

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_instagram_user_interactions_gift_offer_id ON instagram_user_interactions(instagram_gift_offer_id);
CREATE INDEX IF NOT EXISTS idx_instagram_user_interactions_psid ON instagram_user_interactions(instagram_psid);
CREATE INDEX IF NOT EXISTS idx_instagram_user_interactions_unique ON instagram_user_interactions(instagram_gift_offer_id, instagram_psid);

-- Unique constraint to prevent duplicate interactions
CREATE UNIQUE INDEX IF NOT EXISTS idx_instagram_user_interactions_unique_gift_psid 
  ON instagram_user_interactions(instagram_gift_offer_id, instagram_psid);

-- Updated at trigger
CREATE TRIGGER update_instagram_user_interactions_updated_at
  BEFORE UPDATE ON instagram_user_interactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
