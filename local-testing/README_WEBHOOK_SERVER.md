# Meta Instagram Webhook Server

A standalone webhook server for receiving Meta Instagram comment events and sending welcome DMs.

**Status: WORKING ✅** (2026-05-04)

## Features

- Receives comment events from Instagram via Meta webhooks
- Sends automated welcome DMs to users who comment
- Echo message detection (prevents infinite loops)
- Standalone - no integration with main DMPilot app needed

## Quick Start

### Option 1: Node.js

```bash
# Install dependencies
npm install express

# Copy and edit environment file
cp .env.example .env
# Edit .env with your credentials

# Start server
node meta-webhook-server.js
```

### Option 2: Python

```bash
# Install dependencies
pip install flask requests

# Set environment variables
export META_VERIFY_TOKEN=your_token
export META_APP_SECRET=your_secret
export IG_ACCESS_TOKEN=your_token
export IG_BUSINESS_ACCOUNT_ID=your_id

# Start server
python meta-webhook-server.py
```

## Configuration

Set these values in `.env` or as environment variables:

| Variable | Description |
|----------|-------------|
| `META_VERIFY_TOKEN` | Random token for webhook verification (set in Meta App Dashboard) |
| `META_APP_SECRET` | App Secret from Meta App Dashboard |
| `IG_ACCESS_TOKEN` | Instagram User Access Token |
| `IG_BUSINESS_ACCOUNT_ID` | Your Instagram Business Account ID |

## Testing Locally

Meta requires HTTPS for webhooks. Use ngrok:

```bash
# Install ngrok
npm i -g ngrok

# Start ngrok
ngrok http 3000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
# Paste it in Meta App Dashboard > Webhooks
```

## Meta App Dashboard Setup

1. Go to [Meta App Dashboard](https://developers.facebook.com/apps/)
2. Select your app
3. Navigate to **Webhooks** product
4. Set callback URL: `https://your-ngrok-url/webhook`
5. Set verify token (must match `META_VERIFY_TOKEN`)
6. Subscribe to fields: `comments`, `messages`

## Test the Webhook

Send a test notification from Meta App Dashboard:
1. Go to Webhooks section
2. Click **Test** next to the `comments` field
3. Click **Send to My Server**

You should see the event logged in your server console.

## Files

- `meta-webhook-server.js` - Node.js implementation
- `meta-webhook-server.py` - Python implementation
- `.env.example` - Environment template
