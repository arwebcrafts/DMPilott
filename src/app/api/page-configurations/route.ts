import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { createPageConfiguration, getPageConfigurationByUserId } from '@/lib/db/pageConfigurations';

/**
 * POST - Create or update page configuration
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
    
    // Check if configuration already exists
    const existingConfig = await getPageConfigurationByUserId(user.id);
    
    if (existingConfig) {
      // Update existing configuration
      const { data, error } = await supabase
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
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      
      return NextResponse.json(data);
    } else {
      // Create new configuration
      const config = await createPageConfiguration({
        user_id: user.id,
        page_name: body.page_name,
        page_url: body.page_url,
        page_id: body.page_id,
        gift_link_url: body.gift_link_url,
        gift_link_title: body.gift_link_title,
        gift_link_description: body.gift_link_description,
      });
      
      return NextResponse.json(config);
    }
  } catch (error) {
    return NextResponse.json({ error: 'Error saving configuration' }, { status: 500 });
  }
}

/**
 * GET - Get user's page configuration
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = createServiceClient();
    
    // Get user from session
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
