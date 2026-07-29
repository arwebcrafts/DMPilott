-- =============================================================================
-- Migration 021: webhook delivery diagnostics
-- =============================================================================
-- Records every inbound Meta webhook and what we did with it, so "no DM
-- arrived" can be diagnosed from the dashboard instead of guessing:
--   rejected_signature | no_account | no_automation | no_keyword_match
--   | queued | sent | send_failed | limit_reached
--
-- Small, self-pruning table (see the trim trigger at the bottom).
-- =============================================================================

create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  received_at timestamptz not null default now(),
  object_type text,                 -- 'instagram' | 'page'
  event_kind text,                  -- 'comment' | 'message' | 'story' | 'other'
  ig_account_id text,               -- entry.id from Meta
  account_id uuid references public.connected_accounts(id) on delete set null,
  user_id uuid references public.users(id) on delete cascade,
  outcome text not null,
  detail text,                      -- error message / reason / matched keyword
  payload_preview text
);

create index if not exists idx_webhook_events_received
  on public.webhook_events(received_at desc);
create index if not exists idx_webhook_events_user
  on public.webhook_events(user_id, received_at desc);

alter table public.webhook_events enable row level security;

-- Users can read only their own delivery history. Rows with a NULL user_id
-- (e.g. signature rejections, unknown account) are visible only to the service
-- role, which is what the diagnostics endpoint uses.
drop policy if exists "Users can view own webhook events" on public.webhook_events;
create policy "Users can view own webhook events"
  on public.webhook_events for select
  using (auth.uid() = user_id);

-- Keep the table small: drop anything older than 7 days on insert (cheap,
-- probabilistic — only runs occasionally).
create or replace function public.trim_webhook_events()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if random() < 0.02 then
    delete from public.webhook_events where received_at < now() - interval '7 days';
  end if;
  return null;
end;
$$;

drop trigger if exists webhook_events_trim on public.webhook_events;
create trigger webhook_events_trim
  after insert on public.webhook_events
  for each statement execute function public.trim_webhook_events();
