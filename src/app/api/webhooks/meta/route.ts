import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createServiceClient } from '@/lib/supabase/server'
import { decryptToken } from '@/lib/encryption'
import axios from 'axios'

function verifySignature(body: string, signature: string): boolean {
  const expected = crypto
    .createHmac('sha256', process.env.META_APP_SECRET!)
    .update(body)
    .digest('hex')
  return `sha256=${expected}` === signature
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 })
  }

  return new NextResponse('Forbidden', { status: 403 })
}

export async function POST(request: Request) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-hub-signature-256') || ''

  console.log('[Webhook] === NEW WEBHOOK EVENT ===')
  console.log('[Webhook] Signature header:', signature)
  console.log('[Webhook] Body length:', rawBody.length)
  console.log('[Webhook] Body FULL:', rawBody)
  console.log('[Webhook] META_APP_SECRET set:', !!process.env.META_APP_SECRET)

  if (!verifySignature(rawBody, signature)) {
    console.log('[Webhook] ❌ Signature verification FAILED')
    return new NextResponse('Invalid signature', { status: 403 })
  }

  console.log('[Webhook] ✓ Signature verified')
  const payload = JSON.parse(rawBody)
  console.log('[Webhook] Payload object:', payload.object)
  console.log('[Webhook] Entry IDs:', payload.entry?.map((e: any) => e.id))
  console.log('[Webhook] Entry changes fields:', payload.entry?.map((e: any) => e.changes?.map((c: any) => c.field)))

  const supabase = createServiceClient()

  // Diagnostic: show ALL accounts in DB so we can debug account matching
  const { data: allAccounts } = await supabase
    .from('connected_accounts')
    .select('id, platform, platform_account_id, username, is_active')
  console.log('[Webhook] ALL accounts in DB:', JSON.stringify(allAccounts))

  // ─── Instagram events ────────────────────────────────────────────────────
  if (payload.object === 'instagram') {
    for (const entry of payload.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field !== 'comments') continue

        const value = change.value
        // entry.id for instagram object = Instagram Business Account ID
        const igAccountId = entry.id
        const commentId = value.id
        const commentText = value.text || ''
        const commenterId = value.from?.id
        const commenterUsername = value.from?.username
        const postId = value.media?.id

        console.log('[Webhook] IG Comment event:')
        console.log('[Webhook]   IG account ID (entry.id):', igAccountId)
        console.log('[Webhook]   commenter:', commenterUsername, '/', commenterId)
        console.log('[Webhook]   comment text:', commentText)
        console.log('[Webhook]   comment ID:', commentId)
        console.log('[Webhook]   post ID:', postId)

        // Look up the connected account by Instagram Business Account ID
        const { data: account } = await supabase
          .from('connected_accounts')
          .select('*')
          .eq('platform_account_id', igAccountId)
          .eq('platform', 'instagram')
          .eq('is_active', true)
          .single()

        if (!account) {
          // Try without is_active to give a clearer error
          const { data: anyMatch } = await supabase
            .from('connected_accounts')
            .select('id, platform_account_id, username, is_active')
            .eq('platform_account_id', igAccountId)
            .eq('platform', 'instagram')
            .single()

          if (anyMatch) {
            console.log('[Webhook] ⚠️ Account found but is_active=false, username:', anyMatch.username)
            console.log('[Webhook] ACTION: Reconnect the account at /dashboard/accounts')
          } else {
            console.log('[Webhook] ❌ No IG account found for ID:', igAccountId)
            console.log('[Webhook] ACTION: Connect this IG account at /dashboard/accounts')
          }
          continue
        }

        console.log('[Webhook] ✓ Found account:', account.username)

        // Find matching automation
        const { data: automations } = await supabase
          .from('automations')
          .select('*')
          .eq('account_id', account.id)
          .eq('is_active', true)
          .eq('platform', 'instagram')

        console.log('[Webhook] Active automations for account:', automations?.length || 0)

        let matchedAutomation = null
        let matchedKeyword: string | null = null
        const textLower = commentText.toLowerCase().trim()

        for (const auto of automations || []) {
          if (auto.trigger_type === 'any_comment') {
            matchedAutomation = auto
            break
          }
          if (auto.trigger_type === 'comment_keyword') {
            const keywords: string[] = auto.keywords || []
            const found = keywords.find((kw: string) => textLower.includes(kw.toLowerCase()))
            if (found) {
              matchedAutomation = auto
              matchedKeyword = found
              break
            }
          }
        }

        if (!matchedAutomation) {
          console.log('[Webhook] No matching automation for text:', commentText)
          continue
        }

        console.log('[Webhook] ✓ Matched automation:', matchedAutomation.name, '| keyword:', matchedKeyword)

        // Duplicate check — skip if we already DM'd this person on this post
        const { data: existingLog } = await supabase
          .from('dm_logs')
          .select('id')
          .eq('automation_id', matchedAutomation.id)
          .eq('post_id', postId)
          .eq('commenter_platform_id', commenterId)
          .eq('status', 'sent')
          .single()

        if (existingLog) {
          console.log('[Webhook] Duplicate — already sent DM to this commenter on this post')
          continue
        }

        // Use QStash if configured, else direct send (local dev fallback)
        if (process.env.QSTASH_TOKEN) {
          const { Client } = await import('@upstash/qstash')
          const qstash = new Client({ token: process.env.QSTASH_TOKEN })

          await qstash.publishJSON({
            url: `${process.env.NEXT_PUBLIC_APP_URL}/api/workers/send-dm`,
            body: {
              automationId: matchedAutomation.id,
              accountId: account.id,
              userId: account.user_id,
              platform: 'instagram',
              commenterId,
              commenterUsername,
              commentId,
              postId,
              keywordMatched: matchedKeyword,
            },
            delay: matchedAutomation.send_delay_seconds ?? 0,
          })

          console.log('[Webhook] ✓ Job published to QStash for @', commenterUsername)
        } else {
          await sendInstagramDM({
            supabase,
            account,
            matchedAutomation,
            commenterId,
            commenterUsername,
            commentId,
            postId,
            matchedKeyword,
          })
        }
      }
    }
  }

  // ─── Facebook Page events ────────────────────────────────────────────────
  if (payload.object === 'page') {
    for (const entry of payload.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field !== 'feed' || change.value?.item !== 'comment') continue

        const pageId = entry.id
        const commenterId = change.value.from?.id
        const commenterName = change.value.from?.name
        const commentText = change.value.message || ''
        const commentId = change.value.comment_id
        const postId = change.value.post_id

        console.log('[Webhook] FB Comment event — page:', pageId, 'commenter:', commenterName)

        const { data: account } = await supabase
          .from('connected_accounts')
          .select('*')
          .eq('platform_account_id', pageId)
          .eq('platform', 'facebook')
          .eq('is_active', true)
          .single()

        if (!account) {
          console.log('[Webhook] No FB account found for page ID:', pageId)
          continue
        }

        const { data: automations } = await supabase
          .from('automations')
          .select('*')
          .eq('account_id', account.id)
          .eq('is_active', true)
          .eq('platform', 'facebook')

        let matchedAutomation = null
        let matchedKeyword: string | null = null
        const textLower = commentText.toLowerCase().trim()

        for (const auto of automations || []) {
          if (auto.trigger_type === 'any_comment') {
            matchedAutomation = auto
            break
          }
          if (auto.trigger_type === 'comment_keyword') {
            const keywords: string[] = auto.keywords || []
            const found = keywords.find((kw: string) => textLower.includes(kw.toLowerCase()))
            if (found) {
              matchedAutomation = auto
              matchedKeyword = found
              break
            }
          }
        }

        if (!matchedAutomation) continue

        // Duplicate check
        const { data: existingLog } = await supabase
          .from('dm_logs')
          .select('id')
          .eq('automation_id', matchedAutomation.id)
          .eq('post_id', postId)
          .eq('commenter_platform_id', commenterId)
          .eq('status', 'sent')
          .single()

        if (existingLog) continue

        if (process.env.QSTASH_TOKEN) {
          const { Client } = await import('@upstash/qstash')
          const qstash = new Client({ token: process.env.QSTASH_TOKEN })

          await qstash.publishJSON({
            url: `${process.env.NEXT_PUBLIC_APP_URL}/api/workers/send-dm`,
            body: {
              automationId: matchedAutomation.id,
              accountId: account.id,
              userId: account.user_id,
              platform: 'facebook',
              commenterId,
              commenterUsername: commenterName,
              commentId,
              postId,
              keywordMatched: matchedKeyword,
            },
          })

          console.log('[Webhook] ✓ FB job published to QStash for', commenterName)
        } else {
          await sendFacebookDM({
            supabase,
            account,
            matchedAutomation,
            commenterId,
            commenterName,
            postId,
            matchedKeyword,
          })
        }
      }
    }
  }

  return new NextResponse('OK', { status: 200 })
}

// ─── Instagram DM + comment reply (direct send, no QStash) ──────────────────

async function sendInstagramDM({
  supabase,
  account,
  matchedAutomation,
  commenterId,
  commenterUsername,
  commentId,
  postId,
  matchedKeyword,
}: {
  supabase: any
  account: any
  matchedAutomation: any
  commenterId: string
  commenterUsername: string
  commentId: string
  postId: string
  matchedKeyword: string | null
}) {
  console.log('[Webhook] Sending IG DM directly to @', commenterUsername)

  let accessToken: string
  try {
    accessToken = decryptToken(account.access_token_encrypted)
  } catch (err) {
    console.error('[Webhook] Token decryption failed:', err)
    return
  }

  const personalizedMessage = matchedAutomation.dm_message
    .replace(/{name}/g, commenterUsername || 'there')
    .replace(/{username}/g, `@${commenterUsername || 'user'}`)

  try {
    // Correct Instagram DM endpoint: /{ig-user-id}/messages (NOT /me/messages)
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

    await supabase.from('dm_logs').insert({
      automation_id: matchedAutomation.id,
      user_id: account.user_id,
      account_id: account.id,
      platform: 'instagram',
      post_id: postId,
      commenter_platform_id: commenterId,
      commenter_username: commenterUsername,
      keyword_matched: matchedKeyword,
      dm_message_sent: matchedAutomation.dm_message,
      status: 'sent',
      sent_at: new Date().toISOString(),
    })

    await supabase
      .from('automations')
      .update({ total_dms_sent: (matchedAutomation.total_dms_sent || 0) + 1 })
      .eq('id', matchedAutomation.id)

    console.log('[Webhook] ✅ IG DM sent to @', commenterUsername)

    // Post comment reply after successful DM
    if (matchedAutomation.comment_reply_enabled && commentId) {
      const replyText = matchedAutomation.comment_reply_text || 'Check your DMs! 📩'
      try {
        await axios.post(
          `https://graph.facebook.com/v21.0/${commentId}/replies`,
          null,
          {
            params: { message: replyText, access_token: accessToken },
          }
        )
        console.log('[Webhook] ✅ Comment reply posted')
      } catch (replyErr: any) {
        console.log('[Webhook] ⚠️ Comment reply failed:', replyErr.response?.data?.error?.message || replyErr.message)
      }
    }
  } catch (err: any) {
    const errorCode = err.response?.data?.error?.code
    const errorMessage = err.response?.data?.error?.message || err.message
    console.log('[Webhook] ❌ IG DM failed:', errorCode, errorMessage)

    if (errorCode === 190) {
      // Token expired — deactivate account + automations
      await supabase.from('connected_accounts').update({ is_active: false }).eq('id', account.id)
      await supabase.from('automations').update({ is_active: false }).eq('account_id', account.id)
      console.log('[Webhook] ⚠️ Token expired — account deactivated')
    }

    await supabase.from('dm_logs').insert({
      automation_id: matchedAutomation.id,
      user_id: account.user_id,
      account_id: account.id,
      platform: 'instagram',
      post_id: postId,
      commenter_platform_id: commenterId,
      commenter_username: commenterUsername,
      keyword_matched: matchedKeyword,
      dm_message_sent: matchedAutomation.dm_message,
      status: 'failed',
      error_message: `${errorCode}: ${errorMessage}`,
    })
  }
}

// ─── Facebook DM (direct send, no QStash) ────────────────────────────────────

async function sendFacebookDM({
  supabase,
  account,
  matchedAutomation,
  commenterId,
  commenterName,
  postId,
  matchedKeyword,
}: {
  supabase: any
  account: any
  matchedAutomation: any
  commenterId: string
  commenterName: string
  postId: string
  matchedKeyword: string | null
}) {
  let accessToken: string
  try {
    accessToken = decryptToken(account.access_token_encrypted)
  } catch (err) {
    console.error('[Webhook] Token decryption failed:', err)
    return
  }

  const personalizedMessage = matchedAutomation.dm_message
    .replace(/{name}/g, commenterName || 'there')
    .replace(/{username}/g, `@${commenterName || 'user'}`)

  try {
    // Facebook Page DM: /{page-id}/messages
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

    await supabase.from('dm_logs').insert({
      automation_id: matchedAutomation.id,
      user_id: account.user_id,
      account_id: account.id,
      platform: 'facebook',
      post_id: postId,
      commenter_platform_id: commenterId,
      commenter_username: commenterName,
      keyword_matched: matchedKeyword,
      dm_message_sent: matchedAutomation.dm_message,
      status: 'sent',
      sent_at: new Date().toISOString(),
    })

    await supabase
      .from('automations')
      .update({ total_dms_sent: (matchedAutomation.total_dms_sent || 0) + 1 })
      .eq('id', matchedAutomation.id)

    console.log('[Webhook] ✅ FB DM sent to', commenterName)
  } catch (err: any) {
    const errorCode = err.response?.data?.error?.code
    const errorMessage = err.response?.data?.error?.message || err.message
    console.log('[Webhook] ❌ FB DM failed:', errorCode, errorMessage)

    await supabase.from('dm_logs').insert({
      automation_id: matchedAutomation.id,
      user_id: account.user_id,
      account_id: account.id,
      platform: 'facebook',
      post_id: postId,
      commenter_platform_id: commenterId,
      commenter_username: commenterName,
      keyword_matched: matchedKeyword,
      dm_message_sent: matchedAutomation.dm_message,
      status: 'failed',
      error_message: `${errorCode}: ${errorMessage}`,
    })
  }
}
