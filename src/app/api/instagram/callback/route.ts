import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { encryptToken } from '@/lib/encryption'
import { buildAccountsRedirect } from '@/lib/oauth/redirect'
import axios from 'axios'

/**
 * Instagram returns the granted permissions on the token exchange, either as an
 * array or as a comma-separated string depending on the API version. Anything we
 * asked for but the app is not approved for is simply absent from this list.
 */
function parseGrantedScopes(raw: unknown): string[] {
  const list = Array.isArray(raw)
    ? raw
    : typeof raw === 'string'
      ? raw.split(',')
      : []
  return list.map(s => String(s).trim()).filter(Boolean)
}

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
    return buildAccountsRedirect({ error, platform: 'instagram' }, { popup: false })
  }

  if (!code || !state) {
    console.log('[Instagram Callback] Missing code or state - code:', !!code, 'state:', !!state)
    return buildAccountsRedirect({ error: 'missing_params', platform: 'instagram' }, { popup: false })
  }

  let stateData: { userId: string; platform: string; popup?: boolean }
  try {
    stateData = JSON.parse(Buffer.from(state, 'base64').toString())
    console.log('[Instagram Callback] State decoded:', JSON.stringify(stateData))
  } catch (e) {
    console.log('[Instagram Callback] Failed to decode state:', state)
    return buildAccountsRedirect({ error: 'invalid_state', platform: 'instagram' }, { popup: false })
  }

  if (stateData.platform !== 'instagram') {
    return buildAccountsRedirect({ error: 'invalid_platform', platform: 'instagram' }, stateData)
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
    const shortLivedUserId: string | number | null = shortRes.data.user_id || null
    console.log('[Instagram Callback] Short token received:', shortLivedToken ? 'YES' : 'NO')
    console.log('[Instagram Callback] Short token user_id from response:', shortLivedUserId)

    // Meta silently drops any scope the app is not approved for, so the granted
    // list is the only reliable answer to "why do comments do nothing?".
    // Store it so Diagnostics can show it instead of us guessing.
    const grantedScopes = parseGrantedScopes(shortRes.data.permissions)
    console.log('[Instagram Callback] Granted permissions:', grantedScopes.join(', ') || '(none reported)')

    // Step 2: Long-lived token exchange (ig_exchange_token)
    // Instagram Graph API requires GET with access_token as query parameter
    console.log('[Instagram Callback] ===== LONG-LIVED TOKEN (best effort) =====')

    let accessToken: string = shortLivedToken
    let tokenExpiresAt: string | null = new Date(Date.now() + 55 * 60 * 1000).toISOString() // ~55 min conservative default

    try {
      let longRes
      try {
        console.log('[Instagram Callback] Trying POST to exchange short-lived token for long-lived token...')
        const exchangeParams = new URLSearchParams()
        exchangeParams.append('grant_type', 'ig_exchange_token')
        exchangeParams.append('client_secret', igAppSecret!)
        exchangeParams.append('access_token', shortLivedToken)

        longRes = await axios.post(
          'https://graph.instagram.com/access_token',
          exchangeParams.toString(),
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        )
        console.log('[Instagram Callback] POST exchange response status:', longRes.status)
      } catch (postErr: any) {
        console.warn('[Instagram Callback] POST exchange failed, falling back to GET:', 
          postErr?.response?.data?.error?.message || postErr.message)
        
        longRes = await axios.get('https://graph.instagram.com/access_token', {
          params: {
            grant_type: 'ig_exchange_token',
            client_secret: igAppSecret,
            access_token: shortLivedToken,
          },
        })
      }

      if (longRes.data?.access_token) {
        accessToken = longRes.data.access_token
        tokenExpiresAt = new Date(Date.now() + (longRes.data.expires_in || 0) * 1000).toISOString()
        console.log('[Instagram Callback] Long token exchange succeeded')
      }
    } catch (longErr: any) {
      console.warn('[Instagram Callback] Long-lived token exchange failed completely (non-fatal):',
        longErr?.response?.data?.error?.message || longErr.message)
      console.warn('[Instagram Callback] Proceeding with short-lived token (expires in ~55 minutes)')
    }
    
    console.log('[Instagram Callback] Using access token (long-lived preferred):', accessToken ? 'YES' : 'NO')

    // Step 3: get account details using user_id (IG professional account ID)
    // Modern Meta/Instagram flows prefer the token in Authorization: Bearer header.
    // We also have the user_id directly from the short-lived token response as a fallback.
    let platformAccountId: string | null = shortLivedUserId ? String(shortLivedUserId) : null
    let altAccountId: string | null = null // alternate IG ID (used by webhooks)
    let username: string | null = null
    let displayName: string | null = null
    let profilePictureUrl: string | null = null
    let followerCount = 0

    console.log('[Instagram Callback] ===== ACCOUNT DETAILS =====')
    try {
      // Try Facebook Graph API first (recommended for Instagram Business accounts)
      console.log('[Instagram Callback] GET https://graph.facebook.com/v21.0/me (with access_token query param)')
      const meRes = await axios.get('https://graph.facebook.com/v21.0/me', {
        params: {
          fields: 'id,name',
          access_token: accessToken,
        },
      })

      console.log('[Instagram Callback] Account response status:', meRes.status)
      console.log('[Instagram Callback] Account response data:', JSON.stringify(meRes.data))

      platformAccountId = meRes.data.id || platformAccountId
      username = meRes.data.name || 'instagram_user'
      displayName = meRes.data.name || 'Instagram User'
      console.log('[Instagram Callback] Account from FB /me:', username, 'id:', platformAccountId)
    } catch (meErr: any) {
      console.warn('[Instagram Callback] FB /me call failed, trying Instagram API:',
        meErr?.response?.data?.error?.message || meErr.message)
      try {
        // Fallback to Instagram Graph API - use v21.0/me with supported fields
        console.log('[Instagram Callback] GET https://graph.instagram.com/v21.0/me')
        const igMeRes = await axios.get('https://graph.instagram.com/v21.0/me', {
          params: {
            fields: 'id,user_id,username,name,profile_picture_url,followers_count',
            access_token: accessToken,
          },
        })

        console.log('[Instagram Callback] IG Account response status:', igMeRes.status)
        console.log('[Instagram Callback] IG Account response data:', JSON.stringify(igMeRes.data))

        platformAccountId = igMeRes.data.id || platformAccountId
        if (igMeRes.data.user_id && String(igMeRes.data.user_id) !== String(igMeRes.data.id)) {
          altAccountId = String(igMeRes.data.user_id)
          console.log('[Instagram Callback] Alternate IG account ID (user_id):', altAccountId)
        }
        username = igMeRes.data.username
        displayName = igMeRes.data.name || igMeRes.data.username
        profilePictureUrl = igMeRes.data.profile_picture_url ?? null
        followerCount = igMeRes.data.followers_count || 0

        console.log('[Instagram Callback] Account from IG /v21.0/me:', username, 'id:', platformAccountId)
      } catch (igMeErr: any) {
        console.warn('[Instagram Callback] IG /v21.0/me call also failed:',
          igMeErr?.response?.data?.error?.message || igMeErr.message)
        console.warn('[Instagram Callback] Falling back to user_id from short-lived token response:', shortLivedUserId)
      }
    }

    console.log('[Instagram Callback] Final platformAccountId:', platformAccountId)

    // If we couldn't fetch username from API, set a fallback based on user_id
    if (!username && platformAccountId) {
      username = `user_${platformAccountId.slice(-6)}`
      displayName = 'Instagram Account'
      console.log('[Instagram Callback] Using fallback username:', username)
    }

    if (!platformAccountId) {
      console.log('[Instagram Callback] No platformAccountId found')
      return buildAccountsRedirect({ error: 'no_account', platform: 'instagram' }, stateData)
    }

    // Fallback profile enrichment using the numeric IG user ID (some tokens reject /me but accept /<id>)
    if (!username && platformAccountId) {
      try {
        console.log('[Instagram Callback] Trying fallback profile lookup via numeric ID on graph.instagram.com...')
        const profileRes = await axios.get(`https://graph.instagram.com/v21.0/${platformAccountId}`, {
          params: {
            fields: 'username,name,profile_picture_url,followers_count',
            access_token: accessToken,
          },
        })
        username = profileRes.data.username
        displayName = profileRes.data.name || profileRes.data.username
        profilePictureUrl = profileRes.data.profile_picture_url ?? null
        followerCount = profileRes.data.followers_count || 0
        console.log('[Instagram Callback] Fallback profile lookup succeeded:', username)
      } catch (profileErr: any) {
        console.warn('[Instagram Callback] Fallback profile lookup failed:',
          profileErr?.response?.data?.error?.message || profileErr.message)
      }
    }

    // Enforce the plan's connected-account limit — but never block reconnecting
    // an account the user already has (upsert), only genuinely new ones.
    {
      const { PLAN_LIMITS } = await import('@/lib/planGating')
      const { data: planRow } = await supabase
        .from('users')
        .select('plan')
        .eq('id', stateData.userId)
        .maybeSingle()
      const plan = (planRow?.plan as 'free' | 'creator' | 'pro') || 'free'

      const { data: existingAccounts } = await supabase
        .from('connected_accounts')
        .select('platform_account_id')
        .eq('user_id', stateData.userId)
        .eq('is_active', true)

      const already = (existingAccounts || []).some(
        (a: any) => a.platform_account_id === platformAccountId
      )
      if (!already && (existingAccounts?.length || 0) >= PLAN_LIMITS[plan].maxAccounts) {
        console.log('[Instagram Callback] Account limit reached for plan:', plan)
        return buildAccountsRedirect(
          { error: 'plan_limit', message: `Your ${plan} plan allows ${PLAN_LIMITS[plan].maxAccounts} connected account(s). Upgrade to add more.`, platform: 'instagram' },
          stateData
        )
      }
    }

    const encryptedToken = encryptToken(accessToken)
    console.log('[Instagram Callback] Token encrypted, saving to database...')

    const { error: upsertError } = await supabase
      .from('connected_accounts')
      .upsert({
        user_id: stateData.userId,
        platform: 'instagram',
        platform_account_id: platformAccountId,
        ig_business_account_id: altAccountId,
        username,
        display_name: displayName,
        profile_picture_url: profilePictureUrl,
        follower_count: followerCount,
        access_token_encrypted: encryptedToken,
        token_expires_at: tokenExpiresAt,
        granted_scopes: grantedScopes.length > 0 ? grantedScopes : null,
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
    // Pure Instagram Business Login connections rely on the Webhooks configuration statically 
    // configured under the Webhooks product in the Meta Developer Console (Instagram object).
    // Programmatic subscribed_apps API calls are not supported for these scoped tokens and endpoints,
    // so we statically set webhook_subscribed to true to mark it active.
    try {
      console.log('[Instagram Callback] ===== WEBHOOK SUBSCRIPTION =====')
      console.log('[Instagram Callback] Pure Instagram Login automatically receives statically configured webhooks.')
      
      // Attempt logging for debugging purposes, but guarantee DB success
      try {
        const igSubRes = await axios.post(
          `https://graph.instagram.com/v21.0/${platformAccountId}/subscribed_apps`,
          null,
          {
            params: {
              subscribed_fields: 'comments,messages',
              access_token: accessToken,
            },
          }
        )
        console.log('[Instagram Callback] Optional webhook subscription response:', igSubRes.status)
      } catch (igSubErr: any) {
        console.log('[Instagram Callback] Optional webhook subscription API skipped (expected for Instagram Login for Business tokens)')
      }

      await supabase
        .from('connected_accounts')
        .update({ webhook_subscribed: true })
        .eq('user_id', stateData.userId)
        .eq('platform', 'instagram')
        .eq('platform_account_id', platformAccountId)
      
      console.log('[Instagram Callback] Webhook subscription status set to Active')
    } catch (subErr: any) {
      console.error('[Instagram Callback] Webhook subscription block error:', subErr?.response?.data || subErr.message)
    }

    console.log('[Instagram Callback] ===== SUCCESS =====')
    return buildAccountsRedirect({ connected: 'true', platform: 'instagram' }, stateData)
  } catch (err: any) {
    console.error('[Instagram Callback] ===== ERROR =====')
    console.error('[Instagram Callback] Error message:', err.message)
    console.error('[Instagram Callback] Error response:', JSON.stringify(err?.response?.data))
    console.error('[Instagram Callback] Error status:', err?.response?.status)
    console.error('[Instagram Callback] Full error:', err)
    
    const errorCode = err?.response?.data?.error?.code || err?.response?.data?.error_type || 'oauth_failed'
    const errorMessage = err?.response?.data?.error?.message || err?.response?.data?.error_message || err.message || 'Unknown error'
    
    console.error('[Instagram Callback] Redirecting with error:', errorCode, '-', errorMessage)
    return buildAccountsRedirect(
      { error: String(errorCode), message: errorMessage, platform: 'instagram' },
      stateData
    )
  }
}
