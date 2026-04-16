import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createServiceClient } from '@/lib/supabase/server'
import { encryptToken, decryptToken } from '@/lib/encryption'
import { Queue } from 'bullmq'
import IORedis from 'ioredis'
import axios from 'axios'

// Verify Meta webhook signature
function verifySignature(body: string, signature: string): boolean {
  const expected = crypto
    .createHmac('sha256', process.env.META_APP_SECRET!)
    .update(body)
    .digest('hex')
  return `sha256=${expected}` === signature
}

// GET = webhook verification
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

// POST = webhook events
export async function POST(request: Request) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-hub-signature-256') || ''

  console.log('[Webhook] === NEW WEBHOOK EVENT ===')
  console.log('[Webhook] Signature header:', signature)
  console.log('[Webhook] Body length:', rawBody.length)
  console.log('[Webhook] Body preview:', rawBody.substring(0, 200))
  console.log('[Webhook] META_APP_SECRET set:', !!process.env.META_APP_SECRET)
  console.log('[Webhook] META_APP_SECRET length:', process.env.META_APP_SECRET?.length)

  // Compute expected signature for debugging
  if (process.env.META_APP_SECRET) {
    const expected = crypto
      .createHmac('sha256', process.env.META_APP_SECRET)
      .update(rawBody)
      .digest('hex')
    const expectedWithPrefix = `sha256=${expected}`
    console.log('[Webhook] Expected signature:', expectedWithPrefix)
    console.log('[Webhook] Signatures match:', expectedWithPrefix === signature)
  }

  if (!verifySignature(rawBody, signature)) {
    console.log('[Webhook] ❌ Signature verification FAILED')
    return new NextResponse('Invalid signature', { status: 403 })
  }

  console.log('[Webhook] ✓ Signature verified')
  console.log('[Webhook] Payload object:', payload.object)
  console.log('[Webhook] Entry IDs:', payload.entry?.map((e: any) => e.id))
  console.log('[Webhook] Entry changes fields:', payload.entry?.map((e: any) => e.changes?.map((c: any) => c.field)))

  const supabase = createServiceClient()

  // Get Redis connection
  const redis = new IORedis(process.env.REDIS_URL!, { maxRetriesPerRequest: null })
  const dmQueue = new Queue('dm-jobs', { connection: redis })

  // Process Instagram events
  if (payload.object === 'instagram') {
    for (const entry of payload.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field === 'comments') {
          const value = change.value
          const pageId = entry.id

          // Find connected account
          const { data: account } = await supabase
            .from('connected_accounts')
            .select('*, users!inner(id, plan, dms_used_this_month)')
            .eq('platform_account_id', pageId)
            .eq('is_active', true)
            .single()

          if (!account) continue

          // Find matching automation
          const { data: automations } = await supabase
            .from('automations')
            .select('*')
            .eq('account_id', account.id)
            .eq('is_active', true)
            .eq('platform', 'instagram')

          let matchedAutomation = null
          let matchedKeyword: string | null = null

          for (const auto of automations || []) {
            if (auto.trigger_type === 'any_comment') {
              matchedAutomation = auto
              break
            }
            if (auto.trigger_type === 'comment_keyword') {
              const keywords: string[] = auto.keywords || []
              const commentText = (value.text || '').toLowerCase().trim()
              const found = keywords.find(kw => commentText.includes(kw.toLowerCase()))
              if (found) {
                matchedAutomation = auto
                matchedKeyword = found
                break
              }
            }
          }

          if (!matchedAutomation) continue

          // Check duplicate
          const { data: existingLog } = await supabase
            .from('dm_logs')
            .select('id')
            .eq('automation_id', matchedAutomation.id)
            .eq('post_id', value.media?.id)
            .eq('commenter_platform_id', value.from?.id)
            .eq('status', 'sent')
            .single()

          if (existingLog) continue

          // Queue DM job
          await dmQueue.add('send-dm', {
            automationId: matchedAutomation.id,
            userId: account.user_id,
            accountId: account.id,
            platform: 'instagram',
            postId: value.media?.id,
            commentId: value.id,
            commenterPlatformId: value.from?.id,
            commenterUsername: value.from?.username,
            keywordMatched: matchedKeyword,
            dmMessage: matchedAutomation.dm_message,
            sendDelaySeconds: matchedAutomation.send_delay_seconds || 0,
          }, {
            delay: (matchedAutomation.send_delay_seconds || 0) * 1000,
            attempts: 3,
            backoff: { type: 'exponential', delay: 5000 },
          })

          // Log as queued
          await supabase.from('dm_logs').insert({
            automation_id: matchedAutomation.id,
            user_id: account.user_id,
            account_id: account.id,
            platform: 'instagram',
            post_id: value.media?.id,
            commenter_platform_id: value.from?.id,
            commenter_username: value.from?.username,
            keyword_matched: matchedKeyword,
            dm_message_sent: matchedAutomation.dm_message,
            status: 'queued',
          })
        }
      }
    }
  }

  // Process Facebook Page events
  if (payload.object === 'page') {
    for (const entry of payload.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field === 'feed' && change.value?.item === 'comment') {
          const pageId = entry.id
          const { data: account } = await supabase
            .from('connected_accounts')
            .select('*, users!inner(id, plan, dms_used_this_month)')
            .eq('platform_account_id', pageId)
            .eq('is_active', true)
            .single()

          if (!account) continue

          const { data: automations } = await supabase
            .from('automations')
            .select('*')
            .eq('account_id', account.id)
            .eq('is_active', true)
            .eq('platform', 'facebook')

          let matchedAutomation = null
          let matchedKeyword: string | null = null

          for (const auto of automations || []) {
            if (auto.trigger_type === 'any_comment') {
              matchedAutomation = auto
              break
            }
            if (auto.trigger_type === 'comment_keyword') {
              const keywords: string[] = auto.keywords || []
              const commentText = (change.value.message || '').toLowerCase().trim()
              const found = keywords.find(kw => commentText.includes(kw.toLowerCase()))
              if (found) {
                matchedAutomation = auto
                matchedKeyword = found
                break
              }
            }
          }

          if (!matchedAutomation) continue

          // Check duplicate
          const { data: existingLog } = await supabase
            .from('dm_logs')
            .select('id')
            .eq('automation_id', matchedAutomation.id)
            .eq('post_id', change.value.post_id)
            .eq('commenter_platform_id', change.value.from?.id)
            .eq('status', 'sent')
            .single()

          if (existingLog) continue

          await dmQueue.add('send-dm', {
            automationId: matchedAutomation.id,
            userId: account.user_id,
            accountId: account.id,
            platform: 'facebook',
            postId: change.value.post_id,
            commentId: change.value.comment_id,
            commenterPlatformId: change.value.from?.id,
            commenterUsername: change.value.from?.name,
            keywordMatched: matchedKeyword,
            dmMessage: matchedAutomation.dm_message,
            sendDelaySeconds: matchedAutomation.send_delay_seconds || 0,
          }, {
            delay: (matchedAutomation.send_delay_seconds || 0) * 1000,
            attempts: 3,
            backoff: { type: 'exponential', delay: 5000 },
          })

          await supabase.from('dm_logs').insert({
            automation_id: matchedAutomation.id,
            user_id: account.user_id,
            account_id: account.id,
            platform: 'facebook',
            post_id: change.value.post_id,
            commenter_platform_id: change.value.from?.id,
            commenter_username: change.value.from?.name,
            keyword_matched: matchedKeyword,
            dm_message_sent: matchedAutomation.dm_message,
            status: 'queued',
          })
        }
      }
    }
  }

  await redis.quit()
  return new NextResponse('OK', { status: 200 })
}
