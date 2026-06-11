-- Link in Bio: bio pages, blocks, subscribers, clicks

CREATE TABLE IF NOT EXISTS bio_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  theme JSONB NOT NULL DEFAULT '{"preset":"gradient","backgroundColor":"#8134AF","buttonColor":"#ffffff","buttonTextColor":"#1a1a1a","fontFamily":"system-ui"}'::jsonb,
  social_links JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_published BOOLEAN NOT NULL DEFAULT false,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT bio_pages_slug_format CHECK (slug ~ '^[a-z0-9_-]{3,30}$')
);

CREATE TABLE IF NOT EXISTS bio_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bio_page_id UUID NOT NULL REFERENCES bio_pages(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('link', 'header', 'email_capture', 'product')),
  title TEXT,
  url TEXT,
  description TEXT,
  image_url TEXT,
  price TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  click_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bio_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bio_page_id UUID NOT NULL REFERENCES bio_pages(id) ON DELETE CASCADE,
  block_id UUID REFERENCES bio_blocks(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bio_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bio_page_id UUID NOT NULL REFERENCES bio_pages(id) ON DELETE CASCADE,
  block_id UUID REFERENCES bio_blocks(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL DEFAULT 'click' CHECK (event_type IN ('click', 'view')),
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bio_pages_user_id ON bio_pages(user_id);
CREATE INDEX IF NOT EXISTS idx_bio_pages_slug ON bio_pages(slug);
CREATE INDEX IF NOT EXISTS idx_bio_blocks_bio_page_id ON bio_blocks(bio_page_id);
CREATE INDEX IF NOT EXISTS idx_bio_blocks_sort_order ON bio_blocks(bio_page_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_bio_subscribers_bio_page_id ON bio_subscribers(bio_page_id);
CREATE INDEX IF NOT EXISTS idx_bio_clicks_bio_page_id ON bio_clicks(bio_page_id);
CREATE INDEX IF NOT EXISTS idx_bio_clicks_block_id ON bio_clicks(block_id);
CREATE INDEX IF NOT EXISTS idx_bio_clicks_created_at ON bio_clicks(created_at);

-- RLS
ALTER TABLE bio_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE bio_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE bio_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bio_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bio pages"
  ON bio_pages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bio pages"
  ON bio_pages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bio pages"
  ON bio_pages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own bio pages"
  ON bio_pages FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own bio blocks"
  ON bio_blocks FOR SELECT
  USING (EXISTS (SELECT 1 FROM bio_pages WHERE bio_pages.id = bio_blocks.bio_page_id AND bio_pages.user_id = auth.uid()));
CREATE POLICY "Users can insert own bio blocks"
  ON bio_blocks FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM bio_pages WHERE bio_pages.id = bio_blocks.bio_page_id AND bio_pages.user_id = auth.uid()));
CREATE POLICY "Users can update own bio blocks"
  ON bio_blocks FOR UPDATE
  USING (EXISTS (SELECT 1 FROM bio_pages WHERE bio_pages.id = bio_blocks.bio_page_id AND bio_pages.user_id = auth.uid()));
CREATE POLICY "Users can delete own bio blocks"
  ON bio_blocks FOR DELETE
  USING (EXISTS (SELECT 1 FROM bio_pages WHERE bio_pages.id = bio_blocks.bio_page_id AND bio_pages.user_id = auth.uid()));

CREATE POLICY "Users can view own bio subscribers"
  ON bio_subscribers FOR SELECT
  USING (EXISTS (SELECT 1 FROM bio_pages WHERE bio_pages.id = bio_subscribers.bio_page_id AND bio_pages.user_id = auth.uid()));

CREATE POLICY "Users can view own bio clicks"
  ON bio_clicks FOR SELECT
  USING (EXISTS (SELECT 1 FROM bio_pages WHERE bio_pages.id = bio_clicks.bio_page_id AND bio_pages.user_id = auth.uid()));

-- Updated at triggers
CREATE TRIGGER update_bio_pages_updated_at
  BEFORE UPDATE ON bio_pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bio_blocks_updated_at
  BEFORE UPDATE ON bio_blocks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
