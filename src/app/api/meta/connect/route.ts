import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const platform = searchParams.get('platform')

  if (!platform || !['instagram', 'facebook'].includes(platform)) {
    return NextResponse.json({ error: 'Invalid platform' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/meta/callback`

  const state = Buffer.from(JSON.stringify({
    userId: user.id,
    platform,
    nonce: Math.random().toString(36).substring(7),
  })).toString('base64')

  if (platform === 'instagram') {
    // Instagram Business Login — uses Facebook's OAuth flow with Instagram permissions
    // (api.instagram.com endpoints are deprecated; Meta migrated to Facebook OAuth)
    const authUrl = new URL('https://www.facebook.com/v21.0/dialog/oauth')
    authUrl.searchParams.set('client_id', process.env.META_APP_ID!)
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('scope', 'instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_metadata_read')
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('state', state)
    return NextResponse.redirect(authUrl.toString())
  }

  // Facebook Login — for Facebook Pages (unchanged)
  const authUrl = new URL('https://www.facebook.com/v21.0/dialog/oauth')
  authUrl.searchParams.set('client_id', process.env.META_APP_ID!)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('scope', 'pages_messaging,pages_read_engagement,pages_manage_metadata,pages_show_list')
  authUrl.searchParams.set('state', state)
  return NextResponse.redirect(authUrl.toString())
}
