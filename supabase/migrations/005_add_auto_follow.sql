-- =============================================
-- Migration: Add auto_follow option to automations
-- =============================================
alter table public.automations
  add column if not exists auto_follow boolean default false;
