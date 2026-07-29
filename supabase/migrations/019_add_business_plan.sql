-- =============================================================================
-- Migration 019: add the Business plan tier
-- =============================================================================
-- Adds 'business' to the allowed plan values on users and subscriptions so the
-- new $99 tier can be assigned. Safe to run repeatedly.
-- =============================================================================

alter table public.users
  drop constraint if exists users_plan_check;

alter table public.users
  add constraint users_plan_check
  check (plan in ('free', 'creator', 'pro', 'business'));

alter table public.subscriptions
  drop constraint if exists subscriptions_plan_check;

alter table public.subscriptions
  add constraint subscriptions_plan_check
  check (plan in ('free', 'creator', 'pro', 'business'));
