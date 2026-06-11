-- Clear old queued logs for the Facebook account
-- This removes the 200+ stuck entries from the Page's own comments

UPDATE dm_logs
SET status = 'failed',
    error_message = 'Cleared: Page comment (bot comment)',
    processed_at = NOW()
WHERE account_id = '91c665ac-261b-46db-bed3-ebdf92ab312d'
AND status IN ('pending', 'claimed')
AND platform = 'facebook';
