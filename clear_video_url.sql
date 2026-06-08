-- Clear video URL from dm_received automation to fix size limit error
UPDATE automations
SET dm_video_url = NULL
WHERE trigger_type = 'dm_received'
  AND dm_video_url IS NOT NULL;

-- Verify
SELECT id, name, trigger_type, dm_video_url
FROM automations
WHERE trigger_type = 'dm_received';
