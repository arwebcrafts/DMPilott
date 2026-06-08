-- =============================================
-- FIX: Link the webhook IG Business Account ID to the connected account
-- =============================================
-- The webhook delivers events keyed by the IG Business Account ID
-- (17841430541631416) but OAuth saved the app-scoped ID (34831588833123223)
-- in platform_account_id. This links them so webhook lookups succeed.
--
-- NOTE: Run migration 003_add_ig_business_account_id.sql FIRST.

-- 1. Inspect the account(s) to confirm IDs before updating
SELECT id, username, platform_account_id, ig_business_account_id, is_active
FROM connected_accounts
WHERE username = 'armantesting14';

-- 2. Link the webhook ID (from the logs: entry.id = 17841430541631416)
UPDATE connected_accounts
SET ig_business_account_id = '17841430541631416'
WHERE username = 'armantesting14'
  AND platform = 'instagram'
  AND platform_account_id = '34831588833123223';

-- 3. Verify the update
SELECT id, username, platform_account_id, ig_business_account_id, is_active
FROM connected_accounts
WHERE username = 'armantesting14';
