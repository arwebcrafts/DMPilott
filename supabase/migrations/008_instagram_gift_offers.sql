-- Instagram Gift Offers table
CREATE TABLE IF NOT EXISTS instagram_gift_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_username TEXT NOT NULL,
  gift_link_url TEXT NOT NULL,
  gift_link_title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE instagram_gift_offers ENABLE ROW LEVEL SECURITY;

-- Users can only see their own gift offers
CREATE POLICY "Users can view their own Instagram gift offers"
  ON instagram_gift_offers FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own gift offers
CREATE POLICY "Users can insert their own Instagram gift offers"
  ON instagram_gift_offers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own gift offers
CREATE POLICY "Users can update their own Instagram gift offers"
  ON instagram_gift_offers FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own gift offers
CREATE POLICY "Users can delete their own Instagram gift offers"
  ON instagram_gift_offers FOR DELETE
  USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_instagram_gift_offers_user_id ON instagram_gift_offers(user_id);
CREATE INDEX IF NOT EXISTS idx_instagram_gift_offers_account_username ON instagram_gift_offers(account_username);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_instagram_gift_offers_updated_at
  BEFORE UPDATE ON instagram_gift_offers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
