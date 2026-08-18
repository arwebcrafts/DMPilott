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

  // Probe the schema by selecting each column the app depends on. A missing
  // table/column surfaces as a PostgREST error, which is exactly the
  // "did I run the SQL?" question users cannot otherwise answer.
  async function schemaOk(table: string, column: string): Promise<boolean> {
    const { error } = await service.from(table).select(column).limit(1)
    return !error
  }

  const [hasWebhookEvents, hasMediaId, hasFlowSteps, hasButtonText, hasCommentId] =
    await Promise.all([
      schemaOk('webhook_events', 'id'),
      schemaOk('automations', 'media_id'),
      schemaOk('automations', 'flow_steps'),
      schemaOk('automations', 'button_text'),
      schemaOk('dm_logs', 'comment_id'),
    ])

  const dbReady = hasWebhookEvents && hasMediaId && hasFlowSteps && hasButtonText && hasCommentId

  // Which permissions Instagram actually granted. Meta drops any scope the app
  // is not approved for without erroring, so an account can look "connected"
  // while comment automations can never fire. Queried separately and tolerantly
  // so an un-migrated database still renders the rest of the page.
  const igAccounts = (accounts || []).filter((a: any) => a.platform === 'instagram' && a.is_active)
  let scopeCheck: { label: string; ok: boolean; hint?: string } | null = null

  if (igAccounts.length > 0) {
    const { data: scopeRows, error: scopeErr } = await supabase
      .from('connected_accounts')
      .select('username, granted_scopes')
      .eq('user_id', user.id)
      .eq('platform', 'instagram')
      .eq('is_active', true)

    if (!scopeErr) {
      const reported = (scopeRows || []).filter((r: any) => Array.isArray(r.granted_scopes) && r.granted_scopes.length > 0)

      if (reported.length === 0) {
        scopeCheck = {
          label: 'Instagram permissions confirmed',
          ok: false,
          hint: 'Unknown — this account was connected before permission tracking existed. Go to Accounts, disconnect the Instagram account, and connect it again. Takes 20 seconds and tells us exactly which permissions Meta granted.',
        }
      } else {
        const missingComments = reported.filter(
          (r: any) => !r.granted_scopes.includes('instagram_business_manage_comments')
        )
        scopeCheck = missingComments.length === 0
          ? { label: 'Instagram permissions confirmed (comments + messages)', ok: true }
          : {
              label: 'Comment permission NOT granted by Instagram',
              ok: false,
              hint: `Meta did not grant instagram_business_manage_comments for ${missingComments
                .map((r: any) => '@' + (r.username || 'account'))
                .join(', ')}. Comment-triggered DMs cannot work without it. In the Meta dashboard this permission must show "Approved" under App Review, and the Instagram account must have an accepted role on the app. Reconnect the account after fixing either one.`,
            }
      }
    }
  }

  // Facebook Pages must be subscribed to this app before Meta sends any comment
  // events. The subscription happens at connect time and can fail silently, so
  // ask Meta directly what the Page's real state is rather than trusting the
  // webhook_subscribed flag we stored optimistically.
  const fbAccounts = (accounts || []).filter((a: any) => a.platform === 'facebook' && a.is_active)
  const fbChecks: Array<{ label: string; ok: boolean; hint?: string }> = []

  for (const fb of fbAccounts) {
    let ok = false
    let reason = ''
    try {
      const { data: row } = await service
        .from('connected_accounts')
        .select('access_token_encrypted')
        .eq('id', fb.id)
        .single()

      const { decryptToken } = await import('@/lib/encryption')
      const axios = (await import('axios')).default
      const token = decryptToken(row!.access_token_encrypted)

      const res = await axios.get(
        `https://graph.facebook.com/v21.0/${fb.platform_account_id}/subscribed_apps`,
        { params: { access_token: token }, timeout: 8000 }
      )
      const subs = res.data?.data || []
      const fields: string[] = subs.flatMap((s: any) => s.subscribed_fields || [])
      ok = fields.includes('feed')
      reason = ok
        ? ''
        : subs.length === 0
          ? 'This Page is not subscribed to the DMPilot app at all.'
          : `Subscribed fields are [${fields.join(', ') || 'none'}] — "feed" is missing, and comments arrive on "feed".`
    } catch (err: any) {
      const metaError = err?.response?.data?.error
      reason = metaError
        ? `Meta says: ${metaError.message}${metaError.code ? ` (code ${metaError.code})` : ''}`
        : err?.message || 'Could not reach Meta.'
    }

    fbChecks.push({
      label: `Facebook Page "${fb.username}" receives comments`,
      ok,
      hint: ok
        ? undefined
        : `${reason} Two things must both be true: (1) in the Meta dashboard, Webhooks must have a "Page" object subscribed to the "feed" and "messages" fields pointing at ${process.env.NEXT_PUBLIC_APP_URL || 'your app'}/api/webhooks/meta, and (2) the Page itself must be subscribed to the app — click Reconnect on the Accounts page to retry that. Facebook comments cannot work until both are done.`,
    })
  }

  const checks: Array<{ label: string; ok: boolean; hint?: string }> = [
    {
      label: 'Database is up to date',
      ok: dbReady,
      hint: 'Open Supabase → SQL Editor → New query, paste the contents of RUN_THIS_IN_SUPABASE.sql from the repo, and click Run. Missing: ' +
        [
          !hasCommentId && 'dm_logs.comment_id',
          !hasWebhookEvents && 'webhook_events table',
          !hasMediaId && 'automations.media_id',
          !hasFlowSteps && 'automations.flow_steps',
          !hasButtonText && 'automations.button_text',
        ].filter(Boolean).join(', '),
    },
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
    ...(scopeCheck ? [scopeCheck] : []),
    ...fbChecks,
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
