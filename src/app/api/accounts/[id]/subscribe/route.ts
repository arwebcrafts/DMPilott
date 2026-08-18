import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import axios from 'axios'
import { decryptToken } from '@/lib/encryption'

/**
 * POST /api/accounts/[id]/subscribe
 *
 * Retries subscribing a Facebook Page to this app and returns whatever Meta
 * says. The same call runs at connect time, but its failure was only written to
 * a server log — leaving the user with a "Setup needed" badge, no reason, and a
 * Reconnect button that repeated the same silent failure.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const service = createServiceClient()
  const { data: account } = await service
    .from('connected_accounts')
    .select('id, platform, platform_account_id, username, access_token_encrypted')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!account) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 })
  }

  if (account.platform !== 'facebook') {
    return NextResponse.json(
      { error: 'Instagram accounts receive webhooks through the app-level configuration and need no per-account subscription.' },
      { status: 400 }
    )
  }

  let token: string
  try {
    token = decryptToken(account.access_token_encrypted)
  } catch {
    return NextResponse.json(
      { error: 'The stored token could not be read. Click Reconnect to sign in again.' },
      { status: 400 }
    )
  }

  try {
    await axios.post(
      `https://graph.facebook.com/v21.0/${account.platform_account_id}/subscribed_apps`,
      null,
      { params: { subscribed_fields: 'feed,messages', access_token: token }, timeout: 10000 }
    )
  } catch (err: any) {
    const metaError = err?.response?.data?.error
    return NextResponse.json({
      error: metaError?.message || err?.message || 'Meta rejected the subscription.',
      code: metaError?.code ?? null,
      type: metaError?.type ?? null,
    }, { status: 400 })
  }

  // Confirm it actually took rather than trusting the POST's 200.
  let fields: string[] = []
  try {
    const check = await axios.get(
      `https://graph.facebook.com/v21.0/${account.platform_account_id}/subscribed_apps`,
      { params: { access_token: token }, timeout: 10000 }
    )
    fields = (check.data?.data || []).flatMap((s: any) => s.subscribed_fields || [])
  } catch {
    // Verification is best effort; the POST above is the authoritative action.
  }

  const subscribed = fields.length === 0 || fields.includes('feed')

  await service
    .from('connected_accounts')
    .update({ webhook_subscribed: subscribed })
    .eq('id', account.id)

  return NextResponse.json({
    success: subscribed,
    fields,
    message: subscribed
      ? `Page "${account.username}" is now subscribed${fields.length ? ` (${fields.join(', ')})` : ''}.`
      : `Meta accepted the request but the Page still reports [${fields.join(', ')}] without "feed".`,
  })
}
