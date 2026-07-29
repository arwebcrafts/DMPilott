-- =============================================================================
-- Migration 015: make the DM dedup index applicable, and verify the schema
-- =============================================================================
--
-- WHY THIS EXISTS
--
-- Migration 014 adds a unique index on dm_logs(comment_id). Postgres refuses to
-- build a unique index when the column already contains duplicates:
--
--   ERROR: could not create unique index "idx_dm_logs_comment_id_unique"
--   DETAIL: Key (comment_id)=(...) is duplicated.
--
-- Any database that already sent duplicate DMs therefore *cannot* apply 014 —
-- the index silently never gets created, the webhook handler loses its only
-- race-proof guard, and duplicates keep happening. This migration clears the
-- existing duplicate rows first, then creates the index.
--
-- Safe to run repeatedly. Run it in the Supabase SQL Editor.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Make sure every column the app writes actually exists.
--    (Repeats earlier migrations idempotently so a partially-migrated database
--    is brought fully up to date by this one file.)
-- ---------------------------------------------------------------------------
alter table public.dm_logs
  add column if not exists comment_id text;

alter table public.automations
  add column if not exists dm_video_url text,
  add column if not exists follow_facebook_url text,
  add column if not exists follow_instagram_url text;

alter table public.connected_accounts
  add column if not exists ig_business_account_id text;

-- Allow the trigger types the app actually creates.
alter table public.automations
  drop constraint if exists automations_trigger_type_check;

alter table public.automations
  add constraint automations_trigger_type_check
  check (trigger_type in ('comment_keyword', 'story_reply', 'any_comment', 'dm_received', 'story_mention'));

-- ---------------------------------------------------------------------------
-- 2. Collapse existing duplicate dm_logs rows.
--    Keep the oldest row per comment_id (that is the one that actually sent the
--    first DM) and delete the rest.
-- ---------------------------------------------------------------------------
with ranked as (
  select
    id,
    row_number() over (
      partition by comment_id
      order by created_at asc, id asc
    ) as rn
  from public.dm_logs
  where comment_id is not null
)
delete from public.dm_logs
where id in (select id from ranked where rn > 1);

-- ---------------------------------------------------------------------------
-- 3. Now the unique index can be built. This is the guard that makes the
--    webhook handler race-proof: when Meta retries a delivery and several
--    serverless invocations run concurrently, only the first INSERT succeeds
--    and the others get a 23505 unique violation, which the handler treats as
--    "already processed".
-- ---------------------------------------------------------------------------
create unique index if not exists idx_dm_logs_comment_id_unique
  on public.dm_logs (comment_id)
  where comment_id is not null;

create index if not exists idx_dm_logs_dedup_cooldown
  on public.dm_logs (automation_id, commenter_platform_id, platform, created_at desc);

create index if not exists idx_connected_accounts_ig_business_account_id
  on public.connected_accounts (ig_business_account_id);

-- ---------------------------------------------------------------------------
-- 4. Verification. Every row must report 'OK'. If the dedup index row is
--    missing or reports MISSING, duplicate DMs are still possible.
-- ---------------------------------------------------------------------------
select
  'dm_logs.comment_id column' as check_name,
  case when exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'dm_logs' and column_name = 'comment_id'
  ) then 'OK' else 'MISSING' end as status
union all
select
  'dm_logs unique dedup index',
  case when exists (
    select 1 from pg_indexes
    where schemaname = 'public' and indexname = 'idx_dm_logs_comment_id_unique'
  ) then 'OK' else 'MISSING' end
union all
select
  'connected_accounts.ig_business_account_id',
  case when exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'connected_accounts' and column_name = 'ig_business_account_id'
  ) then 'OK' else 'MISSING' end
union all
select
  'automations.follow_instagram_url',
  case when exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'automations' and column_name = 'follow_instagram_url'
  ) then 'OK' else 'MISSING' end
union all
select
  'remaining duplicate comment_id rows',
  case when exists (
    select 1 from public.dm_logs
    where comment_id is not null
    group by comment_id having count(*) > 1
  ) then 'STILL DUPLICATED' else 'OK' end;
