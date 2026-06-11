# Instagram DM Button Implementation Changelog

**Date:** June 11, 2026

## Overview
Implemented Instagram DM button messaging functionality with webview-based follow verification and gift claiming system.

---

## Features Implemented

### 1. Instagram Gift Offer Form
- Added Instagram Gift Offer form to automations dashboard
- Fields: Instagram Account selection, Gift Link URL, Gift Link Title
- Saves gift offers to `instagram_gift_offers` table
- Location: `src/app/dashboard/settings/page.tsx`

### 2. Instagram Generic Template with Webview Button
- Implemented Instagram button message sending using Generic Template
- Uses Instagram Graph API endpoint: `https://graph.instagram.com/v25.0/{account_id}/messages`
- Sends "Unlock Gift" button that opens webview page
- Location: `src/lib/messenger/handlers/postbackHandler.ts`

### 3. Instagram Webview Unlock Page
- Created webview page at `/webview/instagram-unlock`
- Features:
  - Instagram profile card with gradient styling
  - "Visit Instagram" button that tracks clicks
  - "Reveal My Gift" button (disabled until Instagram visited)
  - Messenger Extensions SDK integration for closing webview
  - Loading and error states
- Location: `src/app/webview/instagram-unlock/page.tsx`

### 4. Instagram Webview Claim API Endpoint
- Created API endpoint at `/api/webview/instagram-claim`
- Validates offer ID and PSID
- Checks for duplicate claims
- Marks gift as claimed in database
- Sends gift link via Instagram DM
- Location: `src/app/api/webview/instagram-claim/route.ts`

### 5. Instagram Gift Offers API (Public Access)
- Updated GET endpoint to allow public access by ID for webview
- Uses `createServiceClient()` for public access (no authentication required)
- Location: `src/app/api/instagram-gift-offers/route.ts`

### 6. Instagram Visit Tracking
- Added tracking for "Visit Instagram" button clicks
- "Reveal My Gift" button disabled until Instagram profile is visited
- Button shows "✓ Visited" after clicking
- Error message if user tries to claim without visiting

### 7. Facebook Follow Tracking
- Added transparent overlay on top of Facebook iframe
- Overlay opens Facebook page in new tab when clicked
- Tracks follow action and removes overlay after click
- "Reveal My Gift" button disabled until overlay is clicked
- Location: `src/app/webview/unlock/page.tsx`

### 8. Webhook Postback Handling
- Added Instagram postback handling for button clicks
- Location: `src/app/api/webhooks/meta/route.ts`

---

## Database Changes

### Tables Used
- `instagram_gift_offers`: Stores gift offer configurations
- `instagram_user_interactions`: Tracks user interactions (button clicks, claims)
- `meta_accounts`: Stores Instagram account information

---

## Key Technical Details

### Instagram API Endpoint
```
POST https://graph.instagram.com/v25.0/{platform_account_id}/messages
```

### Webview Flow
1. User sends "hi" → Bot sends Generic Template with "Unlock Gift" button
2. User clicks button → Opens webview page with Instagram profile
3. User clicks "Visit Instagram" → Tracks visit, enables "Reveal My Gift"
4. User clicks "Reveal My Gift" → API marks as claimed, sends gift link via DM

### Facebook Flow
1. User clicks follow button → Opens webview page with Facebook iframe
2. User clicks overlay → Opens Facebook page in new tab, tracks follow
3. User clicks "Reveal My Gift" → API marks as claimed, sends gift link via DM

---

## Files Modified

1. `src/lib/messenger/handlers/postbackHandler.ts`
   - Added `sendInstagramButtonMessage` function
   - Uses Instagram Graph API with account ID in path
   - Sends Generic Template with webview button

2. `src/app/api/webhooks/meta/route.ts`
   - Added Instagram postback handling
   - Imported `updateInstagramUserInteraction` function

3. `src/app/webview/instagram-unlock/page.tsx` (New)
   - Instagram webview unlock page
   - Visit tracking and gift claim functionality

4. `src/app/api/webview/instagram-claim/route.ts` (New)
   - Instagram gift claim API endpoint

5. `src/app/api/instagram-gift-offers/route.ts`
   - Updated GET to use `createServiceClient()` for public access

6. `src/app/webview/unlock/page.tsx`
   - Added overlay tracking for Facebook iframe
   - Opens Facebook page when overlay is clicked

7. `src/app/dashboard/settings/page.tsx`
   - Added Instagram Gift Offer form

---

## Known Limitations

### Instagram
- Generic Templates only work on mobile devices (not desktop)
- Cannot programmatically detect if user actually followed (API limitation)
- Uses self-report model with visit tracking

### Facebook
- Cannot track clicks inside iframe due to cross-origin restrictions
- Uses overlay pattern to track user interaction
- Opens Facebook page in new tab for actual follow action

---

## Testing Instructions

### Instagram Testing
1. Delete existing interaction:
   ```sql
   DELETE FROM instagram_user_interactions WHERE instagram_psid = '848067418322071';
   ```

2. Send "hi" to Instagram account from **mobile device**
3. Click "Unlock Gift" button
4. Click "Visit Instagram" button
5. Click "Reveal My Gift" to claim

### Facebook Testing
1. Send "hi" to Facebook page
2. Click follow button to open webview
3. Click overlay to open Facebook page
4. Return to webview and click "Reveal My Gift"

---

## Environment Variables Required

- `NEXT_PUBLIC_BASE_URL`: Base URL for webview links
- `VERCEL_URL`: Vercel deployment URL (fallback)

---

## Dependencies

- Next.js 16.2.3
- Supabase
- Meta/Facebook SDK
- Messenger Extensions SDK
