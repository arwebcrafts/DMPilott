import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { decryptToken } from '@/lib/encryption';

/**
 * Manually whitelist domain for Messenger Extensions
 */
export async function POST(req: NextRequest) {
  try {
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
      return NextResponse.json({ error: 'Facebook account not connected' }, { status: 404 });
    }

    const pageAccessToken = decryptToken(account.access_token_encrypted);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000');

    const response = await fetch(`https://graph.facebook.com/v25.0/me/messenger_profile?access_token=${pageAccessToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        whitelisted_domains: [baseUrl]
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('[Domain Whitelist] Failed:', result);
      return NextResponse.json({ error: result.error?.message || 'Failed to whitelist domain', details: result }, { status: 400 });
    }

    console.log('[Domain Whitelist] Success:', baseUrl, result);
    return NextResponse.json({ success: true, domain: baseUrl, result });
  } catch (error) {
    console.error('[Domain Whitelist] Error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
