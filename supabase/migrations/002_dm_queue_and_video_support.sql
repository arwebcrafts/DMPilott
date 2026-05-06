-- Add queue metadata for comment-triggered DM processing and optional DM video attachment support.

alter table public.automations
  add column if not exists dm_video_url text;

alter table public.dm_logs
  add column if not exists comment_id text;

create index if not exists idx_dm_logs_account_platform_status_created
  on public.dm_logs(account_id, platform, status, created_at);
