import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { handlePostback } from '@/lib/messenger/handlers/postbackHandler';

/**
 * Verify webhook signature from Facebook
 */
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

/**
 * Handle POST - Webhook events from Facebook
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  
  // Verify webhook signature for security
  if (!verifySignature(req, body)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
  }
  
  // Process page events
  if (body.object === 'page') {
    for (const entry of body.entry) {
      for (const messagingEvent of entry.messaging) {
        const senderPsid = messagingEvent.sender.id;
        
        if (messagingEvent.postback) {
          await handlePostback(senderPsid, messagingEvent.postback);
        } else if (messagingEvent.message) {
          // Handle regular messages if needed
          console.log('Received message:', messagingEvent.message);
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
  if (mode === 'subscribe' && token === process.env.FACEBOOK_VERIFY_TOKEN) {
    return NextResponse.text(challenge);
  }
  
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
