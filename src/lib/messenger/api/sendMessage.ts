import { getMetaAppCredentials } from '@/lib/db/metaCredentials';

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
  const credentials = await getMetaAppCredentials();

  if (!credentials) {
    throw new Error('Meta app credentials not configured');
  }

  const response = await fetch(
    `https://graph.facebook.com/v25.0/me/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${credentials.page_access_token}`,
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
