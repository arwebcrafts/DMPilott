-- DMPilot Database Schema
-- Run this in Supabase SQL Editor (Settings > SQL Editor)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =============================================
-- TABLE: users
-- =============================================
create table if not exists public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  stripe_customer_id text,
  plan text not null default 'free' check (plan in ('free', 'creator', 'pro')),
  plan_expires_at timestamptz,
  dms_used_this_month integer not null default 0,
  dms_reset_at timestamptz default date_trunc('month', now()) + interval '1 month',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

-- =============================================
-- TABLE: connected_accounts
-- =============================================
create table if not exists public.connected_accounts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  platform text not null check (platform in ('instagram', 'facebook')),
  platform_account_id text not null,
  username text,
  display_name text,
  profile_picture_url text,
  follower_count integer default 0,
  access_token_encrypted text not null,
  token_expires_at timestamptz,
  is_active boolean not null default true,
  webhook_subscribed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, platform, platform_account_id)
);

alter table public.connected_accounts enable row level security;

create policy "Users can manage own accounts"
  on public.connected_accounts for all
  using (auth.uid() = user_id);

-- =============================================
-- TABLE: automations
-- =============================================
create table if not exists public.automations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  account_id uuid references public.connected_accounts(id) on delete cascade not null,
  name text not null default 'Untitled Automation',
  platform text not null check (platform in ('instagram', 'facebook')),
  trigger_type text not null check (trigger_type in ('comment_keyword', 'story_reply', 'any_comment')),
  keywords text[] not null default '{}',
  dm_message text not null,
  comment_reply_enabled boolean not null default false,
  comment_reply_text text,
  send_delay_seconds integer not null default 0,
  unique_codes_enabled boolean not null default false,
  ai_replies_enabled boolean not null default false,
  is_active boolean not null default true,
  total_dms_sent integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.automations enable row level security;

create policy "Users can manage own automations"
  on public.automations for all
  using (auth.uid() = user_id);

create index idx_automations_user_id on public.automations(user_id);
create index idx_automations_account_id on public.automations(account_id);

-- =============================================
-- TABLE: dm_logs
-- =============================================
create table if not exists public.dm_logs (
  id uuid default uuid_generate_v4() primary key,
  automation_id uuid references public.automations(id) on delete set null,
  user_id uuid references public.users(id) on delete cascade not null,
  account_id uuid references public.connected_accounts(id) on delete set null,
  platform text not null,
  post_id text,
  commenter_platform_id text not null,
  commenter_username text,
  keyword_matched text,
  dm_message_sent text,
  status text not null default 'pending' check (status in ('pending', 'queued', 'sent', 'failed')),
  error_message text,
  retry_count integer not null default 0,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.dm_logs enable row level security;

create policy "Users can view own DM logs"
  on public.dm_logs for select
  using (auth.uid() = user_id);

create index idx_dm_logs_user_id on public.dm_logs(user_id);
create index idx_dm_logs_created_at on public.dm_logs(created_at desc);
create index idx_dm_logs_automation_id on public.dm_logs(automation_id);
create index idx_dm_logs_status on public.dm_logs(status);

-- =============================================
-- TABLE: giveaways
-- =============================================
create table if not exists public.giveaways (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  account_id uuid references public.connected_accounts(id) on delete cascade not null,
  name text not null,
  platform text not null,
  post_id text,
  entry_keyword text not null,
  winner_count integer not null default 1,
  winner_dm_template text,
  non_winner_dm_template text,
  status text not null default 'active' check (status in ('active', 'ended', 'winner_picked')),
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.giveaways enable row level security;

create policy "Users can manage own giveaways"
  on public.giveaways for all
  using (auth.uid() = user_id);

-- =============================================
-- TABLE: giveaway_entries
-- =============================================
create table if not exists public.giveaway_entries (
  id uuid default uuid_generate_v4() primary key,
  giveaway_id uuid references public.giveaways(id) on delete cascade not null,
  commenter_platform_id text not null,
  commenter_username text,
  comment_id text,
  is_winner boolean not null default false,
  dm_sent boolean not null default false,
  entered_at timestamptz not null default now(),
  unique(giveaway_id, commenter_platform_id)
);

alter table public.giveaway_entries enable row level security;

create policy "Users can view own giveaway entries"
  on public.giveaway_entries for select
  using (
    exists (
      select 1 from public.giveaways g
      where g.id = giveaway_entries.giveaway_id and g.user_id = auth.uid()
    )
  );

-- =============================================
-- TABLE: discount_codes
-- =============================================
create table if not exists public.discount_codes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  automation_id uuid references public.automations(id) on delete cascade,
  code text not null,
  assigned_to_platform_id text,
  assigned_at timestamptz,
  is_used boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.discount_codes enable row level security;

create policy "Users can manage own discount codes"
  on public.discount_codes for all
  using (auth.uid() = user_id);

-- =============================================
-- TABLE: subscriptions
-- =============================================
create table if not exists public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null unique,
  stripe_subscription_id text unique,
  stripe_price_id text,
  plan text not null check (plan in ('free', 'creator', 'pro')),
  status text not null check (status in ('active', 'canceled', 'past_due', 'trialing')),
  trial_ends_at timestamptz,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "Users can view own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- =============================================
-- TRIGGER: Auto-create user profile on signup
-- =============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================
-- TRIGGER: Updated at timestamp
-- =============================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql trigger;

drop trigger if exists users_updated_at on public.users;
create trigger users_updated_at
  before update on public.users
  for each row execute procedure public.handle_updated_at();

drop trigger if exists connected_accounts_updated_at on public.connected_accounts;
create trigger connected_accounts_updated_at
  before update on public.connected_accounts
  for each row execute procedure public.handle_updated_at();

drop trigger if exists automations_updated_at on public.automations;
create trigger automations_updated_at
  before update on public.automations
  for each row execute procedure public.handle_updated_at();

drop trigger if exists subscriptions_updated_at on public.subscriptions;
create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute procedure public.handle_updated_at();
