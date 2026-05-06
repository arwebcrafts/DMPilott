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

  console.log('[Instagram Callback] ===== START =====')
  console.log('[Instagram Callback] Full URL:', request.url)
  console.log('[Instagram Callback] Code present:', !!code)
  console.log('[Instagram Callback] State present:', !!state)
  console.log('[Instagram Callback] Error param:', error)

  if (error) {
    console.log('[Instagram Callback] Redirecting due to error param:', error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts?error=${error}`)
  }

  if (!code || !state) {
    console.log('[Instagram Callback] Missing code or state - code:', !!code, 'state:', !!state)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts?error=missing_params`)
  }

  let stateData: { userId: string; platform: string }
  try {
    stateData = JSON.parse(Buffer.from(state, 'base64').toString())
    console.log('[Instagram Callback] State decoded:', JSON.stringify(stateData))
  } catch (e) {
    console.log('[Instagram Callback] Failed to decode state:', state)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts?error=invalid_state`)
  }

  const supabase = createServiceClient()
  
  // Build redirect_uri exactly as used in the authorization request
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  const redirectUri = `${appUrl}/api/instagram/callback`
  
  // Instagram OAuth credentials
  const igAppId = process.env.INSTAGRAM_APP_ID || process.env.META_APP_ID
  const igAppSecret = process.env.INSTAGRAM_APP_SECRET || process.env.META_APP_SECRET
  
  console.log('[Instagram Callback] ===== CONFIG =====')
  console.log('[Instagram Callback] NEXT_PUBLIC_APP_URL:', appUrl)
  console.log('[Instagram Callback] redirect_uri (callback):', redirectUri)
  console.log('[Instagram Callback] INSTAGRAM_APP_ID:', igAppId)
  console.log('[Instagram Callback] INSTAGRAM_APP_SECRET set:', !!igAppSecret)
  console.log('[Instagram Callback] ===== TOKEN EXCHANGE =====')
  
  try {
    // Step 1: exchange code for short-lived token (use URL-encoded form data)
    const params = new URLSearchParams()
    params.append('client_id', igAppId!)
    params.append('client_secret', igAppSecret!)
    params.append('grant_type', 'authorization_code')
    params.append('redirect_uri', redirectUri)
    params.append('code', code)
    
    const postData = params.toString()
    console.log('[Instagram Callback] POST to https://api.instagram.com/oauth/access_token')
    console.log('[Instagram Callback] Post data:', postData)
    
    const shortRes = await axios.post(
      'https://api.instagram.com/oauth/access_token',
      postData,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    )
    
    console.log('[Instagram Callback] Short token response status:', shortRes.status)
    console.log('[Instagram Callback] Short token response data:', JSON.stringify(shortRes.data))
    
    const shortLivedToken: string = shortRes.data.access_token
    console.log('[Instagram Callback] Short token received:', shortLivedToken ? 'YES' : 'NO')

    // Step 2: exchange for long-lived token
    console.log('[Instagram Callback] ===== LONG-LIVED TOKEN =====')
    console.log('[Instagram Callback] GET https://graph.instagram.com/access_token')
    console.log('[Instagram Callback] Params: grant_type=ig_exchange_token, client_secret=***, access_token=***')
    
    const longRes = await axios.get('https://graph.instagram.com/access_token', {
      params: {
        grant_type: 'ig_exchange_token',
        client_secret: igAppSecret,
        access_token: shortLivedToken,
      },
    })
    
    console.log('[Instagram Callback] Long token response status:', longRes.status)
    console.log('[Instagram Callback] Long token response data:', JSON.stringify(longRes.data))
    
    const accessToken: string = longRes.data.access_token
    const tokenExpiresAt: string | null = new Date(Date.now() + longRes.data.expires_in * 1000).toISOString()
    console.log('[Instagram Callback] Long token received:', accessToken ? 'YES' : 'NO')

    // Step 3: get account details using user_id (IG professional account ID)
    console.log('[Instagram Callback] ===== ACCOUNT DETAILS =====')
    console.log('[Instagram Callback] GET https://graph.instagram.com/me')
    
    const meRes = await axios.get('https://graph.instagram.com/me', {
      params: {
        fields: 'id,user_id,username,name,profile_picture_url,followers_count,account_type',
        access_token: accessToken,
      },
    })
    
    console.log('[Instagram Callback] Account response status:', meRes.status)
    console.log('[Instagram Callback] Account response data:', JSON.stringify(meRes.data))

    const platformAccountId: string | null = meRes.data.user_id || meRes.data.id
    const username: string | null = meRes.data.username
    const displayName: string | null = meRes.data.name || meRes.data.username
    const profilePictureUrl: string | null = meRes.data.profile_picture_url ?? null
    const followerCount: number = meRes.data.followers_count || 0

    console.log('[Instagram Callback] Account:', username, 'id:', platformAccountId)

    if (!platformAccountId) {
      console.log('[Instagram Callback] No platformAccountId found')
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts?error=no_account`)
    }

    const encryptedToken = encryptToken(accessToken)
    console.log('[Instagram Callback] Token encrypted, saving to database...')

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
    } else {
      console.log('[Instagram Callback] Account saved successfully')
    }

    // Subscribe to webhooks
    try {
      console.log('[Instagram Callback] ===== WEBHOOK SUBSCRIPTION =====')
      const subRes = await axios.post(
        `https://graph.facebook.com/v21.0/${platformAccountId}/subscribed_apps`,
        null,
        { params: { subscribed_fields: 'comments,messages', access_token: accessToken } }
      )
      console.log('[Instagram Callback] Webhook subscribed:', subRes.status)

      await supabase
        .from('connected_accounts')
        .update({ webhook_subscribed: true })
        .eq('user_id', stateData.userId)
        .eq('platform', 'instagram')
        .eq('platform_account_id', platformAccountId)
    } catch (subErr: any) {
      console.error('[Instagram Callback] Webhook subscription failed:', subErr?.response?.data || subErr.message)
    }

    console.log('[Instagram Callback] ===== SUCCESS =====')
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts?connected=true`)
  } catch (err: any) {
    console.error('[Instagram Callback] ===== ERROR =====')
    console.error('[Instagram Callback] Error message:', err.message)
    console.error('[Instagram Callback] Error response:', JSON.stringify(err?.response?.data))
    console.error('[Instagram Callback] Error status:', err?.response?.status)
    console.error('[Instagram Callback] Full error:', err)
    
    const errorCode = err?.response?.data?.error?.code || err?.response?.data?.error_type || 'oauth_failed'
    const errorMessage = err?.response?.data?.error?.message || err?.response?.data?.error_message || err.message || 'Unknown error'
    
    console.error('[Instagram Callback] Redirecting with error:', errorCode, '-', errorMessage)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accounts?error=${errorCode}&message=${encodeURIComponent(errorMessage)}`
    )
  }
}
