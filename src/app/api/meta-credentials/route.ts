import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { createMetaCredentials, getMetaCredentialsByUserId } from '@/lib/db/metaCredentials';
import { encryptToken } from '@/lib/encryption';

/**
 * POST - Create or update meta credentials
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = createServiceClient();
    
    // Get user from session
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Encrypt sensitive data before storing
    const encrypted = {
      app_id: body.app_id,
      app_secret: encryptToken(body.app_secret),
      page_access_token: encryptToken(body.page_access_token),
    };
    
    // Check if credentials already exist
    const existingCredentials = await getMetaCredentialsByUserId(user.id);
    
    if (existingCredentials) {
      // Update existing credentials
      const { data, error } = await supabase
        .from('meta_app_credentials')
        .update({
          app_id: encrypted.app_id,
          app_secret: encrypted.app_secret,
          page_access_token: encrypted.page_access_token,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingCredentials.id)
        .select()
        .single();
      
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      
      return NextResponse.json(data);
    } else {
      // Create new credentials
      const credentials = await createMetaCredentials({
        user_id: user.id,
        app_id: encrypted.app_id,
        app_secret: encrypted.app_secret,
        page_access_token: encrypted.page_access_token,
      });
      
      return NextResponse.json(credentials);
    }
  } catch (error) {
    return NextResponse.json({ error: 'Error saving credentials' }, { status: 500 });
  }
}

/**
 * GET - Get user's meta credentials (without sensitive data)
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = createServiceClient();
    
    // Get user from session
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const credentials = await getMetaCredentialsByUserId(user.id);
    
    if (!credentials) {
      return NextResponse.json(null);
    }
    
    // Return only non-sensitive data
    return NextResponse.json({
      id: credentials.id,
      app_id: credentials.app_id,
      created_at: credentials.created_at,
      updated_at: credentials.updated_at,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching credentials' }, { status: 500 });
  }
}
