import { sendMessage, sendButtonTemplate, sendTextMessage } from '../api/sendMessage';
import { sendInstagramDm } from '@/lib/instagramDmQueue';
import { getPageConfiguration, getInstagramGiftOffer, createInstagramUserInteraction, getInstagramUserInteraction, updateInstagramUserInteraction } from '@/lib/db/pageConfigurations';
import { createUserInteraction, getUserInteraction, updateUserInteraction } from '@/lib/db/userInteractions';
import { decryptToken } from '@/lib/encryption';
import axios from 'axios';

/**
 * Handle postback events from Messenger
 */
export async function handlePostback(psid: string, postback: any) {
  const payload = postback.payload;

  if (payload === 'FOLLOW_PAGE_REQUEST') {
    await handleFollowButton(psid);
  } else if (payload === 'CHECK_LIKE_STATUS') {
    await handleLikeStatusCheck(psid);
  } else if (payload.startsWith('IG_CHECK_FOLLOW_STATUS:')) {
    const accountUsername = payload.split(':')[1];
    await handleInstagramFollowStatusCheck(psid, accountUsername);
  }
}

/**
 * Handle Instagram follow status check
 */
export async function handleInstagramFollowStatusCheck(psid: string, accountUsername?: string, account?: any) {
  if (!accountUsername) {
    if (account) {
      await sendInstagramDm({
        account,
        recipientId: psid,
        message: 'Configuration error.',
      });
    } else {
      await sendTextMessage(psid, 'Configuration error.');
    }
    return;
  }

  const giftOffer = await getInstagramGiftOffer(accountUsername);

  if (!giftOffer) {
    if (account) {
      await sendInstagramDm({
        account,
        recipientId: psid,
        message: 'Configuration error.',
      });
    } else {
      await sendTextMessage(psid, 'Configuration error.');
    }
    return;
  }

  // Update existing interaction or create new one
  const existingInteraction = await getInstagramUserInteraction(psid, giftOffer.id);

  if (existingInteraction) {
    await updateInstagramUserInteraction(psid, giftOffer.id, {
      interaction_type: 'account_followed',
      self_reported_followed: true,
    });
  } else {
    await createInstagramUserInteraction({
      instagram_gift_offer_id: giftOffer.id,
      instagram_psid: psid,
      interaction_type: 'account_followed',
      self_reported_followed: true,
    });
  }

  // Trust user's self-report and send gift link
  await sendInstagramGiftLink(psid, giftOffer, account);
}

/**
 * Send Instagram gift link to user
 */
async function sendInstagramGiftLink(psid: string, giftOffer: any, account?: any) {
  // Check if already claimed
  const existingInteraction = await getInstagramUserInteraction(psid, giftOffer.id);

  if (existingInteraction?.gift_claimed_at) {
    if (account) {
      await sendInstagramDm({
        account,
        recipientId: psid,
        message: "You've already claimed your gift!",
      });
    } else {
      await sendTextMessage(psid, "You've already claimed your gift!");
    }
    return;
  }

  // Send gift link as text message
  const giftMessage = `🎉 Thank you for following! Here's your exclusive gift:\n\n${giftOffer.gift_link_title || 'Get Your Gift'}\n${giftOffer.gift_link_url}`;

  if (account) {
    await sendInstagramDm({
      account,
      recipientId: psid,
      message: giftMessage,
    });
  } else {
    await sendTextMessage(psid, giftMessage);
  }

  // Mark as claimed
  await updateInstagramUserInteraction(psid, giftOffer.id, {
    gift_claimed_at: new Date().toISOString(),
    interaction_type: 'gift_claimed',
  });
}

/**
 * Send Instagram button message using Generic Template
 */
export async function sendInstagramButtonMessage(igSid: string, accountUsername: string, account: any, showFollowButton: boolean = false) {
  const url = `https://graph.instagram.com/v25.0/me/messages`;

  const buttons: any[] = [
    {
      type: 'web_url',
      url: `https://instagram.com/${accountUsername}`,
      title: 'Visit Instagram'
    }
  ];

  // Only show "I've Followed" button if user has visited Instagram
  if (showFollowButton) {
    buttons.push({
      type: 'postback',
      title: "I've Followed",
      payload: `IG_CHECK_FOLLOW_STATUS:${accountUsername}`
    });
  }

  const payload = {
    recipient: { id: igSid },
    message: {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: [
            {
              title: 'Follow us on Instagram! 🌟',
              subtitle: showFollowButton ? 'Great! Now tap "I\'ve Followed" to get your gift.' : 'Follow our account to unlock your exclusive gift.',
              buttons
            }
          ]
        }
      }
    }
  };

  // Use Instagram access token from the account
  const accessToken = decryptToken(account.access_token_encrypted);

  try {
    await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      params: { access_token: accessToken },
      timeout: 10000,
    });
    console.log('[Instagram Buttons] Button message sent successfully to:', igSid);
  } catch (err: any) {
    console.error('[Instagram Buttons] Failed to send button message:', err?.response?.data?.error?.message || err?.message);
    throw err;
  }
}

/**
 * Handle Instagram follow button - send account link with buttons
 */
export async function handleInstagramFollowButton(psid: string, accountUsername: string, account: any) {
  const giftOffer = await getInstagramGiftOffer(accountUsername);

  if (!giftOffer) {
    await sendInstagramDm({
      account,
      recipientId: psid,
      message: 'Sorry, no gift offer configuration found.',
    });
    return;
  }

  // Track button click
  await createInstagramUserInteraction({
    instagram_gift_offer_id: giftOffer.id,
    instagram_psid: psid,
    interaction_type: 'button_clicked',
  });

  // Send Generic Template with buttons using Instagram API endpoint
  try {
    await sendInstagramButtonMessage(psid, accountUsername, account);
  } catch (err) {
    // Fallback to text message if button template fails
    console.log('[Instagram Buttons] Button template failed, falling back to text message');
    const followMessage = `Follow our Instagram account to get exclusive access!\n\n👉 https://instagram.com/${accountUsername}\n\nOnce you've followed, reply with "done" to get your gift link!`;
    await sendInstagramDm({
      account,
      recipientId: psid,
      message: followMessage,
    });
  }
}

/**
 * Handle follow button click - send webview with Facebook Page Plugin
 */
export async function handleFollowButton(psid: string) {
  const pageConfig = await getPageConfiguration();
  
  if (!pageConfig) {
    await sendTextMessage(psid, 'Sorry, no page configuration found.');
    return;
  }
  
  // Track button click
  await createUserInteraction({
    page_configuration_id: pageConfig.id,
    messenger_psid: psid,
    interaction_type: 'button_clicked',
  });
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:3000');
  
  // Send webview button with Messenger Extensions
  await sendMessage(psid, {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'button',
        text: `Follow our page to unlock your exclusive gift! 🎁`,
        buttons: [
          {
            type: 'web_url',
            url: `${baseUrl}/webview/unlock?configId=${pageConfig.id}&psid=${psid}`,
            title: 'Unlock Gift',
            webview_height_ratio: 'tall',
            messenger_extensions: true
          }
        ]
      }
    }
  });
}

/**
 * Handle like status check - trust user's self-report
 */
export async function handleLikeStatusCheck(psid: string) {
  const pageConfig = await getPageConfiguration();
  
  if (!pageConfig) {
    await sendTextMessage(psid, 'Configuration error.');
    return;
  }
  
  // Update existing interaction or create new one
  const existingInteraction = await getUserInteraction(psid, pageConfig.id);
  
  if (existingInteraction) {
    await updateUserInteraction(psid, pageConfig.id, {
      interaction_type: 'page_visited',
      self_reported_followed: true,
    });
  } else {
    await createUserInteraction({
      page_configuration_id: pageConfig.id,
      messenger_psid: psid,
      interaction_type: 'page_visited',
      self_reported_followed: true,
    });
  }
  
  // Trust user's self-report and send gift link
  await sendGiftLink(psid, pageConfig);
}

/**
 * Send gift link to user
 */
async function sendGiftLink(psid: string, pageConfig: any) {
  // Check if already claimed
  const existingInteraction = await getUserInteraction(psid, pageConfig.id);
  
  if (existingInteraction?.gift_claimed_at) {
    await sendTextMessage(psid, "You've already claimed your gift!");
    return;
  }
  
  // Send gift link
  await sendButtonTemplate(
    psid,
    '🎉 Thank you for following! Here\'s your exclusive gift:',
    [
      {
        type: 'web_url',
        url: pageConfig.gift_link_url,
        title: pageConfig.gift_link_title || 'Get Your Gift',
      },
    ]
  );
  
  // Mark as claimed
  await updateUserInteraction(psid, pageConfig.id, {
    gift_claimed_at: new Date().toISOString(),
    interaction_type: 'gift_claimed',
  });
}
