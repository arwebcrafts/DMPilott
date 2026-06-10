import { createServiceClient } from '@/lib/supabase/server';
import { decryptToken } from '@/lib/encryption';

export interface SendMessageOptions {
  recipient: {
    id: string;
  };
  message: {
    text?: string;
    attachment?: {
      type: string;
      payload: any;
    };
  };
}

/**
 * Send a message via Facebook Messenger Send API
 */
export async function sendMessage(
  recipientId: string,
  message: SendMessageOptions['message']
): Promise<any> {
  const supabase = createServiceClient();

  // Get Facebook page access token from connected_accounts
  const { data: account, error } = await supabase
    .from('connected_accounts')
    .select('access_token_encrypted')
    .eq('platform', 'facebook')
    .eq('is_active', true)
    .limit(1)
    .single();

  if (error || !account) {
    throw new Error('Facebook account not connected. Please connect your Facebook page in the dashboard.');
  }

  // Decrypt the access token
  const pageAccessToken = decryptToken(account.access_token_encrypted);

  const response = await fetch(
    `https://graph.facebook.com/v25.0/me/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${pageAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipient: { id: recipientId },
        message,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send message: ${error}`);
  }

  return response.json();
}

/**
 * Send a text message
 */
export async function sendTextMessage(
  recipientId: string,
  text: string
): Promise<any> {
  return sendMessage(recipientId, { text });
}

/**
 * Send a button template message
 */
export async function sendButtonTemplate(
  recipientId: string,
  text: string,
  buttons: Array<{
    type: 'web_url' | 'postback';
    title: string;
    url?: string;
    payload?: string;
  }>
): Promise<any> {
  return sendMessage(recipientId, {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'button',
        text,
        buttons,
      },
    },
  });
}
