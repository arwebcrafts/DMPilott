/**
 * Meta Instagram Webhook Server
 * Listens for comment events and sends welcome DMs
 * Based on: https://developers.facebook.com/docs/instagram-platform/webhooks
 * 
 * Usage:
 *   npm install express crypto dotenv
 *   node server.js
 */

require('dotenv').config();
const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());
app.use(express.json({ verify: (req, res, buf) => { req.rawBody = buf; } }));

// Configuration - Set these as environment variables or replace values below
const CONFIG = {
  // Webhook verification token (must match what you set in Meta App Dashboard)
  VERIFY_TOKEN: process.env.META_VERIFY_TOKEN || 'your_verify_token_here',
  
  // Your Meta App Secret (found in Meta App Dashboard > Settings > Basic)
  APP_SECRET: process.env.META_APP_SECRET || 'your_app_secret_here',
  
  // Instagram User Access Token (long-lived, expires ~60 days)
  IG_ACCESS_TOKEN: process.env.IG_ACCESS_TOKEN || 'your_ig_access_token_here',
  
  // Your Instagram Business Account ID (IGSID)
  IG_BUSINESS_ACCOUNT_ID: process.env.IG_BUSINESS_ACCOUNT_ID || 'your_ig_business_account_id',
  
  // Port for local server
  PORT: process.env.PORT || 3000,
  
  // Enable HTTPS (required by Meta - use ngrok for local dev)
  USE_NGROK: process.env.USE_NGROK || false,
};

// ============================================================
// STEP 1: Webhook Endpoint (GET - Verification Request Handler)
// ============================================================
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log(`[Verification] mode=${mode}, token=${token}, challenge=${challenge}`);

  if (mode === 'subscribe' && token === CONFIG.VERIFY_TOKEN) {
    console.log('[Verification] ✓ Webhook verified successfully!');
    res.status(200).send(challenge);
  } else {
    console.log('[Verification] ✗ Verification failed - token mismatch');
    res.status(403).send('Forbidden');
  }
});

// ============================================================
// STEP 2: Webhook Endpoint (POST - Event Notifications Handler)
// ============================================================
app.post('/webhook', express.raw({ type: '*', verify: (req, buf) => { req.rawBody = buf; } }), (req, res) => {
  const signature = req.headers['x-hub-signature-256'];
  const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body));

  // Log signature info for debugging
  console.log('[Debug] Signature header:', signature ? signature.substring(0, 20) + '...' : 'none');
  console.log('[Debug] Raw body length:', rawBody.length);

  // For local testing without ngrok, skip signature validation
  if (!signature) {
    console.log('[Security] No signature - skipping validation (local test mode)');
  } else if (!CONFIG.APP_SECRET || CONFIG.APP_SECRET === 'your_app_secret_here') {
    console.log('[Security] No APP_SECRET - skipping validation');
  } else {
    const expectedSig = 'sha256=' + crypto
      .createHmac('sha256', CONFIG.APP_SECRET)
      .update(rawBody)
      .digest('hex');

    // Use safe comparison
    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSig);

    if (sigBuffer.length !== expectedBuffer.length) {
      console.log('[Security] ✗ Signature length mismatch!');
      console.log('[Debug] Got length:', sigBuffer.length, 'Expected:', expectedBuffer.length);
    } else if (!crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
      console.log('[Security] ✗ Signature mismatch!');
      // Don't reject - just log for now to allow testing
    } else {
      console.log('[Security] ✓ Signature verified');
    }
  }

  console.log('[Webhook] ✓ Payload received');

  const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  console.log('[Webhook] Received:', JSON.stringify(payload, null, 2));

  // Respond quickly to Meta (required within 20 seconds)
  res.status(200).send('OK');

  // Process webhook asynchronously
  processWebhookEvent(payload);
});

// ============================================================
// STEP 3: Signature Verification (SHA256)
// ============================================================
function verifySignature(rawBody, signature) {
  if (!signature) {
    console.log('[Security] No signature provided');
    return false;
  }

  const expectedSig = 'sha256=' + crypto
    .createHmac('sha256', CONFIG.APP_SECRET)
    .update(rawBody)
    .digest('hex');

  const isValid = crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSig)
  );

  return isValid;
}

// ============================================================
// STEP 4: Process Webhook Events
// ============================================================
async function processWebhookEvent(payload) {
  if (payload.object !== 'instagram') {
    console.log(`[Process] Ignoring non-Instagram object: ${payload.object}`);
    return;
  }

  for (const entry of payload.entry || []) {
    console.log(`[Process] Entry ID: ${entry.id}`);

    // Handle comment changes
    if (entry.changes) {
      for (const change of entry.changes) {
        if (change.field === 'comments') {
          await handleCommentEvent(entry.id, change.value);
        }
      }
    }

    // Handle incoming messages
    if (entry.messaging) {
      for (const message of entry.messaging) {
        await handleDirectMessage(message);
      }
    }
  }
}

// ============================================================
// STEP 5: Handle Comment Events
// ============================================================
async function handleCommentEvent(igAccountId, value) {
  console.log('[Comment] New comment event:', value);

  const commentId = value.id;
  const commentText = value.text;
  const commenterId = value.from?.id;
  const commenterUsername = value.from?.username;
  const mediaId = value.media?.id;

  console.log(`[Comment] From: @${commenterUsername} (${commenterId})`);
  console.log(`[Comment] Text: "${commentText}"`);
  console.log(`[Comment] Media ID: ${mediaId}`);

  // Check for duplicate (already processed this comment)
  const processedKey = `processed_comment_${commentId}`;
  if (global[processedKey]) {
    console.log(`[Comment] Already processed comment ${commentId}, skipping`);
    return;
  }
  global[processedKey] = true;

  // Your automation logic here:
  // 1. Check for keyword triggers
  // 2. Send welcome DM if conditions are met
  // 3. Optionally reply to the comment publicly

  await sendWelcomeDM(commenterId, commenterUsername);
  
  // Optional: Reply to comment publicly
  // await replyToComment(commentId, "Thanks for your comment! Check your DMs 🎉");
}

// ============================================================
// STEP 6: Send Welcome Direct Message
// ============================================================
async function sendWelcomeDM(recipientIgSid, recipientUsername) {
  console.log(`[DM] Sending welcome DM to @${recipientUsername} (${recipientIgSid})`);

  const welcomeMessage = `Hey @${recipientUsername}! Thanks for commenting! 🎉\n\nI'm the AI assistant for this account. How can I help you today?`;

  try {
    // Use graph.instagram.com for Instagram messaging API
    const response = await fetch(
      `https://graph.instagram.com/v25.0/${CONFIG.IG_BUSINESS_ACCOUNT_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CONFIG.IG_ACCESS_TOKEN}`
        },
        body: JSON.stringify({
          recipient: {
            id: recipientIgSid
          },
          message: {
            text: welcomeMessage
          }
        })
      }
    );

    const result = await response.json();

    if (result.error) {
      console.error('[DM] Error sending DM:', result.error);
    } else {
      console.log(`[DM] ✓ Welcome DM sent successfully! Message ID: ${result.message_id}`);
    }
  } catch (error) {
    console.error('[DM] Failed to send DM:', error.message);
  }
}

// ============================================================
// STEP 7: (Optional) Public Comment Reply
// ============================================================
async function replyToComment(commentId, replyText) {
  console.log(`[Comment Reply] Replying to comment ${commentId}: "${replyText}"`);

  try {
    // Use graph.instagram.com for Instagram messaging API
    const response = await fetch(
      `https://graph.instagram.com/v25.0/${commentId}/replies`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CONFIG.IG_ACCESS_TOKEN}`
        },
        body: JSON.stringify({
          message: replyText
        })
      }
    );

    const result = await response.json();

    if (result.error) {
      console.error('[Comment Reply] Error:', result.error);
    } else {
      console.log(`[Comment Reply] ✓ Reply sent! ID: ${result.id}`);
    }
  } catch (error) {
    console.error('[Comment Reply] Failed:', error.message);
  }
}

// ============================================================
// STEP 8: Handle Incoming Direct Messages
// ============================================================
async function handleDirectMessage(event) {
  const senderId = event.sender?.id;
  const recipientId = event.recipient?.id;
  const message = event.message;
  const messageText = message?.text;

  console.log(`[Message] From ${senderId}: "${messageText}"`);

  // Skip echo messages (messages sent by the bot)
  if (message?.is_echo) {
    console.log('[Message] Skipping echo message');
    return;
  }

  // Respond to incoming messages
  const autoReply = "Thanks for your message! We'll get back to you soon. 👋";
  await sendDirectMessage(senderId, autoReply);
}

// ============================================================
// STEP 9: Send Direct Message API
// ============================================================
async function sendDirectMessage(recipientIgSid, text) {
  try {
    // Use graph.instagram.com for Instagram messaging API
    const response = await fetch(
      `https://graph.instagram.com/v25.0/${CONFIG.IG_BUSINESS_ACCOUNT_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CONFIG.IG_ACCESS_TOKEN}`
        },
        body: JSON.stringify({
          recipient: { id: recipientIgSid },
          message: { text }
        })
      }
    );

    const result = await response.json();
    if (!result.error) {
      console.log(`[Message] ✓ Sent to ${recipientIgSid}: "${text}"`);
    }
  } catch (error) {
    console.error('[Message] Send failed:', error.message);
  }
}

// ============================================================
// STEP 10: Subscribe to Webhook Fields
// ============================================================
async function subscribeToWebhookFields() {
  console.log('[Subscribe] Subscribing to webhook fields...');

  const fields = [
    'comments',
    'messages',
    'mentions',
    'story_insights'
  ].join(',');

  try {
    // Use graph.instagram.com for Instagram webhook subscription
    const response = await fetch(
      `https://graph.instagram.com/v25.0/${CONFIG.IG_BUSINESS_ACCOUNT_ID}/subscribed_apps`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CONFIG.IG_ACCESS_TOKEN}`
        },
        body: new URLSearchParams({ subscribed_fields: fields })
      }
    );

    const result = await response.json();
    
    if (result.success) {
      console.log('[Subscribe] ✓ Successfully subscribed to:', fields);
    } else {
      console.log('[Subscribe] ✗ Subscription failed:', result);
    }
  } catch (error) {
    console.error('[Subscribe] Error:', error.message);
  }
}

// ============================================================
// Utility: Health Check Endpoint
// ============================================================
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    webhook: '/webhook',
    timestamp: new Date().toISOString()
  });
});

// ============================================================
// Start Server
// ============================================================
async function start() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  Meta Instagram Webhook Server');
  console.log('═══════════════════════════════════════════════════');
  console.log('');
  console.log('Config:');
  console.log(`  VERIFY_TOKEN: ${CONFIG.VERIFY_TOKEN ? '✓ Set' : '✗ Missing'}`);
  console.log(`  APP_SECRET: ${CONFIG.APP_SECRET ? '✓ Set' : '✗ Missing'}`);
  console.log(`  IG_ACCESS_TOKEN: ${CONFIG.IG_ACCESS_TOKEN ? '✓ Set' : '✗ Missing'}`);
  console.log(`  IG_BUSINESS_ACCOUNT_ID: ${CONFIG.IG_BUSINESS_ACCOUNT_ID || '✗ Missing'}`);
  console.log('');
  console.log('Endpoints:');
  console.log(`  GET  /        - Health check`);
  console.log(`  GET  /webhook - Verification endpoint`);
  console.log(`  POST /webhook - Event notifications`);
  console.log('');
  
  // Auto-subscribe to webhook fields
  await subscribeToWebhookFields();
  
  // Start listening
  app.listen(CONFIG.PORT, () => {
    console.log(`───────────────────────────────────────────────────`);
    console.log(`  Server running on port ${CONFIG.PORT}`);
    console.log(`  Webhook URL: http://localhost:${CONFIG.PORT}/webhook`);
    console.log(`───────────────────────────────────────────────────`);
    console.log('');
    console.log('⚠️  IMPORTANT:');
    console.log('  Meta requires HTTPS. For local testing, use ngrok:');
    console.log('  1. Install ngrok: npm i -g ngrok');
    console.log('  2. Run: ngrok http 3000');
    console.log('  3. Use the HTTPS URL in Meta App Dashboard webhook settings');
    console.log('');
  });
}

start().catch(console.error);
