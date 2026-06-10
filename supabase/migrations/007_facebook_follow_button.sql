-- Facebook Page Follow Button Feature
-- Migration for self-reported follow system
-- Uses existing connected_accounts table for Facebook page access tokens

-- Page Configurations Table
CREATE TABLE IF NOT EXISTS page_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  page_name VARCHAR(255) NOT NULL,
  page_url VARCHAR(500) NOT NULL,
  page_id VARCHAR(100) NOT NULL,
  gift_link_url VARCHAR(500) NOT NULL,
  gift_link_title VARCHAR(255),
  gift_link_description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, page_id)
);

CREATE INDEX IF NOT EXISTS idx_page_configurations_user_id ON page_configurations(user_id);
CREATE INDEX IF NOT EXISTS idx_page_configurations_page_id ON page_configurations(page_id);

-- User Page Interactions Table
CREATE TABLE IF NOT EXISTS user_page_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_configuration_id UUID NOT NULL REFERENCES page_configurations(id) ON DELETE CASCADE,
  messenger_psid VARCHAR(255) NOT NULL,
  interaction_type VARCHAR(50) NOT NULL CHECK (interaction_type IN ('button_clicked', 'page_visited', 'gift_claimed')),
  self_reported_followed BOOLEAN DEFAULT false,
  gift_claimed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(page_configuration_id, messenger_psid)
);

CREATE INDEX IF NOT EXISTS idx_user_page_interactions_psid ON user_page_interactions(messenger_psid);
CREATE INDEX IF NOT EXISTS idx_user_page_interactions_config ON user_page_interactions(page_configuration_id);
CREATE INDEX IF NOT EXISTS idx_user_page_interactions_gift_claimed ON user_page_interactions(gift_claimed_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_page_configurations_updated_at
  BEFORE UPDATE ON page_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_page_interactions_updated_at
  BEFORE UPDATE ON user_page_interactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE page_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_page_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for page_configurations
CREATE POLICY "Users can view their own page configurations"
  ON page_configurations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own page configurations"
  ON page_configurations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own page configurations"
  ON page_configurations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own page configurations"
  ON page_configurations FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for user_page_interactions
CREATE POLICY "Users can view interactions for their configurations"
  ON user_page_interactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM page_configurations
      WHERE page_configurations.id = user_page_interactions.page_configuration_id
      AND page_configurations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert interactions for their configurations"
  ON user_page_interactions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM page_configurations
      WHERE page_configurations.id = user_page_interactions.page_configuration_id
      AND page_configurations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update interactions for their configurations"
  ON user_page_interactions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM page_configurations
      WHERE page_configurations.id = user_page_interactions.page_configuration_id
      AND page_configurations.user_id = auth.uid()
    )
  );
