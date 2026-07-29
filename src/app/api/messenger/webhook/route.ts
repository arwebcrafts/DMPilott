import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { handlePostback } from '@/lib/messenger/handlers/postbackHandler';
import { handleFollowButton } from '@/lib/messenger/handlers/postbackHandler';
import { getUserInteraction } from '@/lib/db/userInteractions';
import { getPageConfiguration } from '@/lib/db/pageConfigurations';

/**
 * Verify webhook signature from Facebook.
 *
 * The HMAC has to be computed over the raw request bytes. Hashing
 * `JSON.stringify(parsedBody)` instead re-serialises the payload with
 * different key order/spacing, so the digest never matches and every real
 * Meta delivery is rejected.
 */
function verifySignature(rawBody: string, signature: string | null): boolean {
  const appSecret = process.env.META_APP_SECRET;
  if (!appSecret) {
    console.error('[Messenger Webhook] META_APP_SECRET is not set — cannot verify signature');
    return false;
  }
  if (!signature) return false;

  const expected = `sha256=${crypto.createHmac('sha256', appSecret).update(rawBody, 'utf8').digest('hex')}`;
  const expectedBuf = Buffer.from(expected);
  const receivedBuf = Buffer.from(signature);

  if (expectedBuf.length !== receivedBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, receivedBuf);
}

/**
 * Handle POST - Webhook events from Facebook
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  // Verify webhook signature for security
  if (!verifySignature(rawBody, req.headers.get('x-hub-signature-256'))) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
  }

  let body: any;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Process page events
  if (body.object === 'page') {
    for (const entry of body.entry ?? []) {
      for (const messagingEvent of entry.messaging ?? []) {
        const senderPsid = messagingEvent.sender.id;
        
        if (messagingEvent.postback) {
          await handlePostback(senderPsid, messagingEvent.postback);
        } else if (messagingEvent.message && !messagingEvent.message.is_echo) {
          // Handle regular messages - automatically send follow button
          console.log('Received message from:', senderPsid);
          
          // Check if user has already interacted with follow button
          const pageConfig = await getPageConfiguration();
          if (pageConfig) {
            const existingInteraction = await getUserInteraction(senderPsid, pageConfig.id);
            
            // Only send follow button if user hasn't interacted yet
            if (!existingInteraction) {
              console.log('Sending follow button to new user:', senderPsid);
              await handleFollowButton(senderPsid);
            } else {
              console.log('User already interacted, skipping follow button:', senderPsid);
            }
          }
        }
      }
    }
  }
  
  return NextResponse.json({ status: 'EVENT_RECEIVED' });
}

/**
 * Handle GET - Webhook verification
 * Facebook calls this endpoint to verify the webhook
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');
  
  // Verify the token matches our configured verify token
  if (mode === 'subscribe' && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge);
  }
  
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
