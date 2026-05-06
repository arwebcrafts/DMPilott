import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { encryptToken } from '@/lib/encryption'
import axios from 'axios'

// Instagram OAuth callback handler
// Instagram OAuth uses /api/instagram/callback as redirect URI (not /api/meta/callback)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts?error=${error}`)
  }

  if (!code || !state) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts?error=missing_params`)
  }

  let stateData: { userId: string; platform: string }
  try {
    stateData = JSON.parse(Buffer.from(state, 'base64').toString())
  } catch {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts?error=invalid_state`)
  }

  const supabase = createServiceClient()
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/instagram/callback`

  try {
    let accessToken: string
    let platformAccountId: string | null = null
    let username: string | null = null
    let displayName: string | null = null
    let profilePictureUrl: string | null = null
    let followerCount = 0
    let tokenExpiresAt: string | null = null

    // Instagram OAuth token exchange
    const igAppId = process.env.INSTAGRAM_APP_ID || process.env.META_APP_ID
    const igAppSecret = process.env.INSTAGRAM_APP_SECRET || process.env.META_APP_SECRET
    
    // Step 1: exchange code for short-lived token
    const shortRes = await axios.post(
      'https://api.instagram.com/oauth/access_token',
      null,
      {
        params: {
          client_id: igAppId,
          client_secret: igAppSecret,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
          code,
        },
      }
    )

    const shortLivedToken: string = shortRes.data.access_token

    // Step 2: exchange for long-lived token
    const longRes = await axios.get('https://graph.instagram.com/access_token', {
      params: {
        grant_type: 'ig_exchange_token',
        client_secret: igAppSecret,
        access_token: shortLivedToken,
      },
    })

    accessToken = longRes.data.access_token
    tokenExpiresAt = new Date(Date.now() + longRes.data.expires_in * 1000).toISOString()

    // Step 3: get account details using user_id (IG professional account ID)
    const meRes = await axios.get('https://graph.instagram.com/me', {
      params: {
        fields: 'id,user_id,username,name,profile_picture_url,followers_count,account_type',
        access_token: accessToken,
      },
    })

    platformAccountId = meRes.data.user_id || meRes.data.id
    username = meRes.data.username
    displayName = meRes.data.name || meRes.data.username
    profilePictureUrl = meRes.data.profile_picture_url ?? null
    followerCount = meRes.data.followers_count || 0

    console.log('[Instagram Callback] Account:', username, 'id:', platformAccountId)

    if (!platformAccountId) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts?error=no_account`)
    }

    const encryptedToken = encryptToken(accessToken)

    const { error: upsertError } = await supabase
      .from('connected_accounts')
      .upsert({
        user_id: stateData.userId,
        platform: 'instagram',
        platform_account_id: platformAccountId,
        username,
        display_name: displayName,
        profile_picture_url: profilePictureUrl,
        follower_count: followerCount,
        access_token_encrypted: encryptedToken,
        token_expires_at: tokenExpiresAt,
        is_active: true,
      }, {
        onConflict: 'user_id,platform,platform_account_id',
      })

    if (upsertError) {
      console.error('[Instagram Callback] Failed to save account:', upsertError)
    }

    // Subscribe to webhooks
    try {
      await axios.post(
        `https://graph.facebook.com/v21.0/${platformAccountId}/subscribed_apps`,
        null,
        { params: { subscribed_fields: 'comments,messages', access_token: accessToken } }
      )
      console.log('[Instagram Callback] ✓ Subscribed to webhooks')

      await supabase
        .from('connected_accounts')
        .update({ webhook_subscribed: true })
        .eq('user_id', stateData.userId)
        .eq('platform', 'instagram')
        .eq('platform_account_id', platformAccountId)
    } catch (subErr: any) {
      console.error('[Instagram Callback] Webhook subscription failed:', subErr?.response?.data || subErr.message)
    }

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts?connected=true`)
  } catch (err: any) {
    console.error('[Instagram Callback] OAuth error:', err?.response?.data || err.message || err)
    const errorCode = err?.response?.data?.error?.code || err?.response?.data?.error_type || 'oauth_failed'
    const errorMessage = err?.response?.data?.error?.message || err?.response?.data?.error_message || ''
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts?error=${errorCode}&message=${encodeURIComponent(errorMessage)}`
    )
  }
}
