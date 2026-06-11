# Facebook Follow Button Implementation - Changelog

**Date:** June 11, 2026  
**Project:** DMPilot  
**Feature:** Facebook Gift Offer / Webview Illusion

---

## Overview

Implemented a ManyChat-style "Webview Illusion" for Facebook Page Follow functionality. This feature allows users to view a Facebook Page plugin inside a Messenger webview and claim a gift by self-reporting that they have followed the page. This approach is policy-compliant as it does not track actual Facebook Like/Follow clicks via API.

---

## Changes Made

### 1. Database Schema Migration
**File:** `supabase/migrations/007_facebook_follow_button.sql`
- Created `page_configurations` table to store Facebook page settings
- Created `user_page_interactions` table to track user interactions
- Added fields for page URL, page ID, gift link URL, and gift link title

### 2. Page Configuration API
**File:** `src/app/api/page-configurations/route.ts`
- Implemented POST endpoint for creating/updating page configurations
- Integrated domain whitelisting via Facebook Graph API
- Fixed `baseUrl` environment variable precedence to prioritize `NEXT_PUBLIC_BASE_URL` over `VERCEL_URL`
- Added error handling for whitelisting failures

### 3. Manual Domain Whitelisting API
**File:** `src/app/api/whitelist-domain/route.ts`
- Created dedicated API endpoint for manual domain whitelisting
- Corrected `baseUrl` precedence for production environment
- Uses Facebook Page Access Token from connected accounts

### 4. Webview Claim API
**File:** `src/app/api/webview/claim/route.ts`
- Implemented POST endpoint for processing gift claims
- Prevents duplicate claims by checking `user_page_interactions` table
- Sends gift message via Messenger API after successful claim
- Uses encrypted page access tokens for authentication

### 5. Postback Handler Update
**File:** `src/lib/messenger/handlers/postbackHandler.ts`
- Modified `handleFollowButton` function to launch webview instead of sending basic buttons
- Implemented `web_url` button with `messenger_extensions: true`
- Corrected `baseUrl` precedence for domain whitelisting
- Generates unique config ID for each webview session

### 6. Webview Page
**File:** `src/app/webview/unlock/page.tsx`
- Created React component for the webview page
- Wrapped `useSearchParams` with `Suspense` to fix Next.js client component error
- Fixed API endpoint URL from `/api/page-configurations/by-id` to `/api/page-configurations?id=`
- Integrated Messenger Extensions SDK for closing webview
- Implemented ManyChat-style overlay layout:
  - Top blue banner with step 1 instruction
  - Facebook Page Plugin iframe (340px width)
  - Fixed bottom overlay card with reveal gift button
  - Self-reported follow mechanism (no API verification)

### 7. Dashboard UI
**File:** `src/app/dashboard/automations/page.tsx`
- Modified `FacebookPageConfigModal` component
- Removed URL-based page ID extraction (causing validation errors)
- Changed to use `platform_account_id` from connected Facebook accounts
- Hardcoded custom username URL (`https://www.facebook.com/leerolir/`)
- Updated API call to use `page_id` instead of `facebook_page_id`
- Updated UI labels to reflect automatic page ID extraction

---

## Environment Variables

### Required Variables
- `NEXT_PUBLIC_BASE_URL` - Production/preview URL (e.g., `https://dmpilott.vercel.app`)
- `VERCEL_URL` - Vercel deployment URL (fallback)
- `FACEBOOK_PAGE_ACCESS_TOKEN` - Encrypted in `connected_accounts` table

### Configuration
- Production domain: `https://dmpilott.vercel.app`
- Facebook App ID: `4552936261602709`
- Facebook Page URL: `https://www.facebook.com/leerolir/`
- Facebook Page ID: `106330755024913`

---

## Technical Decisions

### Why Self-Reported Follow?
1. **Policy Compliance:** Facebook's platform policy prohibits tracking actual Like/Follow clicks via API for gating rewards
2. **Technical Limitation:** Facebook's Page Plugin does not allow in-iframe Like/Follow actions due to third-party cookie blocking
3. **Industry Standard:** ManyChat and other platforms use the same "Webview Illusion" approach

### Why Webview Illusion Instead of Direct Link?
1. **Better UX:** Keeps users within Messenger app
2. **Visual Context:** Shows the actual Facebook page so users know what they're following
3. **Higher Conversion:** ManyChat-style overlay with clear call-to-action

### Domain Whitelisting Strategy
1. **Automatic:** Triggered when page configuration is saved
2. **Manual:** Dedicated API endpoint for troubleshooting
3. **Base URL Precedence:** `NEXT_PUBLIC_BASE_URL` → `VERCEL_URL` → localhost

---

## Known Limitations

1. **Follow Button Behavior:** The Follow button in the Page Plugin iframe opens Facebook in a new tab (Meta's design, not a bug). This does not affect the illusion since the reveal button tracks a self-reported click.
2. **No API Verification:** Gift delivery is based on user self-report, not actual follow status (policy-compliant).
3. **Iframe Rendering:** Page Plugin works in browser webviews but may have limitations in some contexts (e.g., desktop browsers with strict cookie policies).

---

## Testing Checklist

- [x] Build application: `npm run build`
- [x] Test domain whitelisting via API endpoint
- [x] Test webview flow in Messenger
- [x] Verify gift delivery after claim
- [x] Test duplicate claim prevention
- [x] Verify environment variable precedence
- [x] Test dashboard page configuration save
- [x] Verify Facebook Page Plugin renders correctly

---

## Deployment Steps

1. Set `NEXT_PUBLIC_BASE_URL` to `https://dmpilott.vercel.app` in Vercel environment variables (Production and Preview)
2. Run database migrations
3. Deploy to Vercel
4. Test domain whitelisting
5. Test complete webview flow in Messenger

---

## Future Enhancements

1. Add analytics tracking for webview open/click rates
2. Implement A/B testing for different overlay designs
3. Add support for multiple gift offers
4. Implement cooldown period for repeat claims
5. Add admin dashboard for tracking claim statistics

---

## Related Documentation

- [Facebook Follow Button Implementation Plan](./facebook_follow_button_implementation_plan.md)
- [Messenger Extensions SDK](https://developers.facebook.com/docs/messenger-platform/webview)
- [Facebook Page Plugin](https://developers.facebook.com/docs/plugins/page-plugin)

---

**Last Updated:** June 11, 2026
