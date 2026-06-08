-- =============================================
-- Migration: Add ig_business_account_id to connected_accounts
-- =============================================
-- Instagram exposes two different IDs for the same account:
--   1. App-scoped ID (returned by OAuth /me) -> stored in platform_account_id
--   2. IG Business Account ID (sent in webhook entry.id) -> stored here
-- Webhook events arrive keyed by the IG Business Account ID, so we need to
-- store and match against it to find the correct connected account.

alter table public.connected_accounts
  add column if not exists ig_business_account_id text;

create index if not exists idx_connected_accounts_ig_business_account_id
  on public.connected_accounts (ig_business_account_id);
