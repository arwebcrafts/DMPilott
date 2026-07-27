-- Add a unique index on comment_id (WHERE NOT NULL) to prevent duplicate DM sends.
-- When Meta retries the same webhook event, multiple parallel serverless invocations
-- may all pass the SELECT dedup check before any INSERT completes. This unique index
-- ensures only the FIRST insert succeeds; subsequent ones fail with a conflict error,
-- which the webhook handler treats as "already processed".
--
-- The index uses a partial WHERE clause so that rows with NULL comment_id (legacy data)
-- are not affected. DM-triggered auto-replies store `mid:<message_id>` in comment_id,
-- while comment-triggered DMs store the actual Instagram comment ID.

CREATE UNIQUE INDEX IF NOT EXISTS idx_dm_logs_comment_id_unique
  ON public.dm_logs(comment_id)
  WHERE comment_id IS NOT NULL;

-- Also add an index for the cooldown dedup query (automation_id + sender + platform + created_at)
CREATE INDEX IF NOT EXISTS idx_dm_logs_dedup_cooldown
  ON public.dm_logs(automation_id, commenter_platform_id, platform, created_at DESC);
