-- =============================================================================
-- Migration 018: monthly DM usage helper
-- =============================================================================
-- Adds an atomic increment for users.dms_used_this_month so concurrent DM sends
-- can't lose counts to a read-modify-write race. The app falls back to a plain
-- update if this function is absent, so running it is recommended but optional.
-- =============================================================================

create or replace function public.increment_dm_usage(p_user_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.users
  set dms_used_this_month = coalesce(dms_used_this_month, 0) + 1
  where id = p_user_id;
$$;

-- Helpful index for counting a user's automations when enforcing plan limits.
create index if not exists idx_automations_user_active
  on public.automations(user_id, is_active);
