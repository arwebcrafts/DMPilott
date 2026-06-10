import { sendButtonTemplate, sendTextMessage } from '../api/sendMessage';
import { getPageConfiguration } from '@/lib/db/pageConfigurations';
import { createUserInteraction, getUserInteraction, updateUserInteraction } from '@/lib/db/userInteractions';

/**
 * Handle postback events from Messenger
 */
export async function handlePostback(psid: string, postback: any) {
  const payload = postback.payload;
  
  if (payload === 'FOLLOW_PAGE_REQUEST') {
    await handleFollowButton(psid);
  } else if (payload === 'CHECK_LIKE_STATUS') {
    await handleLikeStatusCheck(psid);
  }
}

/**
 * Handle follow button click - send page link
 */
async function handleFollowButton(psid: string) {
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
  
  // Send page link with follow button
  await sendButtonTemplate(
    psid,
    'Follow our page to get exclusive access!',
    [
      {
        type: 'web_url',
        url: pageConfig.page_url,
        title: 'Visit Our Page',
      },
      {
        type: 'postback',
        title: "I've Liked the Page",
        payload: 'CHECK_LIKE_STATUS',
      },
    ]
  );
}

/**
 * Handle like status check - trust user's self-report
 */
async function handleLikeStatusCheck(psid: string) {
  const pageConfig = await getPageConfiguration();
  
  if (!pageConfig) {
    await sendTextMessage(psid, 'Configuration error.');
    return;
  }
  
  // Track interaction (self-reported follow)
  await createUserInteraction({
    page_configuration_id: pageConfig.id,
    messenger_psid: psid,
    interaction_type: 'page_visited',
    self_reported_followed: true,
  });
  
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
