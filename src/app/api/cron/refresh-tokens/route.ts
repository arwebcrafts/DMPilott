import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { decryptToken, encryptToken } from '@/lib/encryption'
import { assertCronRequest } from '@/lib/cronAuth'
import axios from 'axios'

// Called daily by Vercel Cron (configured in vercel.json)
// Refreshes Instagram long-lived tokens before they expire (60-day lifetime)
export async function GET(request: Request) {
  // Verify the request is from Vercel Cron (or an authorised caller)
  const unauthorized = assertCronRequest(request)
  if (unauthorized) return unauthorized

  const supabase = createServiceClient()

  // Find Instagram accounts whose tokens expire within the next 10 days
  const tenDaysFromNow = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()

  const { data: accounts, error } = await supabase
    .from('connected_accounts')
    .select('id, access_token_encrypted, username')
    .eq('is_active', true)
    .eq('platform', 'instagram')
    .not('token_expires_at', 'is', null)
    .lt('token_expires_at', tenDaysFromNow)

  if (error) {
    console.error('[CronRefresh] DB query failed:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!accounts || accounts.length === 0) {
    console.log('[CronRefresh] No tokens need refreshing')
    return NextResponse.json({ refreshed: 0, failed: 0 })
  }

  console.log('[CronRefresh] Refreshing', accounts.length, 'token(s)')
  let refreshed = 0
  let failed = 0

  for (const account of accounts) {
    try {
      const currentToken = decryptToken(account.access_token_encrypted)

      // Instagram long-lived tokens can be refreshed before expiry
      const res = await axios.get('https://graph.instagram.com/refresh_access_token', {
        params: {
          grant_type: 'ig_refresh_token',
          access_token: currentToken,
        },
      })

      const newToken: string = res.data.access_token
      const newExpiresAt = new Date(Date.now() + res.data.expires_in * 1000).toISOString()

      await supabase
        .from('connected_accounts')
        .update({
          access_token_encrypted: encryptToken(newToken),
          token_expires_at: newExpiresAt,
        })
        .eq('id', account.id)

      console.log('[CronRefresh] ✓ Refreshed token for @', account.username, '| new expiry:', newExpiresAt)
      refreshed++
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err.message
      console.error('[CronRefresh] ✗ Failed for @', account.username, ':', msg)

      // If the token is permanently invalid, deactivate the account
      if (err?.response?.data?.error?.code === 190) {
        await supabase
          .from('connected_accounts')
          .update({ is_active: false })
          .eq('id', account.id)
        await supabase
          .from('automations')
          .update({ is_active: false })
          .eq('account_id', account.id)
        console.log('[CronRefresh] ⚠️ Deactivated expired account @', account.username)
      }

      failed++
    }
  }

  console.log('[CronRefresh] Done — refreshed:', refreshed, '| failed:', failed)
  return NextResponse.json({ refreshed, failed })
}
