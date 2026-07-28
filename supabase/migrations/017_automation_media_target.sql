-- =============================================================================
-- Migration 017: per-post (per-video) automation targeting
-- =============================================================================
-- Adds an optional media target to comment automations.
--
--   media_id IS NULL  -> automation applies to comments on ANY post (whole
--                        account) — the existing behaviour.
--   media_id = '<id>' -> automation only fires on comments under that one post.
--
-- This lets a creator point a keyword automation at a single video while
-- leaving the rest of their account untouched.
-- =============================================================================

ALTER TABLE public.automations
  ADD COLUMN IF NOT EXISTS media_id TEXT;

-- Human-readable label for the picked post (caption snippet), shown in the
-- dashboard so the user recognises which post an automation is bound to.
ALTER TABLE public.automations
  ADD COLUMN IF NOT EXISTS media_caption TEXT;

CREATE INDEX IF NOT EXISTS idx_automations_media_id
  ON public.automations(account_id, media_id)
  WHERE media_id IS NOT NULL;
