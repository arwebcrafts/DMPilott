-- =============================================
-- Migration: Allow dm_received (and story_mention) trigger types on automations
-- =============================================
-- Drop the existing CHECK constraint if it exists
alter table public.automations
  drop constraint if exists automations_trigger_type_check;

-- Add the updated CHECK constraint with dm_received and story_mention
alter table public.automations
  add constraint automations_trigger_type_check
  check (trigger_type in ('comment_keyword', 'story_reply', 'any_comment', 'dm_received', 'story_mention'));
