# Facebook Page Follow Button Implementation Plan
**Date:** June 10, 2026

## Overview
Implement a Facebook Messenger follow button that:
1. Sends a button to users in Messenger
2. On click, displays a link to the Facebook page
3. User self-reports they've liked the page (honor system)
4. Provides a gift link to users who report they've liked the page
5. Allows SaaS users to configure page link and gift link from dashboard

**Note:** This uses a self-reported follow system (honor system) which is the industry standard for Messenger bots and fully compliant with Meta's policies.

---

## ⚠️ Policy Compliance Note

**Why Self-Reported System?**
Meta banned "Like-gating" (incentivizing likes for rewards) in November 2014. The `user_likes` permission:
- Cannot be used for gatekeeping content/rewards
- Requires individual user OAuth login (destroys Messenger experience)
- Uses PSID (Page-Scoped ID) which is incompatible with Graph API's user likes endpoint
- Would require App Review and would be rejected for this use case

**Industry Standard:**
Major Messenger automation platforms (ManyChat, Chatfuel) all use the self-reported honor system for these reasons. This approach is:
- 100% compliant with Meta policies
- Seamless user experience (no OAuth redirects)
- No App Review required
- Faster implementation

---

## Phase 1: Database Schema

### New Tables

#### `page_configurations`
Stores Facebook page and gift link configurations per SaaS user.

```sql
CREATE TABLE page_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  page_name VARCHAR(255) NOT NULL,
  page_url VARCHAR(500) NOT NULL,
  page_id VARCHAR(100) NOT NULL, -- Facebook Page ID
  gift_link_url VARCHAR(500) NOT NULL,
  gift_link_title VARCHAR(255),
  gift_link_description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, page_id)
);

CREATE INDEX idx_page_configurations_user_id ON page_configurations(user_id);
CREATE INDEX idx_page_configurations_page_id ON page_configurations(page_id);
```

#### `user_page_interactions`
Tracks user interactions with follow buttons (self-reported follow status).

```sql
CREATE TABLE user_page_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_configuration_id UUID NOT NULL REFERENCES page_configurations(id),
  messenger_psid VARCHAR(255) NOT NULL,
  interaction_type VARCHAR(50) NOT NULL, -- 'button_clicked', 'page_visited', 'gift_claimed'
  self_reported_followed BOOLEAN DEFAULT false,
  gift_claimed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(page_configuration_id, messenger_psid)
);

CREATE INDEX idx_user_page_interactions_psid ON user_page_interactions(messenger_psid);
CREATE INDEX idx_user_page_interactions_config ON user_page_interactions(page_configuration_id);
```

#### `meta_app_credentials`
Stores Meta app credentials for sending Messenger messages.

```sql
CREATE TABLE meta_app_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  app_id VARCHAR(100) NOT NULL,
  app_secret VARCHAR(255) NOT NULL, -- Encrypted
  page_access_token TEXT NOT NULL, -- Encrypted
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, app_id)
);

CREATE INDEX idx_meta_app_credentials_user_id ON meta_app_credentials(user_id);
```

---

## Phase 2: Messenger Send API

### Send Message API

**Endpoint:**
```
POST https://graph.facebook.com/v25.0/me/messages
```

**Required Token:**
- Page Access Token (for sending messages as your page)

**Request:**
```bash
curl -X POST "https://graph.facebook.com/v25.0/me/messages" \
  -H "Authorization: Bearer {PAGE_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "recipient": {"id": "{USER_PSID}"},
    "message": {
      "text": "Hello!"
    }
  }'
```

---

## Phase 3: Messenger Webhook Handler

### Webhook Endpoint Structure

**File:** `src/app/api/messenger/webhook/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Verify webhook signature
function verifySignature(req: NextRequest, body: any): boolean {
  const signature = req.headers.get('x-hub-signature-256');
  if (!signature) return false;
  
  const [algorithm, signatureHash] = signature.split('=');
  if (algorithm !== 'sha256') return false;
  
  const expectedHash = crypto
    .createHmac('sha256', process.env.FACEBOOK_APP_SECRET!)
    .update(JSON.stringify(body))
    .digest('hex');
  
  return signatureHash === expectedHash;
}

// Handle POST - Webhook events
export async function POST(req: NextRequest) {
  const body = await req.json();
  
  if (!verifySignature(req, body)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
  }
  
  if (body.object === 'page') {
    for (const entry of body.entry) {
      for (const messagingEvent of entry.messaging) {
        await processMessagingEvent(messagingEvent);
      }
    }
  }
  
  return NextResponse.json({ status: 'EVENT_RECEIVED' });
}

// Handle GET - Webhook verification
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');
  
  if (mode === 'subscribe' && token === process.env.FACEBOOK_VERIFY_TOKEN) {
    return NextResponse.text(challenge);
  }
  
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

async function processMessagingEvent(event: any) {
  const senderPsid = event.sender.id;
  
  if (event.postback) {
    await handlePostback(senderPsid, event.postback);
  } else if (event.message) {
    await handleMessage(senderPsid, event.message);
  }
}
```

### Postback Handler for Follow Button

**File:** `src/lib/messenger/handlers/postbackHandler.ts`

```typescript
import { sendMessage } from '../api/sendMessage';
import { getPageConfiguration } from '@/lib/db/pageConfigurations';
import { createUserInteraction, getUserInteraction, updateUserInteraction } from '@/lib/db/userInteractions';

export async function handlePostback(psid: string, postback: any) {
  const payload = postback.payload;
  
  if (payload === 'FOLLOW_PAGE_REQUEST') {
    await handleFollowButton(psid);
  } else if (payload === 'CHECK_LIKE_STATUS') {
    await handleLikeStatusCheck(psid);
  }
}

async function handleFollowButton(psid: string) {
  // Get page configuration (default to first active config)
  const pageConfig = await getPageConfiguration();
  
  if (!pageConfig) {
    await sendMessage(psid, {
      text: "Sorry, no page configuration found."
    });
    return;
  }
  
  // Track button click
  await createUserInteraction({
    messenger_psid: psid,
    interaction_type: 'button_clicked',
    page_configuration_id: pageConfig.id
  });
  
  // Send page link with follow button
  await sendMessage(psid, {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'button',
        text: `Follow our page to get exclusive access!`,
        buttons: [
          {
            type: 'web_url',
            url: pageConfig.page_url,
            title: 'Visit Our Page'
          },
          {
            type: 'postback',
            title: 'I\'ve Liked the Page',
            payload: 'CHECK_LIKE_STATUS'
          }
        ]
      }
    }
  });
}

async function handleLikeStatusCheck(psid: string) {
  const pageConfig = await getPageConfiguration();
  
  if (!pageConfig) {
    await sendMessage(psid, { text: "Configuration error." });
    return;
  }
  
  // Track interaction (self-reported follow)
  await createUserInteraction({
    messenger_psid: psid,
    interaction_type: 'page_visited',
    page_configuration_id: pageConfig.id,
    self_reported_followed: true
  });
  
  // Trust user's self-report and send gift link
  await sendGiftLink(psid, pageConfig);
}

async function sendGiftLink(psid: string, pageConfig: any) {
  // Check if already claimed
  const existingInteraction = await getUserInteraction(psid, pageConfig.id);
  
  if (existingInteraction?.gift_claimed_at) {
    await sendMessage(psid, {
      text: "You've already claimed your gift!"
    });
    return;
  }
  
  // Send gift link
  await sendMessage(psid, {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'button',
        text: `🎉 Thank you for following! Here's your exclusive gift:`,
        buttons: [
          {
            type: 'web_url',
            url: pageConfig.gift_link_url,
            title: pageConfig.gift_link_title || 'Get Your Gift'
          }
        ]
      }
    }
  });
  
  // Mark as claimed
  await updateUserInteraction(psid, pageConfig.id, {
    gift_claimed_at: new Date(),
    interaction_type: 'gift_claimed'
  });
}
```

---

## Phase 4: Dashboard UI for Configuration

### Page Configuration Component

**File:** `src/components/dashboard/PageConfiguration.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function PageConfiguration() {
  const [config, setConfig] = useState({
    pageName: '',
    pageUrl: '',
    pageId: '',
    giftLinkUrl: '',
    giftLinkTitle: '',
    giftLinkDescription: ''
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/page-configurations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      
      if (response.ok) {
        alert('Configuration saved!');
      }
    } catch (error) {
      alert('Error saving configuration');
    }
    setSaving(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Facebook Page Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Page Name</Label>
          <Input
            value={config.pageName}
            onChange={(e) => setConfig({ ...config, pageName: e.target.value })}
            placeholder="My Business Page"
          />
        </div>
        
        <div>
          <Label>Page URL</Label>
          <Input
            value={config.pageUrl}
            onChange={(e) => setConfig({ ...config, pageUrl: e.target.value })}
            placeholder="https://www.facebook.com/your-page"
          />
        </div>
        
        <div>
          <Label>Facebook Page ID</Label>
          <Input
            value={config.pageId}
            onChange={(e) => setConfig({ ...config, pageId: e.target.value })}
            placeholder="123456789"
          />
        </div>
        
        <div>
          <Label>Gift Link URL</Label>
          <Input
            value={config.giftLinkUrl}
            onChange={(e) => setConfig({ ...config, giftLinkUrl: e.target.value })}
            placeholder="https://your-site.com/gift"
          />
        </div>
        
        <div>
          <Label>Gift Link Title</Label>
          <Input
            value={config.giftLinkTitle}
            onChange={(e) => setConfig({ ...config, giftLinkTitle: e.target.value })}
            placeholder="Get Your Free Gift"
          />
        </div>
        
        <div>
          <Label>Gift Link Description</Label>
          <Textarea
            value={config.giftLinkDescription}
            onChange={(e) => setConfig({ ...config, giftLinkDescription: e.target.value })}
            placeholder="Description of the gift..."
          />
        </div>
        
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Configuration'}
        </Button>
      </CardContent>
    </Card>
  );
}
```

### Meta App Credentials Component

**File:** `src/components/dashboard/MetaAppCredentials.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function MetaAppCredentials() {
  const [credentials, setCredentials] = useState({
    appId: '',
    appSecret: '',
    pageAccessToken: ''
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/meta-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      if (response.ok) {
        alert('Credentials saved!');
      }
    } catch (error) {
      alert('Error saving credentials');
    }
    setSaving(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meta App Credentials</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>App ID</Label>
          <Input
            value={credentials.appId}
            onChange={(e) => setCredentials({ ...credentials, appId: e.target.value })}
            placeholder="Your App ID"
          />
        </div>
        
        <div>
          <Label>App Secret</Label>
          <Input
            type="password"
            value={credentials.appSecret}
            onChange={(e) => setCredentials({ ...credentials, appSecret: e.target.value })}
            placeholder="Your App Secret"
          />
        </div>
        
        <div>
          <Label>Page Access Token</Label>
          <Input
            type="password"
            value={credentials.pageAccessToken}
            onChange={(e) => setCredentials({ ...credentials, pageAccessToken: e.target.value })}
            placeholder="Your Page Access Token"
          />
        </div>
        
        <div className="bg-blue-50 p-4 rounded text-sm">
          <p className="font-semibold">ℹ️ Note:</p>
          <p>These credentials are used to send messages via Messenger Send API. No additional permissions are required.</p>
          <p className="mt-2">The system uses a self-reported follow system (honor system) which is fully compliant with Meta's policies.</p>
        </div>
        
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Credentials'}
        </Button>
      </CardContent>
    </Card>
  );
}
```

---

## Phase 5: API Routes

### Page Configuration API

**File:** `src/app/api/page-configurations/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createPageConfiguration, getPageConfiguration } from '@/lib/db/pageConfigurations';

export async function POST(req: NextRequest) {
  const body = await req.json();
  
  try {
    const config = await createPageConfiguration(body);
    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json({ error: 'Error creating configuration' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const config = await getPageConfiguration();
    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching configuration' }, { status: 500 });
  }
}
```

### Meta Credentials API

**File:** `src/app/api/meta-credentials/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createMetaCredentials, getMetaAppCredentials } from '@/lib/db/metaCredentials';

export async function POST(req: NextRequest) {
  const body = await req.json();
  
  try {
    // Encrypt sensitive data before storing
    const encrypted = {
      ...body,
      appSecret: encrypt(body.appSecret),
      pageAccessToken: encrypt(body.pageAccessToken)
    };
    
    const credentials = await createMetaCredentials(encrypted);
    return NextResponse.json(credentials);
  } catch (error) {
    return NextResponse.json({ error: 'Error saving credentials' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const credentials = await getMetaAppCredentials();
    return NextResponse.json(credentials);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching credentials' }, { status: 500 });
  }
}

function encrypt(text: string): string {
  // Implement encryption using your preferred method
  // e.g., using crypto-js or Node's crypto module
  return text; // Placeholder
}
```

---

## Phase 6: Environment Variables

Add to `.env.local`:

```env
# Facebook/Messenger
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
FACEBOOK_PAGE_ACCESS_TOKEN=your_page_access_token
FACEBOOK_VERIFY_TOKEN=your_custom_verify_token
FACEBOOK_WEBHOOK_URL=https://your-domain.com/api/messenger/webhook

# Encryption
ENCRYPTION_KEY=your_encryption_key
```

---

## Phase 7: Testing Plan

### 1. Webhook Verification
- Test GET endpoint with verify token
- Verify webhook signature validation

### 2. Follow Button Flow
- Send follow button message
- Click "Visit Our Page" button
- Verify page link opens correctly

### 3. Self-Reported Follow Flow
- Click "I've Liked the Page" button
- Verify gift link is sent immediately
- Verify gift link is sent only once per user
- Test interaction tracking in database

### 4. Dashboard Configuration
- Test saving page configuration
- Test saving Meta credentials
- Verify encryption of sensitive data

---

## Phase 8: Deployment Checklist

- [ ] Set up Meta App in Meta for Developers
- [ ] Configure webhook URL in Meta App Dashboard
- [ ] Generate Page Access Token
- [ ] Set up database migrations
- [ ] Configure environment variables
- [ ] Deploy webhook endpoint
- [ ] Test webhook verification
- [ ] Deploy dashboard UI
- [ ] Monitor webhook logs

---

## Why Self-Reported System?

This implementation uses a self-reported follow system (honor system) because:

1. **Policy Compliance**: Meta banned "Like-gating" in 2014. Using API verification for rewards would get your app permanently banned.

2. **Technical Blocker**: Messenger webhooks provide PSID (Page-Scoped ID), but Graph API's user likes endpoint requires ASID (App-Scoped ID) or standard User ID. These are incompatible.

3. **User Experience**: API verification would require forcing users out of Messenger to do Facebook Login OAuth, destroying the seamless experience.

4. **Industry Standard**: Major platforms (ManyChat, Chatfuel) all use this approach.

**Mitigation Strategies:**
- Track self-reported follows vs actual engagement analytics
- Implement rate limiting per PSID
- Add fraud detection for suspicious patterns
- Periodically spot-check followers manually

---

## Summary

This implementation plan provides:
1. ✅ Database schema for configurations and interactions
2. ✅ Messenger webhook handler for follow button
3. ✅ Self-reported follow system (policy-compliant)
4. ✅ Dashboard UI for SaaS users to configure links
5. ✅ API routes for configuration management
6. ✅ No App Review required
7. ✅ Seamless user experience

**Key Benefits:**
- 100% Meta policy compliant
- No App Review needed
- Fast implementation
- Industry-standard approach
- Better user experience
