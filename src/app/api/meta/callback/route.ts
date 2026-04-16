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
    // Exchange code for short-lived token
    const tokenRes = await axios.get('https://graph.facebook.com/v21.0/oauth/access_token', {
      params: {
        client_id: process.env.META_APP_ID,
        client_secret: process.env.META_APP_SECRET,
        redirect_uri: redirectUri,
        code,
      },
    })

    let shortLivedToken = tokenRes.data.access_token

    // Exchange for long-lived token (60 days)
    const longLivedRes = await axios.get('https://graph.facebook.com/v21.0/oauth/access_token', {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: process.env.META_APP_ID,
        client_secret: process.env.META_APP_SECRET,
        fb_exchange_token: shortLivedToken,
      },
    })

    const accessToken = longLivedRes.data.access_token
    const encryptedToken = encryptToken(accessToken)

    let username: string | null = null
    let displayName: string | null = null
    let profilePictureUrl: string | null = null
    let followerCount = 0
    let platformAccountId: string | null = null
    let expiresAt: string | null = null

    if (stateData.platform === 'instagram') {
      // Get Instagram Business Account via Pages
      const pagesRes = await axios.get('https://graph.facebook.com/v21.0/me/accounts', {
        params: { access_token: accessToken },
      })

      if (pagesRes.data.data?.length > 0) {
        const page = pagesRes.data.data[0]
        const igRes = await axios.get(`https://graph.facebook.com/v21.0/${page.id}`, {
          params: {
            fields: 'instagram_business_account',
            access_token: accessToken,
          },
        })

        if (igRes.data.instagram_business_account?.id) {
          const igAccountId = igRes.data.instagram_business_account.id
          const igDetails = await axios.get(`https://graph.facebook.com/v21.0/${igAccountId}`, {
            params: {
              fields: 'id,username,name,profile_picture_url,followers_count',
              access_token: accessToken,
            },
          })

          platformAccountId = igAccountId
          username = igDetails.data.username
          displayName = igDetails.data.name
          profilePictureUrl = igDetails.data.profile_picture_url
          followerCount = igDetails.data.followers_count || 0
        }
      }
    } else {
      // Facebook Page
      const pagesRes = await axios.get('https://graph.facebook.com/v21.0/me/accounts', {
        params: { access_token: accessToken },
      })

      if (pagesRes.data.data?.length > 0) {
        const page = pagesRes.data.data[0]
        platformAccountId = page.id
        username = page.name
        displayName = page.name
      }
    }

    if (!platformAccountId) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts?error=no_account`)
    }

    // Upsert connected account
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
        token_expires_at: expiresAt || null,
        is_active: true,
      }, {
        onConflict: 'user_id,platform,platform_account_id',
      })

    if (upsertError) {
      console.error('Failed to save account:', upsertError)
    }

    // Subscribe this account to Meta webhook events so comment/DM events are delivered
    if (platformAccountId) {
      const subscribeFields = stateData.platform === 'instagram'
        ? 'comments,messages'
        : 'feed,messages'

      try {
        await axios.post(
          `https://graph.facebook.com/v21.0/${platformAccountId}/subscribed_apps`,
          null,
          {
            params: {
              subscribed_fields: subscribeFields,
              access_token: accessToken,
            },
          }
        )
        console.log('[Callback] ✓ Subscribed account to webhook fields:', subscribeFields)

        await supabase
          .from('connected_accounts')
          .update({ webhook_subscribed: true })
          .eq('user_id', stateData.userId)
          .eq('platform', stateData.platform)
          .eq('platform_account_id', platformAccountId)
      } catch (subErr: any) {
        // Non-fatal: account is connected but webhook may need manual setup
        console.error('[Callback] Webhook subscription failed:', subErr?.response?.data || subErr.message)
      }
    }

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts?connected=true`)

  } catch (err: any) {
    console.error('Meta OAuth error:', err?.response?.data || err.message || err)
    const errorCode = err?.response?.data?.error?.code || 'oauth_failed'
    const errorMessage = err?.response?.data?.error?.message || ''
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts?error=${errorCode}&message=${encodeURIComponent(errorMessage)}`)
  }
}
