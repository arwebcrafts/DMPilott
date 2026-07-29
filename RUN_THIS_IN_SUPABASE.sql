-- ============================================================================
--  DMPilot — RUN THIS ONE FILE IN SUPABASE
-- ============================================================================
--
--  HOW:
--    1. Open your Supabase project
--    2. Left sidebar → SQL Editor → New query
--    3. Paste this ENTIRE file
--    4. Click "Run"
--
--  It is safe to run as many times as you like — it only adds what is missing
--  and never deletes your data. This replaces migrations 014 through 022.
--
--  When it finishes, the results panel shows a checklist. Every row must say
--  'OK'. If any row says 'MISSING', copy it and send it over.
-- ============================================================================


-- ── 1. Columns the app writes ───────────────────────────────────────────────

alter table public.dm_logs
  add column if not exists comment_id text;

alter table public.automations
  add column if not exists dm_video_url text,
  add column if not exists follow_facebook_url text,
  add column if not exists follow_instagram_url text,
  add column if not exists media_id text,            -- target one specific post
  add column if not exists media_caption text,
  add column if not exists flow_steps jsonb,         -- multi-step message flow
  add column if not exists button_text text,         -- CTA button label
  add column if not exists button_url text;          -- CTA button link

alter table public.connected_accounts
  add column if not exists ig_business_account_id text,
  add column if not exists granted_scopes text[];  -- permissions Meta actually gave us


-- ── 2. Allowed values ───────────────────────────────────────────────────────

-- Trigger types the app can create (adds story replies + story mentions)
alter table public.automations
  drop constraint if exists automations_trigger_type_check;
alter table public.automations
  add constraint automations_trigger_type_check
  check (trigger_type in ('comment_keyword','story_reply','any_comment','dm_received','story_mention'));

-- Plans (adds the Business tier)
alter table public.users
  drop constraint if exists users_plan_check;
alter table public.users
  add constraint users_plan_check
  check (plan in ('free','creator','pro','business'));

alter table public.subscriptions
  drop constraint if exists subscriptions_plan_check;
alter table public.subscriptions
  add constraint subscriptions_plan_check
  check (plan in ('free','creator','pro','business'));


-- ── 3. Stop duplicate DMs ───────────────────────────────────────────────────
-- Remove existing duplicates first, otherwise the unique index cannot be built
-- (this is why the duplicate-DM fix could not apply before).

with ranked as (
  select id,
         row_number() over (partition by comment_id order by created_at asc, id asc) as rn
  from public.dm_logs
  where comment_id is not null
)
delete from public.dm_logs
where id in (select id from ranked where rn > 1);

create unique index if not exists idx_dm_logs_comment_id_unique
  on public.dm_logs (comment_id)
  where comment_id is not null;

create index if not exists idx_dm_logs_dedup_cooldown
  on public.dm_logs (automation_id, commenter_platform_id, platform, created_at desc);

create index if not exists idx_connected_accounts_ig_business_account_id
  on public.connected_accounts (ig_business_account_id);

create index if not exists idx_automations_media_id
  on public.automations (account_id, media_id) where media_id is not null;

create index if not exists idx_automations_user_active
  on public.automations (user_id, is_active);


-- ── 4. Monthly DM usage counter ─────────────────────────────────────────────

create or replace function public.increment_dm_usage(p_user_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.users
  set dms_used_this_month = coalesce(dms_used_this_month, 0) + 1
  where id = p_user_id;
$$;


-- ── 5. Waitlist ─────────────────────────────────────────────────────────────

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);
create index if not exists idx_waitlist_created_at on public.waitlist(created_at desc);
alter table public.waitlist enable row level security;


-- ── 6. Diagnostics log (powers the Diagnostics page) ────────────────────────

create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  received_at timestamptz not null default now(),
  object_type text,
  event_kind text,
  ig_account_id text,
  account_id uuid references public.connected_accounts(id) on delete set null,
  user_id uuid references public.users(id) on delete cascade,
  outcome text not null,
  detail text,
  payload_preview text
);

create index if not exists idx_webhook_events_received on public.webhook_events(received_at desc);
create index if not exists idx_webhook_events_user on public.webhook_events(user_id, received_at desc);

alter table public.webhook_events enable row level security;
drop policy if exists "Users can view own webhook events" on public.webhook_events;
create policy "Users can view own webhook events"
  on public.webhook_events for select using (auth.uid() = user_id);

-- Keep the table small automatically
create or replace function public.trim_webhook_events()
returns trigger language plpgsql security definer set search_path = public as $$
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


-- ============================================================================
--  CHECKLIST — every row below must say 'OK'
-- ============================================================================

select 'dm_logs.comment_id column' as check_name,
  case when exists (select 1 from information_schema.columns
    where table_schema='public' and table_name='dm_logs' and column_name='comment_id')
  then 'OK' else 'MISSING' end as status
union all
select 'duplicate-DM protection (unique index)',
  case when exists (select 1 from pg_indexes
    where schemaname='public' and indexname='idx_dm_logs_comment_id_unique')
  then 'OK' else 'MISSING' end
union all
select 'automations.media_id (target one post)',
  case when exists (select 1 from information_schema.columns
    where table_schema='public' and table_name='automations' and column_name='media_id')
  then 'OK' else 'MISSING' end
union all
select 'automations.flow_steps (multi-step flows)',
  case when exists (select 1 from information_schema.columns
    where table_schema='public' and table_name='automations' and column_name='flow_steps')
  then 'OK' else 'MISSING' end
union all
select 'automations.button_text (CTA button)',
  case when exists (select 1 from information_schema.columns
    where table_schema='public' and table_name='automations' and column_name='button_text')
  then 'OK' else 'MISSING' end
union all
select 'connected_accounts.ig_business_account_id',
  case when exists (select 1 from information_schema.columns
    where table_schema='public' and table_name='connected_accounts' and column_name='ig_business_account_id')
  then 'OK' else 'MISSING' end
union all
select 'connected_accounts.granted_scopes',
  case when exists (select 1 from information_schema.columns
    where table_schema='public' and table_name='connected_accounts' and column_name='granted_scopes')
  then 'OK' else 'MISSING' end
union all
select 'webhook_events table (Diagnostics page)',
  case when exists (select 1 from information_schema.tables
    where table_schema='public' and table_name='webhook_events')
  then 'OK' else 'MISSING' end
union all
select 'increment_dm_usage function',
  case when exists (select 1 from information_schema.routines
    where routine_schema='public' and routine_name='increment_dm_usage')
  then 'OK' else 'MISSING' end
union all
select 'remaining duplicate rows',
  case when exists (select 1 from public.dm_logs where comment_id is not null
    group by comment_id having count(*) > 1)
  then 'STILL DUPLICATED' else 'OK' end;
