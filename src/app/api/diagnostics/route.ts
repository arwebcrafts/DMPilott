import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { OUTCOME_HELP, type WebhookOutcome } from '@/lib/webhookDiagnostics'

/**
 * GET /api/diagnostics
 *
 * Answers "why didn't my DM arrive?" without needing server logs. Returns the
 * user's setup state plus the most recent webhook deliveries and what happened
 * to each one.
 */
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const service = createServiceClient()

  const [{ data: accounts }, { data: automations }, { data: events }, { data: recentDms }] =
    await Promise.all([
      supabase
        .from('connected_accounts')
        .select('id, platform, username, platform_account_id, ig_business_account_id, is_active, webhook_subscribed, token_expires_at')
        .eq('user_id', user.id),
      supabase
        .from('automations')
        .select('id, name, platform, trigger_type, keywords, is_active, media_id, account_id')
        .eq('user_id', user.id),
      service
        .from('webhook_events')
        .select('*')
        .or(`user_id.eq.${user.id},user_id.is.null`)
        .order('received_at', { ascending: false })
        .limit(25),
      supabase
        .from('dm_logs')
        .select('id, status, error_message, commenter_username, created_at, keyword_matched')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10),
    ])

  const activeAutomations = (automations || []).filter((a: any) => a.is_active)

  // Environment checks (booleans only — never leak secret values).
  const env = {
    metaAppSecret: Boolean(process.env.META_APP_SECRET),
    instagramAppSecret: Boolean(process.env.INSTAGRAM_APP_SECRET),
    verifyToken: Boolean(process.env.META_WEBHOOK_VERIFY_TOKEN),
    encryptionKey: Boolean(process.env.ENCRYPTION_KEY),
    aiKey: Boolean(process.env.ANTHROPIC_API_KEY),
  }

  const checks: Array<{ label: string; ok: boolean; hint?: string }> = [
    {
      label: 'App secret configured',
      ok: env.metaAppSecret || env.instagramAppSecret,
      hint: 'Set META_APP_SECRET (and INSTAGRAM_APP_SECRET if different) in Vercel, then redeploy. Without it every webhook is rejected and no DM is sent.',
    },
    {
      label: 'Webhook verify token configured',
      ok: env.verifyToken,
      hint: 'Set META_WEBHOOK_VERIFY_TOKEN to the same value used in the Meta dashboard.',
    },
    {
      label: 'At least one account connected',
      ok: (accounts || []).some((a: any) => a.is_active),
      hint: 'Connect an Instagram or Facebook account under Accounts.',
    },
    {
      label: 'At least one active automation',
      ok: activeAutomations.length > 0,
      hint: 'Create an automation and make sure its toggle is ON.',
    },
    {
      label: 'Webhook events received in the last 7 days',
      ok: (events || []).length > 0,
      hint: 'If this is empty, Meta is not delivering events. In the Meta dashboard check that the Instagram product is subscribed to the "comments" and "messages" fields, and that the callback URL points to /api/webhooks/meta.',
    },
  ]

  return NextResponse.json({
    checks,
    env,
    accounts: accounts || [],
    automations: automations || [],
    recentDms: recentDms || [],
    events: (events || []).map((e: any) => ({
      ...e,
      help: OUTCOME_HELP[e.outcome as WebhookOutcome] || null,
    })),
  })
}
