# Webhook Issues Encountered

## 1. Signature Verification Failure (META_APP_SECRET mismatch)

**Problem:** Meta webhook signature verification consistently failed even though the META_APP_SECRET appeared correct.

**Symptoms:**
- Expected signature never matched Meta's signature header
- Secret first 4 chars: `0aaf` (correct)
- Secret length: 32 (correct)

**Root Cause:** Unknown - signatures completely different despite correct secret and body.

**Workaround:** Added `SKIP_WEBHOOK_SIGNATURE=true` environment variable to bypass signature verification for testing.

---

## 2. Body Modification Issue

**Problem:** Initially using `request.text()` to read webhook body, which could cause JSON re-serialization issues.

**Fix Applied:**
```typescript
// Changed from:
const rawBody = await request.text()

// To:
const rawBody = await request.arrayBuffer().then(buf => Buffer.from(buf).toString('utf8'))
```

---

## 3. Instagram Account Matching - Page ID vs IG Account ID (CRITICAL - FIXED)

**Problem:** Webhook sends Instagram `Page ID` (17841430541631416), but code was trying to match against `Instagram Business Account ID` stored in `platform_account_id`.

**Root Cause Identified:** 
- Instagram Comment webhooks send the **Instagram Business Account ID** (IG Scoped ID like `17841430541631416`) in `entry.id`
- The code was calling `me/accounts` which returns **Facebook Page IDs** (totally different IDs like `106330755024913`)
- These two ID types will NEVER match

**Log evidence:**
```
IG Comment received from: m_waqarsikandar text: j
Webhook Page ID: 17841430541631416
Found pages: 2
Checking page ID: 106330755024913 vs webhook pageId: 17841430541631416 ? false
Checking page ID: 105472331022739 vs webhook pageId: 17841430541631416 ? false
No matching IG account found for Page ID: 17841430541631416
```

**Fix Applied (2026-04-20):**
1. Changed account matching to get `instagram_business_account` ID from each Page via `/{page-id}?fields=instagram_business_account`
2. Compare that IG Business Account ID with webhook's `entry.id`
3. Updated API version from v21.0 to v26.0

---

## 4. Facebook API Version Deprecation (FIXED)

**Problem:** API calls to `https://graph.facebook.com/v21.0/...` returned 400 errors with message about auto-upgrade to v25.0.

**Fix Applied (2026-04-20):** Updated all API calls from v21.0 to v26.0 in:
- `src/app/api/webhooks/meta/route.ts`
- `src/workers/dmWorker.ts`
- `src/app/api/meta/callback/route.ts`
- `src/app/api/meta/connect/route.ts`
- `src/app/api/meta/pages/route.ts`
- `src/app/api/meta/complete-instagram/route.ts`
- `src/app/api/migrate-ig-accounts/route.ts`
- `src/app/api/accounts/[id]/route.ts`

---

## 5. Instagram Login vs Facebook Login (MAJOR UPDATE - FIXED)

**Problem:** Instagram connection required Facebook Page, which was confusing for users.

**Root Cause:** 
- Using `instagram_basic,instagram_manage_messages` scopes via Facebook OAuth
- Required Facebook Page linked to Instagram account

**Solution (2026-04-20):**
- Switched to **Instagram Login** OAuth flow
- Using new scopes: `instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments`
- **No Facebook Page required** for Instagram connection
- Directly get IG Business Account ID via `me?fields=id,instagram_business_account`

**Benefits:**
1. No Facebook Page required for Instagram
2. Direct Instagram OAuth
3. Faster connection flow
4. Better user experience

---

## 6. Meta Test Tool Limitation

**Problem:** Meta's webhook test tool sends Page ID as "0" (placeholder), not a real Instagram Page ID.

**Impact:** Testing with Meta's test tool never matches any real account in the database.

**Recommendation:** Test with real Instagram comments, not Meta's test button.

---

## 7. Test Mode URL Confusion

**Problem:** Adding `?test_webhook=true` to the webhook subscription URL causes signature mismatch because Meta signs based on the callback URL.

**Lesson:** Never modify the webhook subscription URL with query parameters. Use environment variables instead.

---

## Current Workaround Summary

To test webhooks in production:
1. Set `SKIP_WEBHOOK_SIGNATURE=true` in Vercel environment variables
2. Set webhook URL to: `https://dmpilott.vercel.app/api/webhooks/meta` (no query params)
3. Leave a real comment on an Instagram post
4. Check logs for DM sending

---

## Database Schema Note

The `platform_account_id` in `connected_accounts` table stores the **Instagram Business Account ID** (IG Scoped ID).

For Instagram Login, the IG Business Account ID is obtained directly via:
```
GET /me?fields=id,instagram_business_account
```

---

## Remaining Issues

1. **Signature verification still broken** - Need to investigate why META_APP_SECRET produces different signature than Meta's header (skip mode enabled for now)

---

## Suggested Next Steps

1. **Debug signature issue** - Compare signature generation locally vs Meta's actual signature
2. **Check if Vercel modifies request body** - Possibly using Next.js middleware or configuration
3. **Test with exact body from logs** - Use the body and signature pairs from logs to verify locally
4. **Reconnect Instagram accounts** - Disconnect existing and reconnect to use new Instagram Login flow

---

## [2026-05-04] - Messaging & Echo Prevention Added

### New: Incoming DM Auto-Reply

Webhook now handles `entry.messaging` events for incoming DMs:
- Extracts sender ID and message text
- Skips echo messages (is_echo flag)
- Finds automations with trigger_type = 'dm_received'
- Sends auto-reply message

### New: Echo Detection

Messages with `is_echo: true` are skipped to prevent infinite loops:
```javascript
if (message?.is_echo) {
  console.log('[Message] Skipping echo message')
  return
}
```

### New: Duplicate Comment Prevention

In-memory tracking prevents multiple DMs for same comment:
```javascript
const processedComments = new Set<string>()
if (processedComments.has(commentId)) return
processedComments.add(commentId)
```

### API Endpoints Confirmed

| Platform | Endpoint |
|----------|----------|
| Instagram | `https://graph.instagram.com/v26.0/{ig_account_id}/messages` |
| Facebook | `https://graph.facebook.com/v26.0/me/messages` |

### Standalone Webhook Server

Working standalone server created at project root: `meta-webhook-server.js`
- Express.js server
- Echo detection included
- Comment-to-DM conversion tested and working
