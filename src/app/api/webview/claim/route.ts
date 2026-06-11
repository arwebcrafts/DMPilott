import { NextRequest, NextResponse } from 'next/server';
import { getUserInteraction, updateUserInteraction, createUserInteraction } from '@/lib/db/userInteractions';
import { getPageConfigurationById } from '@/lib/db/pageConfigurations';
import { sendButtonTemplate } from '@/lib/messenger/api/sendMessage';

export async function POST(req: NextRequest) {
  const { configId, psid } = await req.json();

  if (!configId || !psid) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  try {
    const pageConfig = await getPageConfigurationById(configId);
    
    if (!pageConfig) {
      return NextResponse.json({ error: 'Page configuration not found' }, { status: 404 });
    }
    
    // Check for existing claim to prevent double-sending
    const existing = await getUserInteraction(psid, configId);
    if (existing?.gift_claimed_at) {
      return NextResponse.json({ status: 'already_claimed' });
    }

    // Mark as claimed
    if (existing) {
      await updateUserInteraction(psid, configId, {
        gift_claimed_at: new Date().toISOString(),
        interaction_type: 'gift_claimed',
        self_reported_followed: true
      });
    } else {
      await createUserInteraction({
        messenger_psid: psid,
        page_configuration_id: configId,
        interaction_type: 'gift_claimed',
        self_reported_followed: true
      });
    }

    // Push the gift message into the chat asynchronously
    await sendButtonTemplate(
      psid,
      '🎉 Verification complete! Here is your exclusive gift:',
      [
        {
          type: 'web_url',
          url: pageConfig.gift_link_url,
          title: pageConfig.gift_link_title || 'Access Gift'
        }
      ]
    );

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('[Webview Claim] Error:', error);
    return NextResponse.json({ error: 'Failed to claim gift' }, { status: 500 });
  }
}
