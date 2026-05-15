import axios from 'axios'
import { decryptToken } from '@/lib/encryption'

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

async function sendWithHostAndIdFallback(
  account: ConnectedAccount,
  requestBody: Record<string, unknown>
) {
  // Instagram messaging API requires Facebook Page access token, not Instagram access token
  const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN || decryptToken(account.access_token_encrypted)
  const configuredAccountId = process.env.IG_BUSINESS_ACCOUNT_ID || account.platform_account_id
  const tokenUserId = await getTokenUserId(accessToken)
  const accountIdsToTry = [configuredAccountId, tokenUserId].filter(id => id && id !== configuredAccountId)

  let lastError: any = null
  for (const accountId of [configuredAccountId, ...accountIdsToTry]) {
    if (!accountId) continue
    for (const host of INSTAGRAM_MESSAGING_HOSTS) {
      const endpoint = `${host}/${INSTAGRAM_MESSAGING_API_VERSION}/${accountId}/messages`
      try {
        await axios.post(endpoint, requestBody, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          params: { access_token: accessToken },
          timeout: 10000,
        })
        return
      } catch (err) {
        lastError = err
      }
    }
  }

  throw lastError
}

export async function sendInstagramDm(params: {
  account: ConnectedAccount
  recipientId: string
  message: string
  commentId?: string | null
  videoUrl?: string | null
}) {
  const { account, recipientId, message, commentId, videoUrl } = params
  const recipient = commentId ? { comment_id: commentId } : { id: recipientId }

  // Meta allows one private reply per comment. If a video URL is configured,
  // send video attachment as the primary message for comment-triggered outreach.
  if (videoUrl) {
    await sendWithHostAndIdFallback(account, {
      recipient,
      message: {
        attachment: {
          type: 'video',
          payload: { url: videoUrl },
        },
      },
    })
    return
  }

  await sendWithHostAndIdFallback(account, {
    recipient,
    message: { text: message },
  })
}

export async function sendFacebookDm(params: {
  account: ConnectedAccount
  recipientId: string
  message: string
  videoUrl?: string | null
}): Promise<{ success: boolean; error?: string }> {
  const { account, recipientId, message, videoUrl } = params
  const accessToken = decryptToken(account.access_token_encrypted)

  const requestBody: any = {
    recipient: { id: recipientId },
    message: {},
    messaging_type: 'RESPONSE',
  }

  if (videoUrl) {
    requestBody.message = {
      attachment: {
        type: 'video',
        payload: { url: videoUrl },
      },
    }
  } else {
    requestBody.message = { text: message }
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
  // Instagram comment replies also require Facebook Page access token
  const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN || decryptToken(account.access_token_encrypted)

  let lastError: any = null
  for (const host of INSTAGRAM_MESSAGING_HOSTS) {
    try {
      await axios.post(
        `${host}/${INSTAGRAM_MESSAGING_API_VERSION}/${commentId}/replies`,
        null,
        {
          params: {
            message: replyText,
            access_token: accessToken,
          },
          timeout: 10000,
        }
      )
      return
    } catch (err) {
      lastError = err
    }
  }

  if (lastError) {
    throw lastError
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
    await axios.post(
      `https://graph.facebook.com/${FACEBOOK_MESSAGING_API_VERSION}/${commentId}/comments`,
      { message: replyText },
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
    console.log('[Facebook Comment Reply] Error:', errorCode, errorMessage)
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
        .select('id, is_active, dm_message, dm_video_url, comment_reply_enabled, comment_reply_text, total_dms_sent')
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
          videoUrl: automation.dm_video_url,
        })
        if (!result.success) {
          // Facebook error 551: User cannot be messaged (hasn't messaged page first)
          // Fallback to public comment reply
          if (result.error?.includes('551') && log.comment_id) {
            console.log('[Queue] Facebook DM blocked (551), attempting public comment reply')
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
              throw new Error(result.error)
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
          videoUrl: automation.dm_video_url,
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
    }
  }

  console.log('[Queue] Processing complete. Processed:', processed, 'Remaining quota:', remainingQuota)
  return { processed, remainingQuota }
}

export const DM_QUEUE_LIMITS = {
  INSTAGRAM_COMMENTS_PER_HOUR: INSTAGRAM_COMMENTS_PER_HOUR_LIMIT,
}
