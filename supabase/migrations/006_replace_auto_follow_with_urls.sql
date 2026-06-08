-- =============================================
-- Migration: Replace auto_follow with follow URLs
-- =============================================

-- Drop auto_follow column
alter table public.automations
  drop column if exists auto_follow;

-- Add follow URL columns
alter table public.automations
  add column if not exists follow_facebook_url text;

alter table public.automations
  add column if not exists follow_instagram_url text;
