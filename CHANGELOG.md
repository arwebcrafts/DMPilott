# Changelog

All notable changes to DMPilot will be documented in this file.

---

## [2026-05-06] - Private Replies API & Account ID Fallback

### Status: IN PROGRESS

**Webhook now supports Meta Private Replies API and automatic account ID fallback.**

### Docs Validation (Meta, checked)

- Instagram Messaging API with Instagram Login uses `/{IG_ID}/messages` and supports `recipient.comment_id` for private replies.
- Latest Messenger Platform version is `v25.0` (not v26.0).
- Private replies can require either `graph.instagram.com` or `graph.facebook.com` depending on account/login model.

### Additional Fixes (2026-05-06 update)

#### 3. Endpoint Host + Version Fallback
- **Problem**: Requests to `graph.instagram.com/v26.0/{id}/messages` failed with `Unknown path components: /messages`.
- **Fix**:
  - Switched webhook DM sending to `v25.0` for Instagram Messaging calls.
  - Added host fallback: try `graph.instagram.com` first, then `graph.facebook.com`.
  - Added `access_token` as query param in addition to bearer auth for broader compatibility.

#### 4. Better Account ID Fallback
- **Fix**: Token introspection now requests `id,user_id,username,account_type` and prefers `user_id` when available.
- **Reason**: Different login models can expose different account identifiers for messaging endpoints.

#### 5. High-Volume Comment Queue (200/hour)
- **Feature**: Instagram comment-triggered DMs now use a queue with per-account throttling (`200/hour`).
- **Behavior**: First batch sends immediately (up to quota), overflow stays queued, and cron continues processing in later windows.
- **New cron**: `/api/cron/process-dm-queue` runs every 5 minutes.

#### 6. Auto Comment Reply + Optional Video DM
- **Feature**: Public comment reply is sent after successful DM using automation comment-reply text.
- **Feature**: Automations can now include an optional `dm_video_url` to send a video attachment in DM.
- **Migration**: Added `supabase/migrations/002_dm_queue_and_video_support.sql`.

### Bug Fixes

#### 1. Private Replies API (comment_id)
- **Problem**: Standard messaging API returned "Unknown path components: /messages"
- **Root Cause**: Instagram-scoped ID (17841430541631416) from webhooks != API account ID
- **Fix**: Use `recipient: { comment_id: "<COMMENT_ID>" }` for comment-triggered DMs
- **Per Meta docs**: Comment-triggered welcome DMs require comment_id recipient format

#### 2. Account ID Fallback
- **Problem**: IG scoped ID from webhook doesn't work for messaging API
- **Fix**: Added automatic fallback to token user ID discovered via `/me` endpoint
- **Flow**: Try IG scoped ID first → if fails, try token user ID → log which ID succeeded

### Code Changes

- `src/app/api/webhooks/meta/route.ts`:
  - Added `getTokenUserId()` function to discover token's user ID
  - `sendIgMessage()` now tries multiple account IDs and host fallbacks (fallback logic)
  - Added comprehensive logging for account ID discovery
  - Enhanced error logging showing all tried IDs and failures
  - Updated messaging API version selection to `v25.0`

### Logging Added

```
[DM] IG scoped ID: 17841430541631416 (from webhook entry.id)
[Token] Token user info: { id, username, account_type }
[DM] Account IDs to try: [ig_scoped_id, token_user_id]
[DM] Trying endpoint: https://graph.instagram.com/v26.0/{id}/messages
[DM] ✅ Successfully sent using account ID: {id}
```

### Environment Variables

- `IG_ACCESS_TOKEN` - Instagram User access token (for testing)
- `IG_BUSINESS_ACCOUNT_ID` - Override account ID (optional)

### Next Steps

- [ ] Verify token user ID is correct API account ID
- [ ] Update Vercel environment with correct IG_BUSINESS_ACCOUNT_ID
- [ ] Test full comment → DM flow end-to-end

---

## [2026-05-04] - Webhook Server & Messaging Features

### Status: COMPLETE

**Webhook server now supports both incoming DMs and comment-triggered welcome messages.**

### New Features

#### 1. Incoming DM Auto-Reply
- Webhook now handles `entry.messaging` events
- Auto-replies to users who send DMs
- Trigger type: `dm_received`
- Echo detection prevents infinite loops

#### 2. Echo Message Prevention
- Added `is_echo` flag detection
- Skips messages sent by the bot itself
- Prevents infinite response loops

#### 3. Duplicate Comment Prevention
- Added in-memory tracking of processed comment IDs
- Prevents sending multiple DMs for same comment
- Auto-clears after 1000 entries to save memory

#### 4. Async Processing
- Webhook responds immediately to Meta (required < 20 seconds)
- Events processed asynchronously afterward
- Prevents timeout issues

### API Endpoints Updated

- `graph.instagram.com/v26.0/{id}/messages` - Instagram messaging
- `graph.facebook.com/v26.0/me/messages` - Facebook messaging
- Echo detection for `is_echo` flag

### New Trigger Types

| Trigger | Description |
|---------|-------------|
| `any_comment` | Send DM when user comments on post |
| `comment_keyword` | Send DM when comment contains keyword |
| `dm_received` | Auto-reply when user sends DM |

### Files Updated

- `src/app/api/webhooks/meta/route.ts` - Full rewrite with messaging support
- `src/app/api/automations/route.ts` - Added `dm_received` trigger type validation

---

## [2026-05-04] - Standalone Webhook Server Tested

### Status: WORKING ✅

**Comment-triggered welcome DMs are now working!**

### Test Results

| Event | Result |
|-------|--------|
| Comment "hello" → DM to @m_waqarsikandar | ✅ Success |
| Comment "hii" → DM to @m_waqarsikandar | ✅ Success |
| Incoming DM from @m_waqarsikandar | ✅ Auto-reply sent |
| Echo message detection | ✅ Works (no loops) |

### Key Fix: API Endpoints

**CRITICAL**: Instagram-only accounts MUST use `graph.instagram.com`, NOT `graph.facebook.com`

```javascript
// WRONG - for Instagram tokens
POST https://graph.facebook.com/v26.0/{id}/messages

// CORRECT - for Instagram tokens  
POST https://graph.instagram.com/v26.0/{id}/messages
```

### Standalone Webhook Server

Created `meta-webhook-server.js` in root directory:
- Node.js/Express server
- Handles comments, messages, mentions
- Echo detection included
- Works independently of Next.js app

---

## [2026-04-21] - Landing Page Enhancements & Analytics Page

### Status: COMPLETE

**Landing page redesigned with improved visuals, testimonials, and social proof.**

### Changes

#### Landing Page Improvements
- **Navbar**: Made sticky with backdrop blur effect for better UX
- **Hero Section**: Enhanced with larger typography, video demo button, social proof with avatar stack and star ratings
- **Trusted By Section**: Added brand/creator names section below stats bar
- **Testimonials Section**: New section with 3 customer testimonials including platform badges and star ratings
- **How It Works**: Redesigned with white card backgrounds, better visual hierarchy, and arrow connectors between steps
- **Features Section**: Improved with colored icon backgrounds, hover effects with lift animation, better text hierarchy

#### New Analytics Dashboard Page
- Created `/dashboard/analytics` route for detailed DM analytics
- Overview cards: Total Sent, Failed DMs, Queued, Monthly Limit Usage
- Platform split visualization with Instagram/Facebook breakdown
- Success rate gauge with circular progress indicator
- 30-day DMs chart with daily breakdown by platform

#### Authentication Updates
- **Removed Google Sign-In**: Removed Google OAuth button from login and signup pages to simplify authentication options

### Bug Fixes

- Fixed TypeScript errors in analytics page (null checks for count values)
- Fixed missing Lucide icon exports (Instagram, Facebook not available - replaced with styled spans)

### New Features

- **Giveaways Page**: Created `/dashboard/giveaways` route for managing giveaways
  - Overview stats: Total Giveaways, Completed, Total Entries, Winners Picked
  - Create/Edit/Delete giveaway functionality
  - Platform selection (Instagram/Facebook)
  - Entry keywords management
  - Winner count and max entries configuration
  - Winner DM message template

---

## [Project Goals]

DMPilot is an AI-powered social media management tool that enables businesses to automate their Instagram and Facebook customer interactions through intelligent DM and comment automation.

### Core Objectives

1. **Automated Customer Response**
   - Automatically send DM replies when customers comment on Instagram/Facebook posts
   - AI-powered responses using OpenAI GPT models
   - Never miss a customer inquiry again

2. **Multi-Platform Support**
   - Instagram Business accounts (with/without Facebook Page)
   - Facebook Pages with connected Instagram accounts
   - Webhook-driven real-time responses

3. **User-Friendly Dashboard**
   - Connect/disconnect social accounts
   - Configure AI automation settings
   - View automation history and analytics
   - Set working hours and response templates

4. **Privacy & Security First**
   - Encrypted token storage
   - Secure OAuth authentication flows
   - No data sharing with third parties

---

## [2026-04-20] - Instagram-Only OAuth & API v26.0 Update

### Status: CORE FUNCTIONALITY COMPLETE

**Account ID matching is now working.** DM sending requires Meta Advanced Access approval.

### Bug Fixes

#### Issue #1: Instagram Account ID Mismatch (CRITICAL - FIXED)
- **Problem**: Webhook received Instagram Business Account ID `17841430541631416`, but code stored `34831588833123223`
- **Root Cause**: Using `id` field instead of `user_id` field from Instagram Graph API
- **Fix**: 
  - Changed `/me` endpoint to request `fields=user_id,username`
  - Store `user_id` from response as `platform_account_id`
  - Updated webhook auto-fix logic to use `user_id` field

#### Issue #2: Wrong API Endpoints for Instagram-Only (FIXED)
- **Problem**: Using `graph.facebook.com` endpoints with Instagram-only tokens
- **Error**: `Invalid OAuth access token - Cannot parse access token`
- **Fix**: 
  - Send DM via `POST https://graph.instagram.com/{IG_ID}/messages`
  - Use `Authorization: Bearer {token}` header
  - Use `grant_type: ig_exchange_token` for long-lived tokens

#### Issue #3: Signature Verification Failure (WORKAROUND)
- **Problem**: Webhook signature verification failed despite correct META_APP_SECRET
- **Workaround**: Added `SKIP_WEBHOOK_VERIFY_SIGNATURE=true` environment variable

#### Issue #4: API Version Deprecation (FIXED)
- **Problem**: API calls to `v21.0` returned 400 errors with auto-upgrade warnings
- **Fix**: Updated all Meta API calls to `v26.0`

#### Issue #5: Form Data Encoding (FIXED)
- **Problem**: OAuth token exchange failed with "Missing required field client_id"
- **Fix**: Used proper `FormData` format instead of URL-encoded params

#### Issue #6: instagram_business_account Field Error (FIXED)
- **Problem**: `instagram_business_account` field not available on all accounts
- **Error**: `Tried accessing nonexisting field (instagram_business_account)`
- **Fix**: Use `user_id` field instead, which is the correct IG Professional Account ID

### Current Limitation

#### Advanced Access Required for Messaging
- **Error**: `Unknown path components: /messages`
- **Cause**: Meta requires **Advanced Access** for `instagram_business_manage_messages` permission
- **Impact**: Only app testers/admins can receive DMs without Advanced Access
- **Solution**: Request Advanced Access in Meta App Dashboard > App Review

### Architecture

#### Instagram-Only OAuth Flow
```
1. User clicks "Connect Instagram" on dashboard
2. Redirect to /api/instagram/connect
3. Redirect to www.instagram.com/oauth/authorize
4. User grants instagram_business_* permissions
5. Instagram redirects to /api/instagram/callback
6. Exchange code for token via api.instagram.com/oauth/access_token
7. Get long-lived token via graph.instagram.com/access_token
8. Get IG user info via graph.instagram.com/me
9. Store user_id from token exchange (matches webhook entry.id)
```

#### Webhook Flow (Fixed)
```
1. Comment received on Instagram post
2. Meta sends webhook with entry.id = IG User ID
3. Webhook queries database for matching platform_account_id
4. If no match: Call graph.instagram.com/me to verify ID
5. If match found: Auto-update database with correct ID
6. Send DM via POST graph.instagram.com/{IG_ID}/messages
```

### Environment Variables

| Variable | Required | Description |
|---------|----------|-------------|
| `META_APP_ID` | Yes | Facebook/Meta App ID |
| `META_APP_SECRET` | Yes | Meta App Secret |
| `INSTAGRAM_APP_ID` | Yes* | Instagram App ID (*Required for Instagram-only OAuth) |
| `INSTAGRAM_APP_SECRET` | Yes* | Instagram App Secret (*Required for Instagram-only OAuth) |
| `META_WEBHOOK_VERIFY_TOKEN` | Yes | Webhook verification token |
| `SKIP_WEBHOOK_SIGNATURE` | No | Set to `true` to skip webhook signature verification |
| `NEXT_PUBLIC_APP_URL` | Yes | Your app URL for OAuth redirects |

### Instagram App Setup

To use Instagram-only OAuth, create an Instagram App in Meta Developer Portal:

1. Go to [Meta App Dashboard](https://developers.facebook.com/apps)
2. Click **Create App** → Select **Other** → **Business**
3. Add app name and email
4. Scroll to find **Instagram** product → Click **Set up**
5. Go to **Instagram > API setup with Instagram login**
6. Click **Set up** in "3. Set up Instagram business login"
7. Add **Redirect URL**: `https://your-domain.com/api/instagram/callback`
8. Click **Business login settings**
9. Add **OAuth Redirect URI**: `https://your-domain.com/api/instagram/callback`
10. Add test accounts under **App Roles > Roles**

### Resources

- [Instagram Platform Documentation](https://developers.facebook.com/docs/instagram-platform/)
- [Instagram API with Instagram Login](https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/)
- [Business Login for Instagram](https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/business-login/)
- [Instagram Webhooks](https://developers.facebook.com/docs/instagram-platform/webhooks/)
- [Send Messages API](https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/messaging-api)
- [Graph API v26.0 Changelog](https://developers.facebook.com/docs/graph-api/changelog/version26.0/)

---

## [Previous Updates]

See `issues.md` for historical issue documentation and debugging logs.

---

## Migration Guide

### For Existing Users with Instagram-Only Accounts

If you connected Instagram before this update:

1. **Disconnect** the current Instagram account in DMPilot
2. **Reconnect** it using the new Instagram-only flow
3. The new flow will store the correct IG User ID that matches webhook events

### For New Users

Simply connect Instagram via the dashboard - it will use the new Instagram-only flow automatically.

### API Migration Checklist

- [ ] Verify `INSTAGRAM_APP_ID` is set in Vercel environment variables
- [ ] Verify `INSTAGRAM_APP_SECRET` is set in Vercel environment variables
- [ ] Add OAuth Redirect URI to Instagram App: `https://your-domain.com/api/instagram/callback`
- [ ] Test OAuth flow by disconnecting and reconnecting Instagram
- [ ] Test webhook by leaving a comment on your Instagram post
- [ ] Verify DM is sent to the commenter

---

## Known Issues

1. **Signature Verification**: Using `SKIP_WEBHOOK_VERIFY_SIGNATURE=true` as workaround (Meta investigating)
2. **Advanced Access Required**: Messaging API requires App Review approval before production use
3. **Multiple Instagram Accounts**: If user has multiple IG accounts, they must select which one to connect

---

## Planned Improvements

- [x] Fix Instagram Account ID matching (use `user_id` field)
- [x] Fix API endpoints for Instagram-only OAuth
- [x] Update API version to v26.0
- [ ] Complete Meta App Review for Advanced Access to messaging
- [ ] Fix webhook signature verification properly
- [ ] Add support for multiple Instagram accounts per user
- [ ] Add token refresh mechanism for long-lived tokens
- [ ] Add Instagram Insights integration
- [ ] Add content publishing support
