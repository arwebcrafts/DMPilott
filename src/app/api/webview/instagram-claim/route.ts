import { NextRequest, NextResponse } from 'next/server';
import { getInstagramUserInteraction, updateInstagramUserInteraction, createInstagramUserInteraction } from '@/lib/db/pageConfigurations';
import { sendInstagramDm } from '@/lib/instagramDmQueue';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const { offerId, psid } = await req.json();

  if (!offerId || !psid) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  try {
    const supabase = await createServiceClient();
    
    // Get gift offer
    const { data: giftOffer, error: offerError } = await supabase
      .from('instagram_gift_offers')
      .select('*')
      .eq('id', offerId)
      .single();
    
    if (offerError || !giftOffer) {
      return NextResponse.json({ error: 'Gift offer not found' }, { status: 404 });
    }
    
    // Check for existing claim to prevent double-sending
    const existing = await getInstagramUserInteraction(psid, offerId);
    if (existing?.gift_claimed_at) {
      return NextResponse.json({ status: 'already_claimed' });
    }

    // Mark as claimed
    if (existing) {
      await updateInstagramUserInteraction(psid, offerId, {
        gift_claimed_at: new Date().toISOString(),
        interaction_type: 'gift_claimed',
        self_reported_followed: true
      });
    } else {
      await createInstagramUserInteraction({
        instagram_gift_offer_id: offerId,
        instagram_psid: psid,
        interaction_type: 'gift_claimed',
        self_reported_followed: true
      });
    }

    // Send gift link via Instagram DM
    const giftMessage = `🎉 Thank you for following! Here's your exclusive gift:\n\n${giftOffer.gift_link_title || 'Get Your Gift'}\n${giftOffer.gift_link_url}`;

    // Find the Instagram account
    const { data: account } = await supabase
      .from('connected_accounts')
      .select('*')
      .eq('platform', 'instagram')
      .eq('username', giftOffer.account_username)
      .eq('is_active', true)
      .limit(1)
      .single();
    
    if (account) {
      await sendInstagramDm({
        account,
        recipientId: psid,
        message: giftMessage,
      });
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('[Instagram Webview Claim] Error:', error);
    return NextResponse.json({ error: 'Failed to claim gift' }, { status: 500 });
  }
}
