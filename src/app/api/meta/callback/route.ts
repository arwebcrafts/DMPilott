import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { encryptToken } from '@/lib/encryption'
import axios from 'axios'

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
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/meta/callback`

  try {
    let accessToken: string
    let platformAccountId: string | null = null
    let username: string | null = null
    let displayName: string | null = null
    let profilePictureUrl: string | null = null
    let followerCount = 0
    let tokenExpiresAt: string | null = null
    // subscribeBase tracks which Graph API to use for webhook subscription
    let subscribeBase = 'https://graph.facebook.com/v21.0'

    if (stateData.platform === 'instagram') {
      // ── Instagram Business Login via Facebook OAuth ─────────────────────────
      // Instagram tokens are now managed through Facebook's Graph API

      // Step 1: exchange code for short-lived token via Facebook Graph API
      const shortRes = await axios.get(
        'https://graph.facebook.com/v21.0/oauth/access_token',
        {
          params: {
            client_id: process.env.META_APP_ID!,
            client_secret: process.env.META_APP_SECRET!,
            redirect_uri: redirectUri,
            code,
          },
        }
      )

      const shortLivedToken: string = shortRes.data.access_token

      // Step 2: exchange for long-lived token (60 days) via graph.instagram.com
      const longRes = await axios.get('https://graph.instagram.com/access_token', {
        params: {
          grant_type: 'ig_exchange_token',
          client_secret: process.env.INSTAGRAM_APP_SECRET ?? process.env.META_APP_SECRET!,
          access_token: shortLivedToken,
        },
      })

      accessToken = longRes.data.access_token
      tokenExpiresAt = new Date(Date.now() + longRes.data.expires_in * 1000).toISOString()

      // Step 3: get account details
      const meRes = await axios.get('https://graph.instagram.com/me', {
        params: {
          fields: 'id,username,name,profile_picture_url,followers_count,account_type',
          access_token: accessToken,
        },
      })

      platformAccountId = meRes.data.id
      username = meRes.data.username
      displayName = meRes.data.name || meRes.data.username
      profilePictureUrl = meRes.data.profile_picture_url ?? null
      followerCount = meRes.data.followers_count || 0
      subscribeBase = 'https://graph.instagram.com/v21.0'

      console.log('[Callback] Instagram Login — account:', username, 'id:', platformAccountId)
    } else {
      // ── Facebook Page Login (unchanged) ──────────────────────────────────────

      // Exchange code for short-lived token
      const tokenRes = await axios.get('https://graph.facebook.com/v21.0/oauth/access_token', {
        params: {
          client_id: process.env.META_APP_ID,
          client_secret: process.env.META_APP_SECRET,
          redirect_uri: redirectUri,
          code,
        },
      })

      const shortLivedToken: string = tokenRes.data.access_token

      // Exchange for long-lived user token
      const longLivedRes = await axios.get('https://graph.facebook.com/v21.0/oauth/access_token', {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: process.env.META_APP_ID,
          client_secret: process.env.META_APP_SECRET,
          fb_exchange_token: shortLivedToken,
        },
      })

      const userLongLivedToken: string = longLivedRes.data.access_token

      // Get the Facebook Pages the user manages (each page has its own access token)
      const pagesRes = await axios.get('https://graph.facebook.com/v21.0/me/accounts', {
        params: { access_token: userLongLivedToken },
      })

      if (pagesRes.data.data?.length > 0) {
        const page = pagesRes.data.data[0]
        platformAccountId = page.id
        username = page.name
        displayName = page.name
        // Use the Page access token (required for Page DMs, not the user token)
        accessToken = page.access_token ?? userLongLivedToken
        tokenExpiresAt = longLivedRes.data.expires_in
          ? new Date(Date.now() + longLivedRes.data.expires_in * 1000).toISOString()
          : null
      } else {
        accessToken = userLongLivedToken
      }

      console.log('[Callback] Facebook Login — page:', username, 'id:', platformAccountId)
    }

    if (!platformAccountId) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts?error=no_account`)
    }

    const encryptedToken = encryptToken(accessToken)

    const { error: upsertError } = await supabase
      .from('connected_accounts')
      .upsert({
        user_id: stateData.userId,
        platform: stateData.platform,
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
      console.error('[Callback] Failed to save account:', upsertError)
    }

    // Subscribe to webhook events (comments + messages)
    const subscribeFields = stateData.platform === 'instagram' ? 'comments,messages' : 'feed,messages'
    try {
      await axios.post(
        `${subscribeBase}/${platformAccountId}/subscribed_apps`,
        null,
        { params: { subscribed_fields: subscribeFields, access_token: accessToken } }
      )
      console.log('[Callback] ✓ Subscribed to webhook fields:', subscribeFields)

      await supabase
        .from('connected_accounts')
        .update({ webhook_subscribed: true })
        .eq('user_id', stateData.userId)
        .eq('platform', stateData.platform)
        .eq('platform_account_id', platformAccountId)
    } catch (subErr: any) {
      console.error('[Callback] Webhook subscription failed:', subErr?.response?.data || subErr.message)
    }

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts?connected=true`)
  } catch (err: any) {
    console.error('[Callback] OAuth error:', err?.response?.data || err.message || err)
    const errorCode = err?.response?.data?.error?.code || err?.response?.data?.error_type || 'oauth_failed'
    const errorMessage = err?.response?.data?.error?.message || err?.response?.data?.error_message || ''
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts?error=${errorCode}&message=${encodeURIComponent(errorMessage)}`
    )
  }
}
