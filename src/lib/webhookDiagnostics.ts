import { createServiceClient } from '@/lib/supabase/server'

export type WebhookOutcome =
  | 'rejected_signature'
  | 'no_account'
  | 'no_automation'
  | 'no_keyword_match'
  | 'queued'
  | 'sent'
  | 'send_failed'
  | 'limit_reached'
  | 'duplicate'

export interface WebhookEventRecord {
  outcome: WebhookOutcome
  detail?: string
  objectType?: string
  eventKind?: 'comment' | 'message' | 'story' | 'other'
  igAccountId?: string
  accountId?: string | null
  userId?: string | null
  payloadPreview?: string
}

/**
 * Records what happened to an inbound webhook.
 *
 * Diagnostics must never break delivery: every failure here is swallowed. The
 * point is that a user who says "no DM arrived" can look at the dashboard and
 * see the exact step that stopped it.
 */
export async function recordWebhookEvent(record: WebhookEventRecord): Promise<void> {
  try {
    const supabase = createServiceClient()
    await supabase.from('webhook_events').insert({
      outcome: record.outcome,
      detail: record.detail?.slice(0, 500) ?? null,
      object_type: record.objectType ?? null,
      event_kind: record.eventKind ?? null,
      ig_account_id: record.igAccountId ?? null,
      account_id: record.accountId ?? null,
      user_id: record.userId ?? null,
      payload_preview: record.payloadPreview?.slice(0, 500) ?? null,
    })
  } catch (err: any) {
    console.log('[Diagnostics] Could not record webhook event:', err?.message || err)
  }
}

/** Human-readable explanation shown in the dashboard. */
export const OUTCOME_HELP: Record<WebhookOutcome, string> = {
  rejected_signature:
    'Meta sent an event but the signature did not match your app secret. Set META_APP_SECRET (and INSTAGRAM_APP_SECRET if your Instagram app uses a different one) in Vercel to the value from the Meta dashboard.',
  no_account:
    'Event received, but no connected account in DMPilot matches the Instagram/Facebook account it came from. Reconnect the account under Accounts.',
  no_automation:
    'Event received and the account matched, but there is no ACTIVE automation for that account and platform.',
  no_keyword_match:
    'A comment arrived but none of your keywords matched its text (or the automation is bound to a different post).',
  queued: 'Matched an automation and was queued for sending.',
  sent: 'DM sent successfully.',
  send_failed:
    'DMPilot tried to send but Meta rejected it. The detail shows Meta’s exact error (often a missing permission or the 24-hour messaging window).',
  limit_reached: 'Your plan’s monthly DM limit is used up.',
  duplicate: 'Meta re-delivered an event that was already handled — safely ignored.',
}
