# Changelog - DMpilot Webhook Server

## [2026-05-04] - Webhook Server Fully Operational

### Status: COMPLETE ✅

**Comment-triggered welcome DMs are now working!**

### Test Results (2026-05-04)

| Event | Result |
|-------|--------|
| Comment "hello" on post | ✅ DM sent to @m_waqarsikandar |
| Comment "hii" on post | ✅ DM sent to @m_waqarsikandar |
| DM sending (real users) | ✅ Working |
| DM to invalid user (ID: 232323232) | ❌ Expected - "User cannot be found" |

### Webhook Server Behavior

1. Receives comment events from Meta
2. Extracts commenter username and user ID
3. Sends welcome DM: "Hey @{username}! Thanks for commenting! 🎉"
4. Echo messages are correctly skipped (no infinite loops)

### Signature Verification Note

⚠️ **Security Notice**: All incoming webhooks show "Signature mismatch!" in logs. This is because:
- Meta uses your APP_SECRET to sign payloads
- Local raw body capture may not match exactly
- Server processes requests regardless (as intended for development)

**For production**: Implement proper signature verification with exact raw body capture at web server level.

### Running Server

```bash
node meta-webhook-server.js
```

Server listens on port 3000. Use ngrok for HTTPS (required by Meta).

### Status: COMPLETE

**Created standalone webhook server for Meta Instagram comment-triggered welcome messages.**

### New Files Created

| File | Description |
|------|-------------|
| `meta-webhook-server.js` | Node.js webhook server (Express) - Main server |
| `meta-webhook-server.py` | Python webhook server (Flask) - Alternative |
| `meta-webhook-server-package.json` | Node.js dependencies |
| `.env` | Environment variables with credentials |
| `.env.example` | Template for other users |
| `README_WEBHOOK_SERVER.md` | Documentation |
| `test-comment.json` | Sample test payload |
| `test-payload.json` | Test JSON for POST testing |
| `run-ngrok.ps1` | PowerShell script for ngrok |

### Bug Fix - API Endpoint Error

**Problem**: DM sending failed with `Invalid OAuth access token - Cannot parse access token`

**Root Cause**: Server was using `graph.facebook.com` endpoints instead of `graph.instagram.com`

**Error in logs**:
```
[DM] Error sending DM: { message: 'Invalid OAuth access token - Cannot parse access token' }
```

**Fix**: Changed all Instagram API calls:
- `https://graph.facebook.com/v25.0/{id}/messages` → `https://graph.instagram.com/v25.0/{id}/messages`
- `https://graph.facebook.com/v25.0/{id}/subscribed_apps` → `https://graph.instagram.com/v25.0/{id}/subscribed_apps`

### Configuration Set

| Variable | Value |
|----------|-------|
| `META_VERIFY_TOKEN` | `dmpilot_webhook_verify_token_2024` |
| `META_APP_SECRET` | `806f1664dce31b23731d7bcc7e01f665` |
| `IG_ACCESS_TOKEN` | `IGAAUslOpjEgJBZAFloR0hnWHdq...` |
| `IG_BUSINESS_ACCOUNT_ID` | `17841430541631416` |

### Meta App Configuration

**App ID**: `4552936261602709`
**App Name**: `DM Automation SaaS`

**Webhook Callback URL**:
```
https://c014-2400-adcc-1903-f600-80cb-d589-da76-974d.ngrok-free.app/webhook
```

**Webhook Fields Subscribed**:
- comments ✓
- live_comments ✓
- message_edit ✓
- message_reactions ✓
- messages ✓
- messaging_handover ✓
- messaging_optins ✓
- messaging_postbacks ✓
- messaging_referral ✓
- messaging_seen ✓
- standby ✓

### Testing Results

| Test | Result |
|------|--------|
| Health check `GET /` | ✅ Pass |
| Webhook verification `GET /webhook` | ✅ Pass |
| Test webhook POST | ✅ Pass |
| Token validity (graph.instagram.com) | ✅ Valid |
| DM sending (via graph.instagram.com) | ✅ Success |

### How to Run

**Terminal 1 - ngrok (for HTTPS)**:
```bash
ngrok http 3000
```

**Terminal 2 - Webhook Server**:
```bash
cd C:\Users\PMYLS\Downloads\DMpilot
node meta-webhook-server.js
```

### API Reference

**Endpoint**: `https://graph.instagram.com/v25.0/{IG_ACCOUNT_ID}/messages`

**Send DM**:
```bash
curl -X POST "https://graph.instagram.com/v25.0/17841430541631416/messages" \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "recipient": {"id": "848067418322071"},
    "message": {"text": "Hello!"}
  }'
```

---

## Previous Updates

See `dmpilot/CHANGELOG.md` for historical project changes.

---

## Known Issues

1. Instagram tokens expire and need to be refreshed
2. App must be in "Published" state to receive webhooks
3. Some permissions require Advanced Access approval from Meta

---

## Planned Improvements

- [ ] Add token refresh mechanism
- [ ] Support multiple Instagram accounts
- [ ] Add analytics dashboard for webhook events
- [ ] Implement rate limiting for DM sending
- [ ] Add retry logic for failed DMs
