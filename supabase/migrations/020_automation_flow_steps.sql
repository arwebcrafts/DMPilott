-- =============================================================================
-- Migration 020: multi-step DM flows
-- =============================================================================
-- Adds an optional ordered list of message steps to an automation. NULL / empty
-- means "single message" (the existing dm_message behaviour) — so this change is
-- fully backward compatible. Shape: [{"text": "..."}, {"text": "..."}].
-- =============================================================================

alter table public.automations
  add column if not exists flow_steps jsonb;
