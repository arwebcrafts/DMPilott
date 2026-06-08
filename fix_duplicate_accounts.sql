-- DIAGNOSTIC: Check which account has automations
SELECT 
  ca.id as connected_account_id,
  ca.platform_account_id,
  ca.username,
  ca.created_at,
  ca.is_active,
  COUNT(a.id) as automation_count
FROM connected_accounts ca
LEFT JOIN automations a ON a.account_id = ca.id
WHERE ca.platform_account_id = '17841452020342196'
GROUP BY ca.id, ca.platform_account_id, ca.username, ca.created_at, ca.is_active
ORDER BY ca.created_at DESC;

-- DIAGNOSTIC: Check for duplicates on second IG ID (from logs)
SELECT 
  ca.id as connected_account_id,
  ca.platform_account_id,
  ca.username,
  ca.created_at,
  ca.is_active,
  COUNT(a.id) as automation_count
FROM connected_accounts ca
LEFT JOIN automations a ON a.account_id = ca.id
WHERE ca.platform_account_id = '17841430541631416'
GROUP BY ca.id, ca.platform_account_id, ca.username, ca.created_at, ca.is_active
ORDER BY ca.created_at DESC;

-- FIX: Deactivate the older duplicate (keep the one with automations)
-- The diagnostic shows:
-- - 9b59db0c-4df6-4cf1-8f8c-303053c34141 (Jun 1) has 1 automation → KEEP
-- - 5edce151-29f0-4d77-8f0d-7184f71963c1 (May 7) has 0 automations → DEACTIVATE
UPDATE connected_accounts
SET is_active = false
WHERE id = '5edce151-29f0-4d77-8f0d-7184f71963c1'
AND platform_account_id = '17841452020342196';

-- FIX: Reactivate the account since it's currently inactive
-- The newer account (9b59db0c-4df6-4cf1-8f8c-303053c34141) appears to be missing
-- Reactivate the existing account so webhooks can process
UPDATE connected_accounts
SET is_active = true
WHERE id = '5edce151-29f0-4d77-8f0d-7184f71963c1'
AND platform_account_id = '17841452020342196';
