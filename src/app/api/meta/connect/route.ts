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

  const scopes: Record<string, string> = {
    instagram: 'instagram_basic,instagram_manage_messages,instagram_manage_comments,pages_show_list,pages_read_engagement',
    facebook: 'pages_messaging,pages_read_engagement,pages_manage_metadata',
  }

  const state = Buffer.from(JSON.stringify({
    userId: user.id,
    platform,
    nonce: Math.random().toString(36).substring(7),
  })).toString('base64')

  const authUrl = new URL('https://www.facebook.com/v21.0/dialog/oauth')
  authUrl.searchParams.set('client_id', process.env.META_APP_ID!)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('scope', scopes[platform])
  authUrl.searchParams.set('state', state)

  return NextResponse.redirect(authUrl.toString())
}
