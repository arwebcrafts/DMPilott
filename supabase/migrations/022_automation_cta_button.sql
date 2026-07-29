-- =============================================================================
-- Migration 022: CTA button on DMs
-- =============================================================================
-- Lets an automation send a tappable button instead of a bare link, the way
-- creators expect ("Get Access", "Yes, send it"). When button_text and
-- button_url are both set, the DM is sent as an Instagram button template;
-- otherwise it stays a plain text message.
-- =============================================================================

alter table public.automations
  add column if not exists button_text text,
  add column if not exists button_url text;
