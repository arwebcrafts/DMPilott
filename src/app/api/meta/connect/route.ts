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
    // Instagram Business Login — requires Instagram App ID (not Facebook App ID)
    // Get Instagram App ID from Instagram API Setup page in Meta Developer Console
    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    const instagramRedirectUri = `${appUrl}/api/instagram/callback`
    const instagramAppId = process.env.INSTAGRAM_APP_ID || process.env.META_APP_ID
    
    const authUrl = new URL('https://www.instagram.com/oauth/authorize')
    authUrl.searchParams.set('client_id', instagramAppId!)
    authUrl.searchParams.set('redirect_uri', instagramRedirectUri)
    authUrl.searchParams.set('scope', 'instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_insights')
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('state', state)
    
    console.log('[Meta Connect] ===== INSTAGRAM OAUTH =====')
    console.log('[Meta Connect] NEXT_PUBLIC_APP_URL:', appUrl)
    console.log('[Meta Connect] Instagram client_id:', instagramAppId)
    console.log('[Meta Connect] redirect_uri:', instagramRedirectUri)
    console.log('[Meta Connect] Full auth URL:', authUrl.toString())
    console.log('[Meta Connect] State:', state)
    
    return NextResponse.redirect(authUrl.toString())
  }

  // Facebook Login — for Facebook Pages
  // pages_read_engagement is now ready for testing
  const authUrl = new URL('https://www.facebook.com/v21.0/dialog/oauth')
  authUrl.searchParams.set('client_id', process.env.META_APP_ID!)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('scope', 'pages_show_list,pages_manage_metadata,pages_read_engagement')
  authUrl.searchParams.set('state', state)
  return NextResponse.redirect(authUrl.toString())
}
