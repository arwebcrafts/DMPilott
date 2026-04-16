import { NextResponse } from 'next/server'
import { Receiver } from '@upstash/qstash'
import { createServiceClient } from '@/lib/supabase/server'
import { decryptToken } from '@/lib/encryption'
import axios from 'axios'

export async function POST(request: Request) {
  const rawBody = await request.text()

  // Verify QStash signature to ensure requests come only from QStash
  if (process.env.QSTASH_CURRENT_SIGNING_KEY && process.env.QSTASH_NEXT_SIGNING_KEY) {
    const receiver = new Receiver({
      currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY,
      nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY,
    })

    try {
      await receiver.verify({
        signature: request.headers.get('upstash-signature') ?? '',
        body: rawBody,
      })
    } catch {
      console.log('[SendDM] ❌ Invalid QStash signature')
      return new NextResponse('Invalid signature', { status: 401 })
    }
  }

  const job = JSON.parse(rawBody)
  const {
    automationId,
    accountId,
    userId,
    platform,
    commenterId,
    commenterUsername,
    commentId,
    postId,
    keywordMatched,
  } = job

  console.log('[SendDM] Processing job — platform:', platform, '| commenter: @', commenterUsername)

  const supabase = createServiceClient()

  const { data: automation } = await supabase
    .from('automations')
    .select('*')
    .eq('id', automationId)
    .single()

  if (!automation || !automation.is_active) {
    console.log('[SendDM] Automation not found or inactive — skipping')
    return new NextResponse('OK', { status: 200 })
  }

  const { data: account } = await supabase
    .from('connected_accounts')
    .select('*')
    .eq('id', accountId)
    .eq('is_active', true)
    .single()

  if (!account) {
    console.log('[SendDM] Account not found or inactive — skipping')
    return new NextResponse('OK', { status: 200 })
  }

  let accessToken: string
  try {
    accessToken = decryptToken(account.access_token_encrypted)
  } catch (err) {
    console.error('[SendDM] Token decryption failed:', err)
    return new NextResponse('Token error', { status: 500 })
  }

  const personalizedMessage = automation.dm_message
    .replace(/{name}/g, commenterUsername || 'there')
    .replace(/{username}/g, `@${commenterUsername || 'user'}`)

  try {
    if (platform === 'instagram') {
      // Instagram DM: POST /{ig-user-id}/messages
      await axios.post(
        `https://graph.facebook.com/v21.0/${account.platform_account_id}/messages`,
        {
          recipient: { id: commenterId },
          message: { text: personalizedMessage },
        },
        {
          params: { access_token: accessToken },
          headers: { 'Content-Type': 'application/json' },
        }
      )
    } else {
      // Facebook Page DM: POST /{page-id}/messages
      await axios.post(
        `https://graph.facebook.com/v21.0/${account.platform_account_id}/messages`,
        {
          recipient: { id: commenterId },
          message: { text: personalizedMessage },
          messaging_type: 'RESPONSE',
        },
        {
          params: { access_token: accessToken },
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Log success
    await supabase.from('dm_logs').insert({
      automation_id: automationId,
      user_id: userId,
      account_id: accountId,
      platform,
      post_id: postId,
      commenter_platform_id: commenterId,
      commenter_username: commenterUsername,
      keyword_matched: keywordMatched,
      dm_message_sent: automation.dm_message,
      status: 'sent',
      sent_at: new Date().toISOString(),
    })

    await supabase
      .from('automations')
      .update({ total_dms_sent: (automation.total_dms_sent || 0) + 1 })
      .eq('id', automationId)

    console.log('[SendDM] ✅ DM sent to @', commenterUsername)

    // Post comment reply (Instagram only — after DM succeeds)
    if (platform === 'instagram' && commentId && automation.comment_reply_enabled) {
      const replyText = automation.comment_reply_text || 'Check your DMs! 📩'
      try {
        await axios.post(
          `https://graph.facebook.com/v21.0/${commentId}/replies`,
          null,
          {
            params: { message: replyText, access_token: accessToken },
          }
        )
        console.log('[SendDM] ✅ Comment reply posted:', replyText)
      } catch (replyErr: any) {
        // Non-fatal: DM was sent, reply failed
        console.log('[SendDM] ⚠️ Comment reply failed:', replyErr.response?.data?.error?.message || replyErr.message)
      }
    }

    return new NextResponse('OK', { status: 200 })
  } catch (err: any) {
    const errorCode = err.response?.data?.error?.code
    const errorMessage = err.response?.data?.error?.message || err.message
    console.error('[SendDM] ❌ DM failed:', errorCode, errorMessage)

    if (errorCode === 190) {
      // Token expired — deactivate account and all its automations
      await supabase.from('connected_accounts').update({ is_active: false }).eq('id', accountId)
      await supabase.from('automations').update({ is_active: false }).eq('account_id', accountId)
      console.log('[SendDM] ⚠️ Token expired — account deactivated')
    }

    await supabase.from('dm_logs').insert({
      automation_id: automationId,
      user_id: userId,
      account_id: accountId,
      platform,
      post_id: postId,
      commenter_platform_id: commenterId,
      commenter_username: commenterUsername,
      keyword_matched: keywordMatched,
      dm_message_sent: automation.dm_message,
      status: 'failed',
      error_message: `${errorCode}: ${errorMessage}`,
    })

    // Return 500 on rate limit so QStash retries automatically
    if (errorCode === 368) {
      return new NextResponse('Rate limited — will retry', { status: 500 })
    }

    return new NextResponse('Failed', { status: 200 })
  }
}
