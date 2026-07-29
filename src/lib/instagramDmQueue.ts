import axios from 'axios'
import { decryptToken } from '@/lib/encryption'
import { getUserPlanUsage, incrementDmUsage } from '@/lib/planUsage'
import { getAutomationMessages } from '@/lib/automations/flow'
import { recordWebhookEvent } from '@/lib/webhookDiagnostics'

const INSTAGRAM_MESSAGING_API_VERSION = 'v25.0'
const FACEBOOK_MESSAGING_API_VERSION = 'v21.0'
const INSTAGRAM_MESSAGING_HOSTS = ['https://graph.instagram.com', 'https://graph.facebook.com'] as const
const INSTAGRAM_COMMENTS_PER_HOUR_LIMIT = 200
const FACEBOOK_MESSAGES_PER_HOUR_LIMIT = 200

interface ConnectedAccount {
  id: string
  user_id: string
  platform: 'instagram' | 'facebook'
  platform_account_id: string
  access_token_encrypted: string
  username: string | null
  is_active: boolean
}

interface Automation {
  id: string
  is_active: boolean
  dm_message: string
  dm_video_url: string | null
  comment_reply_enabled: boolean
  comment_reply_text: string | null
  total_dms_sent: number
  flow_steps: unknown
  button_text: string | null
  button_url: string | null
}

interface DmLogRow {
  id: string
  automation_id: string | null
  commenter_platform_id: string
  commenter_username: string | null
  dm_message_sent: string | null
  comment_id: string | null
  retry_count: number
}

async function getTokenUserId(token: string): Promise<string | null> {
  try {
    const response = await axios.get('https://graph.instagram.com/me', {
      params: { fields: 'id,user_id,username,account_type', access_token: token },
      timeout: 5000,
    })
    return response.data.user_id || response.data.id || null
  } catch {
    return null
  }
}

function resolveInstagramCredentials(account: ConnectedAccount) {
  const useDevOverride =
    process.env.NODE_ENV === 'development' && process.env.USE_DEV_INSTAGRAM_TOKENS === 'true'

  if (useDevOverride && process.env.IG_ACCESS_TOKEN) {
    return {
      accessToken: process.env.IG_ACCESS_TOKEN,
      accountId: process.env.IG_BUSINESS_ACCOUNT_ID || account.platform_account_id,
      source: 'dev-env' as const,
    }
  }

  return {
    accessToken: decryptToken(account.access_token_encrypted),
    accountId: account.platform_account_id,
    source: 'connected-account' as const,
  }
}

/**
 * Instagram exposes messaging on two hosts and an account can be addressed by
 * two different IDs, so the first send probes for the combination that works.
 *
 * Only errors that prove the request never reached the messaging queue are
 * worth retrying on the next combination. Retrying after a timeout, a 5xx or a
 * rate-limit means re-POSTing a message Meta may already have delivered — that
 * is how one incoming DM turns into four identical replies.
 */
export function isWrongEndpointError(err: any): boolean {
  const status = err?.response?.status
  const apiError = err?.response?.data?.error
  const code = apiError?.code
  const type = apiError?.type
  const message: string = apiError?.message || ''

  // No response at all (timeout, socket hangup, DNS): the message may well have
  // been delivered. Never retry these.
  if (!err?.response) return false

  if (status === 404) return true

  if (status === 400 || status === 403) {
    // (#100) Unsupported post request / Object with ID does not exist
    if (code === 100 || type === 'GraphMethodException') return true
    if (/unsupported (get|post) request/i.test(message)) return true
    if (/does not exist|cannot be loaded|unknown path/i.test(message)) return true
  }

  return false
}

// Remembers the host + sender ID that last worked for an account, so warm
// instances stop probing endpoints on every send.
const resolvedEndpointCache = new Map<string, { host: string; accountId: string }>()

async function sendWithHostAndIdFallback(
  account: ConnectedAccount,
  requestBody: Record<string, unknown>
) {
  const { accessToken, accountId: configuredAccountId, source } = resolveInstagramCredentials(account)
  console.log('[DM] Using token source:', source, '| account:', account.username)

  const post = (host: string, accountId: string) =>
    axios.post(`${host}/${INSTAGRAM_MESSAGING_API_VERSION}/${accountId}/messages`, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      params: { access_token: accessToken },
      timeout: 20000,
    })

  // Fast path: reuse the combination that already worked for this account.
  const cached = resolvedEndpointCache.get(account.id)
  if (cached) {
    console.log('[DM] Using cached endpoint:', cached.host, cached.accountId)
    try {
      await post(cached.host, cached.accountId)
      console.log('[DM] ✓ DM sent successfully via cached endpoint')
      return
    } catch (err: any) {
      if (!isWrongEndpointError(err)) {
        console.log('[DM] ✗ Send failed (not retrying):', err?.response?.data?.error?.message || err?.message)
        throw err
      }
      console.log('[DM] Cached endpoint no longer valid, re-probing')
      resolvedEndpointCache.delete(account.id)
    }
  }

  const tokenUserId = await getTokenUserId(accessToken)
  const accountIdsToTry = [configuredAccountId, tokenUserId]
    .filter((id): id is string => Boolean(id))
    .filter((id, idx, all) => all.indexOf(id) === idx)

  let lastError: any = null
  console.log('[DM] Probing endpoints with account IDs:', accountIdsToTry)

  for (const accountId of accountIdsToTry) {
    for (const host of INSTAGRAM_MESSAGING_HOSTS) {
      console.log('[DM] Trying endpoint:', host, accountId)
      try {
        await post(host, accountId)
        console.log('[DM] ✓ DM sent successfully via', host, accountId)
        resolvedEndpointCache.set(account.id, { host, accountId })
        return
      } catch (err: any) {
        const reason = err?.response?.data?.error?.message || err?.message
        lastError = err

        if (!isWrongEndpointError(err)) {
          // Ambiguous or terminal failure — stop here rather than risk sending
          // the same message again through another endpoint.
          console.log('[DM] ✗ Aborting fallback, error is not an endpoint mismatch:', reason)
          throw err
        }

        console.log('[DM] ✗ Wrong endpoint', host, accountId, ':', reason)
      }
    }
  }

  console.log('[DM] ✗ No working endpoint found, throwing last error')
  throw lastError
}

export interface DmButton {
  text: string
  url: string
}

/**
 * Builds the message payload. With a button we send Instagram's generic
 * template so the recipient sees a tappable CTA instead of a raw URL; without
 * one it stays a plain text message.
 */
export function buildInstagramMessagePayload(
  message: string,
  button?: DmButton | null
): Record<string, unknown> {
  if (button?.text?.trim() && button?.url?.trim()) {
    return {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: [
            {
              // Instagram shows title as the card heading and subtitle beneath.
              title: message.slice(0, 80),
              subtitle: message.length > 80 ? message.slice(80, 160) : undefined,
              buttons: [
                {
                  type: 'web_url',
                  url: button.url.trim(),
                  title: button.text.trim().slice(0, 20),
                },
              ],
            },
          ],
        },
      },
    }
  }
  return { text: message }
}

export async function sendInstagramDm(params: {
  account: ConnectedAccount
  recipientId: string
  message: string
  commentId?: string | null
  button?: DmButton | null
}) {
  const { account, recipientId, message, commentId, button } = params
  const recipient = commentId ? { comment_id: commentId } : { id: recipientId }

  console.log('[DM] Sending DM to', recipientId, 'from account', account.username)
  console.log('[DM] Message:', message?.substring(0, 50) + '...', button ? '(with CTA button)' : '')

  try {
    await sendWithHostAndIdFallback(account, {
      recipient,
      message: buildInstagramMessagePayload(message, button),
    })
  } catch (err: any) {
    // If the button template is rejected (older API surface / unsupported
    // recipient), fall back to plain text with the link appended so the user
    // still receives the content rather than nothing.
    if (button?.url) {
      console.log('[DM] Button template failed, falling back to text + link')
      await sendWithHostAndIdFallback(account, {
        recipient,
        message: { text: `${message}\n\n${button.text}: ${button.url}` },
      })
    } else {
      throw err
    }
  }
  console.log('[DM] ✓ DM sent successfully')
}

export async function sendFacebookDm(params: {
  account: ConnectedAccount
  recipientId: string
  message: string
}): Promise<{ success: boolean; error?: string }> {
  const { account, recipientId, message } = params
  const accessToken = decryptToken(account.access_token_encrypted)

  const requestBody: any = {
    recipient: { id: recipientId },
    message: { text: message },
    messaging_type: 'RESPONSE',
  }

  try {
    await axios.post(
      `https://graph.facebook.com/${FACEBOOK_MESSAGING_API_VERSION}/me/messages`,
      requestBody,
      {
        params: { access_token: accessToken },
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      }
    )
    return { success: true }
  } catch (err: any) {
    const errorCode = err?.response?.data?.error?.code
    const errorMessage = err?.response?.data?.error?.message || err.message
    console.log('[Facebook DM] Error:', errorCode, errorMessage)
    return { success: false, error: `${errorCode}: ${errorMessage}` }
  }
}

async function sendInstagramCommentReply(params: {
  account: ConnectedAccount
  commentId: string
  replyText: string
}) {
  const { account, commentId, replyText } = params
  const accessToken = decryptToken(account.access_token_encrypted)

  try {
    // Instagram Graph API for comment replies
    const replyUrl = `https://graph.instagram.com/v25.0/${commentId}/replies`
    
    await axios.post(replyUrl, null, {
      params: {
        access_token: accessToken,
        message: replyText
      },
      headers: { 'Content-Type': 'application/json' }
    })
    
    console.log('[Instagram Comment Reply] ✓ Comment reply sent successfully')
    return { success: true }
  } catch (err: any) {
    console.log('[Instagram Comment Reply] ❌ Failed to send comment reply:', err?.response?.data?.error?.message || err?.message)
    return { success: false, error: err?.message }
  }
}

async function sendFacebookCommentReply(params: {
  account: ConnectedAccount
  commentId: string
  replyText: string
}): Promise<{ success: boolean; error?: string }> {
  const { account, commentId, replyText } = params
  const accessToken = decryptToken(account.access_token_encrypted)

  try {
    console.log('[Facebook Comment Reply] Sending reply to comment:', commentId)
    console.log('[Facebook Comment Reply] Reply text:', replyText)
    console.log('[Facebook Comment Reply] Access token length:', accessToken?.length)
    
    const response = await axios.post(
      `https://graph.facebook.com/${FACEBOOK_MESSAGING_API_VERSION}/${commentId}/comments`,
      { message: replyText },
      {
        params: { access_token: accessToken },
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      }
    )
    console.log('[Facebook Comment Reply] ✓ Comment reply sent successfully')
    return { success: true }
  } catch (err: any) {
    const errorCode = err?.response?.data?.error?.code
    const errorMessage = err?.response?.data?.error?.message || err.message
    const errorType = err?.response?.data?.error?.type
    const errorSubcode = err?.response?.data?.error?.error_subcode
    console.log('[Facebook Comment Reply] Error details:', {
      code: errorCode,
      message: errorMessage,
      type: errorType,
      subcode: errorSubcode,
      fullResponse: err?.response?.data
    })
    return { success: false, error: `${errorCode}: ${errorMessage}` }
  }
}

export async function processQueuedInstagramDmsForAccount(
  supabase: any,
  accountId: string
) {
  console.log('[Queue] Processing queue for account:', accountId)

  const { data: account } = await supabase
    .from('connected_accounts')
    .select('*')
    .eq('id', accountId)
    .eq('is_active', true)
    .single()

  if (!account) {
    console.log('[Queue] No account found for:', accountId)
    return { processed: 0, remainingQuota: 0 }
  }

  const resolvedAccount = account as ConnectedAccount
  const platform = resolvedAccount.platform
  const quotaLimit = platform === 'facebook' ? FACEBOOK_MESSAGES_PER_HOUR_LIMIT : INSTAGRAM_COMMENTS_PER_HOUR_LIMIT

  console.log('[Queue] Found account:', resolvedAccount.username, 'platform:', platform)

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count: sentInLastHour } = await supabase
    .from('dm_logs')
    .select('id', { count: 'exact', head: true })
    .eq('account_id', accountId)
    .eq('platform', platform)
    .eq('status', 'sent')
    .gte('sent_at', oneHourAgo)

  const remainingQuota = Math.max(0, quotaLimit - (sentInLastHour || 0))
  console.log('[Queue] Sent in last hour:', sentInLastHour, 'Remaining quota:', remainingQuota)

  if (remainingQuota <= 0) {
    console.log('[Queue] No quota remaining')
    return { processed: 0, remainingQuota: 0 }
  }

  // ── Monthly plan limit ──────────────────────────────────────────────────
  // Separate from the per-hour Meta limit above: this is the subscription cap.
  const planUsage = await getUserPlanUsage(supabase, resolvedAccount.user_id)
  let monthlyRemaining = planUsage ? planUsage.remaining : Number.POSITIVE_INFINITY
  if (planUsage && monthlyRemaining <= 0) {
    console.log('[Queue] Monthly DM limit reached for plan:', planUsage.plan)
    return { processed: 0, remainingQuota }
  }

  const { data: queuedLogs } = await supabase
    .from('dm_logs')
    .select('id, automation_id, commenter_platform_id, commenter_username, dm_message_sent, comment_id, retry_count')
    .eq('account_id', accountId)
    .eq('platform', platform)
    .eq('status', 'queued')
    .order('created_at', { ascending: true })
    .limit(remainingQuota)

  console.log('[Queue] Found queued logs:', queuedLogs?.length || 0)

  const automationCache = new Map<string, Automation | null>()
  let processed = 0

  for (const rawLog of (queuedLogs || [])) {
    const log = rawLog as DmLogRow
    console.log('[Queue] Processing log:', log.id, 'for commenter:', log.commenter_username)

    // Stop once the plan's monthly budget is exhausted; leave the rest queued.
    if (monthlyRemaining <= 0) {
      console.log('[Queue] Monthly DM budget exhausted mid-run; leaving remainder queued')
      break
    }

    const { data: claimed } = await supabase
      .from('dm_logs')
      .update({ status: 'pending' })
      .eq('id', log.id)
      .eq('status', 'queued')
      .select('id')
      .single()

    if (!claimed) {
      console.log('[Queue] Failed to claim log:', log.id)
      continue
    }
    console.log('[Queue] Successfully claimed log:', log.id)

    if (!log.automation_id) {
      await supabase
        .from('dm_logs')
        .update({ status: 'failed', error_message: 'Missing automation_id' })
        .eq('id', log.id)
      continue
    }

    if (!automationCache.has(log.automation_id)) {
      const { data: automation } = await supabase
        .from('automations')
        .select('id, is_active, dm_message, dm_video_url, comment_reply_enabled, comment_reply_text, total_dms_sent, flow_steps, button_text, button_url')
        .eq('id', log.automation_id)
        .single()
      automationCache.set(log.automation_id, (automation as Automation) || null)
    }

    const automation = automationCache.get(log.automation_id) as Automation | null
    if (!automation || !automation.is_active) {
      await supabase
        .from('dm_logs')
        .update({ status: 'failed', error_message: 'Automation is inactive or missing' })
        .eq('id', log.id)
      continue
    }

    const messageToSend = log.dm_message_sent || automation.dm_message
    console.log('[Queue] Sending DM to:', log.commenter_platform_id, 'message:', messageToSend)
    try {
      let dmSent = false
      if (platform === 'facebook') {
        const result = await sendFacebookDm({
          account: resolvedAccount,
          recipientId: log.commenter_platform_id,
          message: messageToSend,
        })
        if (!result.success) {
          // Facebook error 551: User cannot be messaged (hasn't messaged page first)
          // Facebook error 10: Message sent outside 24-hour window
          // Fallback to public comment reply
          if ((result.error?.includes('551') || result.error?.includes('10')) && log.comment_id) {
            console.log('[Queue] Facebook DM blocked (551/10), attempting public comment reply')
            const replyResult = await sendFacebookCommentReply({
              account: resolvedAccount,
              commentId: log.comment_id,
              replyText: messageToSend,
            })
            if (replyResult.success) {
              console.log('[Queue] ✓ Public comment reply sent successfully')
              dmSent = true
            } else {
              console.log('[Queue] Comment reply failed:', replyResult.error)
              // Throw with combined error info
              throw new Error(`DM blocked (${result.error}) and comment reply failed (${replyResult.error})`)
            }
          } else {
            throw new Error(result.error)
          }
        } else {
          dmSent = true
        }
      } else {
        await sendInstagramDm({
          account: resolvedAccount,
          recipientId: log.commenter_platform_id,
          commentId: log.comment_id,
          message: messageToSend,
          button: automation.button_text && automation.button_url
            ? { text: automation.button_text, url: automation.button_url }
            : null,
        })
        dmSent = true
      }

      if (dmSent) {
        console.log('[Queue] ✓ DM sent successfully to:', log.commenter_platform_id)

        await supabase
          .from('dm_logs')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            error_message: null,
          })
          .eq('id', log.id)

        await supabase
          .from('automations')
          .update({ total_dms_sent: (automation.total_dms_sent || 0) + 1 })
          .eq('id', automation.id)

        automation.total_dms_sent = (automation.total_dms_sent || 0) + 1

        if (automation.comment_reply_enabled && log.comment_id) {
          const replyText = automation.comment_reply_text || 'Check your DM.'
          try {
            if (platform === 'facebook') {
              await sendFacebookCommentReply({
                account: resolvedAccount,
                commentId: log.comment_id,
                replyText,
              })
            } else {
              await sendInstagramCommentReply({
                account: resolvedAccount,
                commentId: log.comment_id,
                replyText,
              })
            }
          } catch (replyErr: any) {
            // Public comment reply is best effort and should not fail DM delivery.
            console.log('[Queue] Comment reply failed:', replyErr.response?.data?.error?.message || replyErr.message)
          }
        }

        // Count this send against the user's monthly plan budget.
        if (planUsage) {
          monthlyRemaining -= 1
          await incrementDmUsage(supabase, resolvedAccount.user_id)
        }

        // Multi-step flow: send steps 2..N in order. The primary (step 1) was
        // stored in dm_message_sent; extras come from the automation's flow.
        const extraSteps = getAutomationMessages(automation, log.commenter_username, log.commenter_username).slice(1)
        for (const stepMsg of extraSteps) {
          if (monthlyRemaining <= 0) break
          try {
            await new Promise(r => setTimeout(r, 800))
            if (platform === 'facebook') {
              await sendFacebookDm({ account: resolvedAccount, recipientId: log.commenter_platform_id, message: stepMsg })
            } else {
              await sendInstagramDm({ account: resolvedAccount, recipientId: log.commenter_platform_id, message: stepMsg })
            }
            if (planUsage) { monthlyRemaining -= 1; await incrementDmUsage(supabase, resolvedAccount.user_id) }
          } catch (stepErr: any) {
            console.log('[Queue] Flow extra step failed:', stepErr?.message || stepErr)
            break
          }
        }

        processed++
      }
    } catch (err: any) {
      const errorCode = err?.response?.data?.error?.code
      const errorMessage = err?.response?.data?.error?.message || err.message
      console.log('[Queue] ❌ DM send failed:', errorCode, errorMessage)
      console.log('[Queue] Full error:', err)

      // 368 = temporary block/rate limit. Keep queued so future cron runs can retry.
      if (errorCode === 368 || errorCode === 4 || errorCode === 613) {
        await supabase
          .from('dm_logs')
          .update({
            status: 'queued',
            retry_count: (log.retry_count || 0) + 1,
            error_message: `${errorCode}: ${errorMessage}`,
          })
          .eq('id', log.id)
        break
      }

      await supabase
        .from('dm_logs')
        .update({
          status: 'failed',
          retry_count: (log.retry_count || 0) + 1,
          error_message: `${errorCode}: ${errorMessage}`,
        })
        .eq('id', log.id)

      // Surface Meta's exact error in the dashboard — this is what turns
      // "no DM arrived" into an actionable message.
      await recordWebhookEvent({
        outcome: 'send_failed',
        eventKind: 'comment',
        accountId: resolvedAccount.id,
        userId: resolvedAccount.user_id,
        detail: `Meta rejected the send — ${errorCode ?? 'error'}: ${errorMessage}`,
      })
    }
  }

  console.log('[Queue] Processing complete. Processed:', processed, 'Remaining quota:', remainingQuota)
  return { processed, remainingQuota }
}

export const DM_QUEUE_LIMITS = {
  INSTAGRAM_COMMENTS_PER_HOUR: INSTAGRAM_COMMENTS_PER_HOUR_LIMIT,
}
