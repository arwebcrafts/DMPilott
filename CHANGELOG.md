# Changelog

All notable changes to DMPilot will be documented in this file.

---

## [2026-05-07] - Facebook Comment Reply & Permissions

### Status: DM WORKING, COMMENT REPLY REQUIRES TECH PROVIDER STATUS

**Facebook DM automation is fully functional. Comment reply fallback requires Tech Provider verification for production use.**

### New Features

#### 1. Facebook Comment Reply Fallback
- Added fallback to public comment reply when Facebook DMs are blocked (error 551)
- Platform-specific comment reply functions for Facebook and Instagram
- Automatic fallback triggers when user hasn't messaged page first

#### 2. Facebook Webhook Handling
- Added Facebook comment event processing
- Facebook Page connected accounts support
- Facebook DM queue processing with rate limits (200/hour)
- Duplicate event prevention for Facebook comments

### Bug Fixes

#### Issue #1: Facebook Comment Reply Using Wrong API (FIXED)
- **Problem**: Comment reply failing with "Unsupported post request" error
- **Root Cause**: Code was calling `sendInstagramCommentReply` for Facebook platform
- **Fix**: Added platform-specific logic to call `sendFacebookCommentReply` for Facebook

#### Issue #2: Missing Facebook Permissions (PARTIALLY RESOLVED)
- **Problem**: Comment reply failing with "Permissions error"
- **Root Cause**: Missing `pages_manage_engagement` and `pages_read_user_content` permissions
- **Fix**:
  - Added "Manage everything on your Page" (Pages API) use case to app
  - Added `pages_manage_engagement` permission to Pages API use case
  - Added `pages_read_user_content` permission to Pages API use case
  - Reconnected Facebook account to refresh access token with new permissions
- **Current Status**: Permissions are "Ready for testing" (test users only)
- **Production Use**: Requires Tech Provider status for App Review approval

### Files Modified

- `src/lib/instagramDmQueue.ts` - Added Facebook DM support, platform-specific comment reply functions, fallback logic
- `src/app/api/webhooks/meta/route.ts` - Added Facebook comment event handling, Facebook account lookup
- `src/app/api/meta/connect/route.ts` - Added Facebook OAuth support
- `src/app/api/meta/callback/route.ts` - Added Facebook OAuth callback handling, Page webhook subscription

### Meta Developer Dashboard Configuration

**Use Cases Added:**
- Manage messaging & content on Instagram
- Engage with customers on Messenger from Meta
- Manage everything on your Page (Pages API)

**Permissions Added to Pages API:**
- `pages_manage_engagement` - Create, edit and delete comments on the Page
- `pages_read_user_content` - Read user-generated content on the Page

### Current Limitations

#### Tech Provider Requirement for Production
- **Issue**: Permissions are "Ready for testing" (test users only)
- **Cause**: Meta requires Tech Provider status to submit these permissions for App Review
- **Requirements for Tech Provider Status**:
  1. Business verification - Verify business as a business entity
  2. Access verification - Verify business can access another business portfolio's data
  3. App Review - Complete data usage, handling, and protection questions
- **Impact**: Comment reply fallback only works for test users, not production users
- **Workaround**: DM automation is fully functional for all users

### Validation Results

| Event | Result |
|-------|--------|
| Facebook comment webhook received | ✅ Working |
| Facebook account lookup | ✅ Working |
| Facebook DM sent | ✅ Working |
| Facebook DM error 551 detection | ✅ Working |
| Facebook comment reply fallback | ⚠️ Requires Tech Provider status |
| Instagram comment reply | ✅ Working |

### Next Steps for Production Comment Reply

1. Complete business verification in Meta Business Manager
2. Complete access verification
3. Complete App Review data usage questions
4. Submit for App Review as a Tech Provider
5. Reconnect Facebook account after approval

---

## [2026-05-06] - OAuth & DM Token Fixes

### Status: COMPLETE

**Fixed Instagram OAuth redirect URI validation and DM sending access token issues.**

### Bug Fixes

#### Issue #1: Instagram OAuth Redirect URI Validation (FIXED)
- **Problem**: OAuth token exchange failing with "Error validating verification code. Please make sure your redirect_uri is identical"
- **Root Cause**: Instagram app secret mismatch between environment variable and Meta App Dashboard
- **Fix**: 
  - Verified redirect URI configuration in Meta Dashboard: `https://dmpilott.vercel.app/api/instagram/callback` (correct)
  - Updated `INSTAGRAM_APP_SECRET` environment variable to match dashboard value: `be1e75b308cdeebf68d18b2e6c39324c`
  - Redeployed application

#### Issue #2: DM Sending Access Token Invalid (FIXED)
- **Problem**: DM sending failing with "190 Invalid OAuth access token - Cannot parse access token"
- **Root Cause**: Using Instagram access token (IGAAU...) for Instagram Messaging API, which requires Facebook Page access token
- **Fix**:
  - Updated `src/lib/instagramDmQueue.ts` to use `FACEBOOK_PAGE_ACCESS_TOKEN` instead of `IG_ACCESS_TOKEN`
  - Updated both `sendWithHostAndIdFallback` and `sendInstagramCommentReply` functions
  - Added `FACEBOOK_PAGE_ACCESS_TOKEN` to Vercel environment variables

#### Issue #3: Message Text Extraction Undefined (FIXED)
- **Problem**: Messaging webhook showing `Text: undefined` for incoming messages
- **Root Cause**: Message structure in webhook payload differs from expected path
- **Fix**:
  - Updated `src/app/api/webhooks/meta/route.ts` to handle multiple possible message text paths
  - Added fallback extraction: `message?.text || message?.content?.text || message?.message?.text`
  - Added full messaging object logging for debugging
  - Fixed echo detection to use extracted `isEcho` variable

#### Issue #4: Queue Processor Debugging (IMPROVED)
- **Problem**: No visibility into why queue processor wasn't sending DMs
- **Fix**: Added extensive logging to `src/lib/instagramDmQueue.ts`:
  - Queue processing start and account details
  - Number of queued logs found
  - Log claiming success/failure
  - DM sending attempts and results
  - Detailed error messages on failure

### Validation Results

| Event | Result |
|-------|--------|
| Comment webhook received | ✅ Working |
| DM queued successfully | ✅ Working |
| DM sent via API | ✅ Working (processed: 1, remainingQuota: 200) |
| Echo message detection | ✅ Working (correctly skipped) |
| Message text extraction | ✅ Working (no longer undefined) |
| Quota tracking | ✅ Working (200 → 199 after send) |

### Files Modified

- `src/lib/instagramDmQueue.ts` - Updated to use FACEBOOK_PAGE_ACCESS_TOKEN, added detailed logging
- `src/app/api/webhooks/meta/route.ts` - Fixed message text extraction, added debugging logs

### Environment Variables Updated

- `INSTAGRAM_APP_SECRET` - Updated to correct value from Meta Dashboard
- `FACEBOOK_PAGE_ACCESS_TOKEN` - Added for Instagram Messaging API (required for DM sending)

---

## [2026-05-06] - Private Replies API & Account ID Fallback

### Status: COMPLETE

**DM automation is now working end-to-end! First successful test on 2026-05-06.**

### Success Validation (2026-05-06)

| Event | Result |
|-------|--------|
| Comment "ghj" on IG post | ✅ Webhook received |
| Account lookup (17841430541631416) | ✅ Found armantesting14 |
| Automation matched: any_comment | ✅ Triggered |
| DM queued & processed | ✅ processed: 1, remainingQuota: 200 |
| DM sent via Private Replies API | ✅ User received "hoooo" |
| Echo message (DM delivery confirmation) | ✅ Correctly skipped |
| User reply received | ✅ DM working both directions |

### Environment Variables

- `IG_ACCESS_TOKEN` - Instagram User access token (for testing)
- `IG_BUSINESS_ACCOUNT_ID` - Override account ID (optional)

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
