import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/server';
import { createPageConfiguration, getPageConfigurationByUserId } from '@/lib/db/pageConfigurations';
import { decryptToken } from '@/lib/encryption';

/**
 * Whitelist domain for Messenger Extensions
 */
async function whitelistDomain(pageAccessToken: string, domain: string) {
  try {
    const response = await fetch(`https://graph.facebook.com/v25.0/me/messenger_profile?access_token=${pageAccessToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        whitelisted_domains: [domain]
      })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error('[Domain Whitelist] Failed to whitelist domain:', result);
      throw new Error(result.error?.message || 'Failed to whitelist domain');
    }
    
    console.log('[Domain Whitelist] Domain whitelisted successfully:', domain, result);
  } catch (error) {
    console.error('[Domain Whitelist] Error whitelisting domain:', error);
    throw error;
  }
}

/**
 * POST - Create or update page configuration
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = await createClient();
    
    // Get user from session
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('[Page Config] Auth error:', userError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('[Page Config] User:', user.id, 'Body:', body);
    
    // Use service client for database operations (bypasses RLS)
    const serviceSupabase = createServiceClient();
    
    // Check if configuration already exists
    const existingConfig = await getPageConfigurationByUserId(user.id);
    console.log('[Page Config] Existing config:', existingConfig);
    
    if (existingConfig) {
      // Update existing configuration
      const { data, error } = await serviceSupabase
        .from('page_configurations')
        .update({
          page_name: body.page_name,
          page_url: body.page_url,
          page_id: body.page_id,
          gift_link_url: body.gift_link_url,
          gift_link_title: body.gift_link_title,
          gift_link_description: body.gift_link_description,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingConfig.id)
        .select()
        .single();
      
      if (error) {
        console.error('[Page Config] Update error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      
      // Whitelist domain for Messenger Extensions
      const { data: account } = await serviceSupabase
        .from('connected_accounts')
        .select('access_token_encrypted')
        .eq('platform', 'facebook')
        .eq('is_active', true)
        .limit(1)
        .single();
      
      if (account) {
        const pageAccessToken = decryptToken(account.access_token_encrypted);
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL 
          ? `https://${process.env.VERCEL_URL}` 
          : 'http://localhost:3000');
        await whitelistDomain(pageAccessToken, baseUrl);
      }
      
      return NextResponse.json(data);
    } else {
      // Create new configuration
      console.log('[Page Config] Creating new config');
      const config = await createPageConfiguration({
        user_id: user.id,
        page_name: body.page_name,
        page_url: body.page_url,
        page_id: body.page_id,
        gift_link_url: body.gift_link_url,
        gift_link_title: body.gift_link_title,
        gift_link_description: body.gift_link_description,
      }, serviceSupabase);
      
      // Whitelist domain for Messenger Extensions
      const { data: account } = await serviceSupabase
        .from('connected_accounts')
        .select('access_token_encrypted')
        .eq('platform', 'facebook')
        .eq('is_active', true)
        .limit(1)
        .single();
      
      if (account) {
        const pageAccessToken = decryptToken(account.access_token_encrypted);
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL 
          ? `https://${process.env.VERCEL_URL}` 
          : 'http://localhost:3000');
        await whitelistDomain(pageAccessToken, baseUrl);
      }
      
      return NextResponse.json(config);
    }
  } catch (error) {
    console.error('[Page Config] Unexpected error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error saving configuration' }, { status: 500 });
  }
}

/**
 * GET - Get user's page configuration
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = req.nextUrl.searchParams;
    const configId = searchParams.get('id');
    
    // If configId is provided, get configuration by ID (for webview)
    if (configId) {
      const { getPageConfigurationById } = await import('@/lib/db/pageConfigurations');
      const config = await getPageConfigurationById(configId);
      
      if (!config) {
        return NextResponse.json({ error: 'Configuration not found' }, { status: 404 });
      }
      
      return NextResponse.json(config);
    }
    
    // Otherwise, get user's page configuration
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const config = await getPageConfigurationByUserId(user.id);
    
    if (!config) {
      return NextResponse.json(null);
    }
    
    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching configuration' }, { status: 500 });
  }
}
