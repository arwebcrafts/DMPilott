import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { encryptToken } from '@/lib/encryption'
import { buildAccountsRedirect } from '@/lib/oauth/redirect'
import axios from 'axios'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error) {
    return buildAccountsRedirect({ error, platform: 'facebook' })
  }

  if (!code || !state) {
    return buildAccountsRedirect({ error: 'missing_params', platform: 'facebook' })
  }

  let stateData: { userId: string; platform: string; popup?: boolean }
  try {
    stateData = JSON.parse(Buffer.from(state, 'base64').toString())
  } catch {
    return buildAccountsRedirect({ error: 'invalid_state', platform: 'facebook' })
  }

  if (stateData.platform !== 'facebook') {
    return buildAccountsRedirect(
      { error: 'invalid_platform', message: 'Use Instagram connect for Instagram accounts.', platform: 'facebook' },
      stateData
    )
  }

  const supabase = createServiceClient()
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/meta/callback`

  try {
    const tokenRes = await axios.get('https://graph.facebook.com/v21.0/oauth/access_token', {
      params: {
        client_id: process.env.META_APP_ID,
        client_secret: process.env.META_APP_SECRET,
        redirect_uri: redirectUri,
        code,
      },
    })

    const shortLivedToken: string = tokenRes.data.access_token

    const longLivedRes = await axios.get('https://graph.facebook.com/v21.0/oauth/access_token', {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: process.env.META_APP_ID,
        client_secret: process.env.META_APP_SECRET,
        fb_exchange_token: shortLivedToken,
      },
    })

    const userLongLivedToken: string = longLivedRes.data.access_token

    const pagesRes = await axios.get('https://graph.facebook.com/v21.0/me/accounts', {
      params: {
        access_token: userLongLivedToken,
        fields: 'id,name,access_token,picture,fan_count',
      },
    })

    if (!pagesRes.data.data?.length) {
      return buildAccountsRedirect(
        { error: 'no_account', message: 'No Facebook Page found on this account.', platform: 'facebook' },
        stateData
      )
    }

    const page = pagesRes.data.data[0]
    const platformAccountId = page.id as string
    const username = page.name as string
    const displayName = page.name as string
    const profilePictureUrl = page.picture?.data?.url ?? null
    const followerCount = page.fan_count || 0
    const accessToken = page.access_token ?? userLongLivedToken
    const tokenExpiresAt = longLivedRes.data.expires_in
      ? new Date(Date.now() + longLivedRes.data.expires_in * 1000).toISOString()
      : null

    console.log('[Facebook Callback] Page connected:', username, 'id:', platformAccountId)

    const encryptedToken = encryptToken(accessToken)

    const { error: upsertError } = await supabase
      .from('connected_accounts')
      .upsert({
        user_id: stateData.userId,
        platform: 'facebook',
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
      console.error('[Facebook Callback] Failed to save account:', upsertError)
    }

    try {
      await axios.post(
        `https://graph.facebook.com/v21.0/${platformAccountId}/subscribed_apps`,
        null,
        {
          params: {
            subscribed_fields: 'feed,messages',
            access_token: accessToken,
          },
        }
      )

      await supabase
        .from('connected_accounts')
        .update({ webhook_subscribed: true })
        .eq('user_id', stateData.userId)
        .eq('platform', 'facebook')
        .eq('platform_account_id', platformAccountId)

      console.log('[Facebook Callback] Webhook subscription active')
    } catch (subErr: any) {
      console.error('[Facebook Callback] Webhook subscription failed:', subErr?.response?.data || subErr.message)
    }

    return buildAccountsRedirect({ connected: 'true', platform: 'facebook' }, stateData)
  } catch (err: any) {
    console.error('[Facebook Callback] OAuth error:', err?.response?.data || err.message || err)
    const errorCode = err?.response?.data?.error?.code || err?.response?.data?.error_type || 'oauth_failed'
    const errorMessage = err?.response?.data?.error?.message || err?.response?.data?.error_message || ''
    return buildAccountsRedirect(
      { error: String(errorCode), message: errorMessage, platform: 'facebook' },
      stateData
    )
  }
}
