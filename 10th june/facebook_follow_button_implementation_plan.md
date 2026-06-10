# Facebook Page Follow Button Implementation Plan
**Date:** June 10, 2026

## Overview
Implement a Facebook Messenger follow button that:
1. Sends a button to users in Messenger
2. On click, displays a link to the Facebook page
3. Checks if the user has liked the page using Meta Graph API
4. If liked, provides a gift link (exclusive to page likers)
5. Allows SaaS users to configure page link and gift link from dashboard

---

## ⚠️ Critical Policy Warning

**Facebook Platform Policy Violation Risk:**
The Facebook Platform Policy explicitly states: *"The Facebook Platform Policy doesn't allow you to give someone something for liking your page."*

The `user_likes` permission is:
- **Deprecated** for many use cases
- **Extremely difficult** to get approved in App Review
- **Subject to strict review** - Meta actively rejects apps that incentivize page likes
- **Policy violation** if used for gatekeeping content/rewards

**Recommended Alternative:** Use your own database to track opt-ins rather than relying on Facebook's like data.

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
Stores Meta app credentials for Graph API access.

```sql
CREATE TABLE meta_app_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  app_id VARCHAR(100) NOT NULL,
  app_secret VARCHAR(255) NOT NULL, -- Encrypted
  page_access_token TEXT NOT NULL, -- Encrypted
  user_likes_permission_granted BOOLEAN DEFAULT false,
  app_review_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, app_id)
);

CREATE INDEX idx_meta_app_credentials_user_id ON meta_app_credentials(user_id);
```

---

## Phase 2: Meta Graph API Integration

### API Endpoint for Checking User Likes

**Endpoint:**
```
GET https://graph.facebook.com/v25.0/{USER_ID}/likes
```

**Required Permission:**
- `user_likes` (Requires App Review)

**Request:**
```bash
curl -X GET "https://graph.facebook.com/v25.0/{USER_ID}/likes" \
  -H "Authorization: Bearer {USER_ACCESS_TOKEN}" \
  -d "fields=id,name"
```

**Response:**
```json
{
  "data": [
    {
      "id": "123456789",
      "name": "Example Page"
    }
  ],
  "paging": {
    "cursors": {
      "before": "...",
      "after": "..."
    }
  }
}
```

### App Review Process for `user_likes` Permission

**Steps:**
1. Go to Meta App Dashboard → App Review → Permissions and Features
2. Request `user_likes` permission
3. Provide detailed use case explanation
4. Submit screencast demonstrating the feature
5. Wait for review (typically 5-7 business days)

**Required Information for Review:**
- Detailed explanation of how you'll use the data
- Screencast of your app
- Privacy policy URL
- Terms of service URL
- Data deletion instructions URL

**⚠️ Note:** Approval is highly unlikely for use cases involving rewards/gatekeeping.

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
import { createUserInteraction } from '@/lib/db/userInteractions';
import { checkUserLikesPage } from '../api/checkUserLikes';

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
  
  // Track interaction
  await createUserInteraction({
    messenger_psid: psid,
    interaction_type: 'page_visited',
    page_configuration_id: pageConfig.id,
    self_reported_followed: true
  });
  
  // Check if user has liked the page (if permission granted)
  if (pageConfig.user_likes_permission_granted) {
    const hasLiked = await checkUserLikesPage(psid, pageConfig.page_id);
    
    if (hasLiked) {
      await sendGiftLink(psid, pageConfig);
    } else {
      await sendMessage(psid, {
        text: "It looks like you haven't liked our page yet. Please like the page and try again!"
      });
    }
  } else {
    // Fallback: Trust user's self-report
    await sendGiftLink(psid, pageConfig);
  }
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

### Check User Likes Page (Meta API)

**File:** `src/lib/messenger/api/checkUserLikes.ts`

```typescript
import { getMetaAppCredentials } from '@/lib/db/metaCredentials';

export async function checkUserLikesPage(
  userId: string,
  pageId: string
): Promise<boolean> {
  const credentials = await getMetaAppCredentials();
  
  if (!credentials || !credentials.user_likes_permission_granted) {
    console.log('user_likes permission not granted');
    return false;
  }
  
  try {
    // Note: This requires USER_ACCESS_TOKEN, not PAGE_ACCESS_TOKEN
    // User must have authorized your app with user_likes permission
    const response = await fetch(
      `https://graph.facebook.com/v25.0/${userId}/likes`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${credentials.user_access_token}`
        }
      }
    );
    
    if (!response.ok) {
      console.error('Graph API error:', await response.text());
      return false;
    }
    
    const data = await response.json();
    
    // Check if the page is in the user's likes
    const hasLiked = data.data?.some((page: any) => page.id === pageId);
    
    return hasLiked;
  } catch (error) {
    console.error('Error checking user likes:', error);
    return false;
  }
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
        
        <div className="bg-yellow-50 p-4 rounded text-sm">
          <p className="font-semibold">⚠️ Important:</p>
          <p>To enable like verification, you need to request the <code>user_likes</code> permission in Meta App Dashboard.</p>
          <p className="mt-2">Note: This permission is difficult to get approved and may violate Facebook's policy if used for gatekeeping rewards.</p>
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

### 3. Like Status Check
- Test with `user_likes` permission (if approved)
- Test fallback to self-reported status
- Verify gift link is sent only once per user

### 4. Dashboard Configuration
- Test saving page configuration
- Test saving Meta credentials
- Verify encryption of sensitive data

---

## Phase 8: Deployment Checklist

- [ ] Set up Meta App in Meta for Developers
- [ ] Configure webhook URL in Meta App Dashboard
- [ ] Generate Page Access Token
- [ ] Request `user_likes` permission (if proceeding with API verification)
- [ ] Set up database migrations
- [ ] Configure environment variables
- [ ] Deploy webhook endpoint
- [ ] Test webhook verification
- [ ] Deploy dashboard UI
- [ ] Monitor webhook logs

---

## Alternative Approach (Recommended)

Given the policy challenges with `user_likes` permission, consider this alternative:

### Self-Reported Follow System

1. **Trust-based system**: Users click "I've Liked the Page" button
2. **Honor system**: Send gift link immediately (no verification)
3. **Analytics**: Track self-reported follows vs actual engagement
4. **Manual review**: Periodically spot-check followers

**Pros:**
- No API permission needed
- No policy violations
- Faster implementation
- Better user experience

**Cons:**
- Potential for abuse
- No guaranteed verification
- Relies on user honesty

**Implementation:** Use the existing code but skip the `checkUserLikesPage` call and always send the gift link when user reports they've liked the page.

---

## Summary

This implementation plan provides:
1. ✅ Database schema for configurations and interactions
2. ✅ Messenger webhook handler for follow button
3. ✅ Meta Graph API integration for like verification (with policy warnings)
4. ✅ Dashboard UI for SaaS users to configure links
5. ✅ API routes for configuration management
6. ⚠️ Policy-compliant alternative approach

**Critical Decision Point:** Decide whether to pursue `user_likes` permission (high rejection risk) or use the self-reported follow system (recommended).
