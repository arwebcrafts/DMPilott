import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createServiceClient } from '@/lib/supabase/server'
import { decryptToken } from '@/lib/encryption'
import axios from 'axios'
import { processQueuedInstagramDmsForAccount, sendInstagramDm, sendFacebookDm } from '@/lib/instagramDmQueue'

console.log('[INIT] Webhook route module loaded')

// Verify Meta webhook signature
function verifySignature(body: string, signature: string): boolean {
  console.log('[SIG] verifySignature called')
  const expected = crypto
    .createHmac('sha256', process.env.META_APP_SECRET!)
    .update(body)
    .digest('hex')
  const result = `sha256=${expected}` === signature
  console.log('[SIG] Signature match:', result)
  return result
}

// Track processed comment IDs to prevent duplicates
const processedComments = new Set<string>()
const MAX_PROCESSED = 1000
function markProcessed(id: string) {
  console.log('[DUP] markProcessed:', id)
  if (processedComments.size >= MAX_PROCESSED) {
    console.log('[DUP] Clearing processed set (max reached)')
    processedComments.clear()
  }
  processedComments.add(id)
  console.log('[DUP] Current set size:', processedComments.size)
}
function isProcessed(id: string): boolean {
  const result = processedComments.has(id)
  console.log('[DUP] isProcessed:', id, '=', result)
  return result
}

// GET = webhook verification
export async function GET(request: Request) {
  console.log('[GET] Webhook GET request received')
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  console.log('[GET] mode:', mode)
  console.log('[GET] token present:', !!token)
  console.log('[GET] challenge:', challenge ? challenge.substring(0, 10) + '...' : 'none')
  console.log('[GET] expected token:', process.env.META_WEBHOOK_VERIFY_TOKEN ? 'set' : 'MISSING')

  if (mode === 'subscribe' && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
    console.log('[GET] ✓ Verification SUCCESS')
    return new NextResponse(challenge, { status: 200 })
  }

  console.log('[GET] ✗ Verification FAILED')
  return new NextResponse('Forbidden', { status: 403 })
}

// POST = webhook events
export async function POST(request: Request) {
  console.log('')
  console.log('═══════════════════════════════════════════════════════════')
  console.log('[POST] 🟢 WEBHOOK POST RECEIVED')
  console.log('═══════════════════════════════════════════════════════════')
  
  const startTime = Date.now()

  // Capture raw body
  console.log('[POST] Reading raw body...')
  const rawBody = await request.arrayBuffer().then(buf => Buffer.from(buf).toString('utf8'))
  const signature = request.headers.get('x-hub-signature-256') || ''
  
  console.log('[POST] Signature header:', signature ? signature.substring(0, 20) + '...' : 'MISSING')
  console.log('[POST] Raw body length:', rawBody.length)
  console.log('[POST] Raw body preview:', rawBody.substring(0, 100) + '...')

  // Skip signature verification (dev mode)
  const skipSignatureEnv = process.env.SKIP_WEBHOOK_SIGNATURE === 'true'
  console.log('[POST] Skip signature mode:', skipSignatureEnv)
  if (skipSignatureEnv) {
    console.log('[POST] ⚠️ SKIPPING SIGNATURE VERIFICATION')
  }

  // Parse payload
  let payload
  try {
    payload = JSON.parse(rawBody)
    console.log('[POST] ✓ Payload parsed successfully')
  } catch (err: any) {
    console.log('[POST] ❌ Failed to parse payload:', err.message)
    return new NextResponse('Invalid JSON', { status: 400 })
  }

  console.log('[POST] Payload object type:', payload.object)
  console.log('[POST] Number of entries:', payload.entry?.length || 0)
  
  if (payload.entry) {
    payload.entry.forEach((entry: any, idx: number) => {
      console.log(`[POST] Entry[${idx}]: id=${entry.id}, time=${entry.time}`)
      console.log(`[POST] Entry[${idx}] has messaging:`, !!entry.messaging)
      console.log(`[POST] Entry[${idx}] has changes:`, !!entry.changes)
      if (entry.changes) {
        entry.changes.forEach((change: any, cidx: number) => {
          console.log(`[POST] Change[${cidx}]: field=${change.field}`)
        })
      }
    })
  }

  // Respond after processing (Meta accepts 1-2s response time)
  console.log('[POST] Processing webhook synchronously...')
  const responseTime = Date.now() - startTime
  console.log('[POST] Processing time:', responseTime, 'ms')
  
  try {
    await processWebhookAsync(payload)
    console.log('[POST] ✓ Webhook processed successfully')
  } catch (err: any) {
    console.log('[POST] ❌ Webhook processing error:', err.message)
  }

  return new NextResponse('OK', { status: 200 })
}

async function processWebhookAsync(payload: any) {
  console.log('')
  console.log('[ASYNC] Starting async webhook processing')
  
  const supabase = createServiceClient()
  console.log('[ASYNC] Supabase client created')

  if (payload.object === 'instagram') {
    console.log('[ASYNC] Processing Instagram events')
    
    for (const entry of payload.entry || []) {
      const igAccountId = entry.id
      console.log('[ASYNC] Entry ID:', igAccountId)

      // Handle messaging events
      if (entry.messaging && entry.messaging.length > 0) {
        console.log('[ASYNC] Entry has', entry.messaging.length, 'messaging events')
        for (const messaging of entry.messaging) {
          console.log('[ASYNC] Processing messaging event')
          await handleInstagramMessage(igAccountId, messaging, supabase)
        }
      } else {
        console.log('[ASYNC] No messaging events in this entry')
      }

      // Handle comment changes
      if (entry.changes && entry.changes.length > 0) {
        console.log('[ASYNC] Entry has', entry.changes.length, 'changes')
        for (const change of entry.changes) {
          console.log('[ASYNC] Change field:', change.field)
          if (change.field === 'comments') {
            console.log('[ASYNC] Processing comment event')
            await handleInstagramComment(igAccountId, change.value, supabase)
          } else {
            console.log('[ASYNC] Ignoring change field:', change.field)
          }
        }
      } else {
        console.log('[ASYNC] No changes in this entry')
      }
    }
  } else if (payload.object === 'page') {
    console.log('[ASYNC] Processing Facebook Page events')
    for (const entry of payload.entry || []) {
      const pageId = entry.id
      console.log('[ASYNC] Page ID:', pageId)

      // Handle messaging events
      if (entry.messaging && entry.messaging.length > 0) {
        console.log('[ASYNC] Entry has', entry.messaging.length, 'messaging events')
        for (const messaging of entry.messaging) {
          console.log('[ASYNC] Processing Facebook messaging event')
          await handleFacebookMessage(pageId, messaging, supabase)
        }
      }

      // Handle feed changes (comments)
      for (const change of entry.changes || []) {
        if (change.field === 'feed' && change.value?.item === 'comment') {
          console.log('[ASYNC] Processing Facebook comment event')
          await handleFacebookComment(pageId, change.value, supabase)
        }
      }
    }
  } else {
    console.log('[ASYNC] Unknown object type:', payload.object)
  }
  
  console.log('[ASYNC] ✓ Webhook processing complete')
}

async function handleInstagramMessage(igAccountId: string, messaging: any, supabase: any) {
  const message = messaging.message
  const senderId = messaging.sender?.id

  // Log full messaging structure for debugging
  console.log('[Message] Full messaging object:', JSON.stringify(messaging, null, 2))
  
  // Extract message text - handle different possible structures
  const messageText = message?.text || message?.content?.text || message?.message?.text
  const isEcho = message?.is_echo || message?.content?.is_echo || false

  console.log('[Message] From:', senderId, 'Text:', messageText)
  console.log('[Message] is_echo:', isEcho)

  // Skip echo messages (our own sent messages coming back)
  if (isEcho) {
    console.log('[Message] Skipping echo message - no response needed')
    return
  }

  // Skip if sender is the business account itself
  if (senderId === igAccountId) {
    console.log('[Message] Skipping message from self')
    return
  }

  // Find the connected account
  const account = await findIgAccount(igAccountId, supabase)
  if (!account) {
    console.log('[Message] No matching IG account found for:', igAccountId)
    return
  }

  // Find automations for this account
  const { data: automations } = await supabase
    .from('automations')
    .select('*')
    .eq('account_id', account.id)
    .eq('is_active', true)
    .eq('trigger_type', 'dm_received')

  if (!automations || automations.length === 0) {
    console.log('[Message] No auto-reply automations found for this account')
    return
  }

  const automation = automations[0]
  console.log('[Message] Found auto-reply automation:', automation.name)

  // Send auto-reply
  const autoReply = automation.dm_message || "Thanks for your message! We'll get back to you soon. 👋"
  await sendInstagramDm({
    account,
    recipientId: senderId,
    message: autoReply,
    videoUrl: automation.dm_video_url,
  })
}

async function handleInstagramComment(igAccountId: string, value: any, supabase: any) {
  const commentId = value.id
  const commentText = value.text
  const commenterId = value.from?.id
  const commenterUsername = value.from?.username
  const mediaId = value.media?.id

  console.log('[Comment] New comment event:', { commentId, commenterUsername, commentText, mediaId })

  // Check for duplicate
  if (isProcessed(commentId)) {
    console.log('[Comment] Already processed comment', commentId, '- skipping')
    return
  }
  markProcessed(commentId)

  // Find the connected account
  const account = await findIgAccount(igAccountId, supabase)
  if (!account) {
    console.log('[Comment] ❌ No matching IG account found for:', igAccountId)
    return
  }

  console.log('[Comment] ✓ Found account:', account.username, 'account ID:', account.id)

  // Find matching automations
  console.log('[Comment] Looking for automations for account_id:', account.id)
  const { data: automations } = await supabase
    .from('automations')
    .select('*')
    .eq('account_id', account.id)
    .eq('is_active', true)
    .eq('platform', 'instagram')

  console.log('[Comment] Found automations:', automations?.length || 0)

  let matchedAutomation = null
  let matchedKeyword: string | null = null

  for (const auto of automations || []) {
    if (auto.trigger_type === 'any_comment') {
      matchedAutomation = auto
      break
    }
    if (auto.trigger_type === 'comment_keyword') {
      const keywords: string[] = auto.keywords || []
      const commentLower = (commentText || '').toLowerCase().trim()
      const found = keywords.find(kw => commentLower.includes(kw.toLowerCase()))
      if (found) {
        matchedAutomation = auto
        matchedKeyword = found
        break
      }
    }
  }

  if (!matchedAutomation) {
    console.log('[Comment] No matching automation found')
    return
  }

  console.log('[Comment] Matched automation:', matchedAutomation.name)

  // Queue DM job and let queue processor enforce 200/hour.
  console.log('[Comment] Queueing DM for @' + commenterUsername)
  const personalizedMessage = matchedAutomation.dm_message
    .replace(/{name}/g, commenterUsername || 'there')
    .replace(/{username}/g, '@' + (commenterUsername || 'user'))

  console.log('[Comment] DM message:', personalizedMessage)
  console.log('[Comment] Comment ID for private reply:', commentId)

  const { error: insertError } = await supabase.from('dm_logs').insert({
    automation_id: matchedAutomation.id,
    user_id: account.user_id,
    account_id: account.id,
    platform: 'instagram',
    post_id: mediaId,
    commenter_platform_id: commenterId,
    commenter_username: commenterUsername,
    keyword_matched: matchedKeyword,
    comment_id: commentId,
    dm_message_sent: personalizedMessage,
    status: 'queued',
  })

  if (insertError) {
    console.log('[Comment] ❌ Failed to enqueue DM:', insertError.message)
    return
  }

  const queueResult = await processQueuedInstagramDmsForAccount(supabase, account.id)
  console.log('[Comment] Queue processor result:', queueResult)
}

async function findIgAccount(igAccountId: string, supabase: any) {
  console.log('[Account] Looking for IG account with ID:', igAccountId)
  console.log('[Account] Using Supabase client...')
  
  const { data: account, error } = await supabase
    .from('connected_accounts')
    .select('*')
    .eq('platform_account_id', igAccountId)
    .eq('is_active', true)
    .eq('platform', 'instagram')
    .limit(1)
    .single()
  
  if (error) {
    console.log('[Account] Query error:', error.message)
    return null
  }
  
  if (account) {
    console.log('[Account] Found account:', account.username)
    return account
  }
  
  console.log('[Account] No matching account found')
  return null
}

async function handleFacebookComment(pageId: string, value: any, supabase: any) {
  // Log full value object to debug structure
  console.log('[Facebook Comment] Full value object:', JSON.stringify(value, null, 2))

  const commentId = value.comment_id || value.id
  const commentText = value.message || ''
  const commenterId = value.from?.id
  const commenterName = value.from?.name
  const postId = value.post_id

  console.log('[Facebook Comment] New comment event:', {
    commentId,
    commenterName,
    commentText,
    postId,
  })

  // Check duplicate
  if (isProcessed(commentId)) {
    console.log('[Facebook Comment] Already processed this comment - skipping')
    return
  }
  markProcessed(commentId)

  // Find the connected account
  const { data: account } = await supabase
    .from('connected_accounts')
    .select('*')
    .eq('platform_account_id', pageId)
    .eq('platform', 'facebook')
    .eq('is_active', true)
    .single()

  if (!account) {
    console.log('[Facebook Comment] No matching Facebook account found for:', pageId)
    return
  }

  console.log('[Facebook Comment] ✓ Found account:', account.username, 'account ID:', account.id)

  // Find automations for this account
  const { data: automations } = await supabase
    .from('automations')
    .select('*')
    .eq('account_id', account.id)
    .eq('is_active', true)

  console.log('[Facebook Comment] Found automations:', automations?.length || 0)

  let matchedAutomation = null
  let matchedKeyword: string | null = null

  for (const auto of automations || []) {
    if (auto.trigger_type === 'any_comment') {
      matchedAutomation = auto
      break
    }
    if (auto.trigger_type === 'comment_keyword') {
      const keywords: string[] = auto.keywords || []
      const commentLower = commentText.toLowerCase().trim()
      const found = keywords.find(kw => commentLower.includes(kw.toLowerCase()))
      if (found) {
        matchedAutomation = auto
        matchedKeyword = found
        break
      }
    }
  }

  if (!matchedAutomation) {
    console.log('[Facebook Comment] No matching automation found')
    return
  }

  console.log('[Facebook Comment] Matched automation:', matchedAutomation.name)

  // Queue DM job
  console.log('[Facebook Comment] Queueing DM for', commenterName)
  const personalizedMessage = matchedAutomation.dm_message
    .replace(/{name}/g, commenterName || 'there')
    .replace(/{username}/g, commenterName || 'user')

  console.log('[Facebook Comment] DM message:', personalizedMessage)
  console.log('[Facebook Comment] Comment ID:', commentId)

  const { error: insertError } = await supabase.from('dm_logs').insert({
    automation_id: matchedAutomation.id,
    user_id: account.user_id,
    account_id: account.id,
    platform: 'facebook',
    post_id: postId,
    commenter_platform_id: commenterId,
    commenter_username: commenterName,
    keyword_matched: matchedKeyword,
    comment_id: commentId,
    dm_message_sent: personalizedMessage,
    status: 'queued',
  })

  if (insertError) {
    console.log('[Facebook Comment] ❌ Failed to enqueue DM:', insertError.message)
    return
  }

  const queueResult = await processQueuedInstagramDmsForAccount(supabase, account.id)
  console.log('[Facebook Comment] Queue processor result:', queueResult)
}

async function handleFacebookMessage(pageId: string, messaging: any, supabase: any) {
  const message = messaging.message
  const senderId = messaging.sender?.id

  // Log full messaging structure for debugging
  console.log('[Facebook Message] Full messaging object:', JSON.stringify(messaging, null, 2))

  // Extract message text
  const messageText = message?.text || message?.content?.text || ''
  const isEcho = message?.is_echo || false

  console.log('[Facebook Message] From:', senderId, 'Text:', messageText)
  console.log('[Facebook Message] is_echo:', isEcho)

  // Skip echo messages
  if (isEcho) {
    console.log('[Facebook Message] Skipping echo message - no response needed')
    return
  }

  // Skip if sender is the page itself
  if (senderId === pageId) {
    console.log('[Facebook Message] Skipping message from self')
    return
  }

  // Find the connected account
  const { data: account } = await supabase
    .from('connected_accounts')
    .select('*')
    .eq('platform_account_id', pageId)
    .eq('platform', 'facebook')
    .eq('is_active', true)
    .single()

  if (!account) {
    console.log('[Facebook Message] No matching Facebook account found for:', pageId)
    return
  }

  // Find automations for this account
  const { data: automations } = await supabase
    .from('automations')
    .select('*')
    .eq('account_id', account.id)
    .eq('is_active', true)
    .eq('trigger_type', 'dm_received')

  if (!automations || automations.length === 0) {
    console.log('[Facebook Message] No auto-reply automations found for this account')
    return
  }

  const automation = automations[0]
  console.log('[Facebook Message] Found auto-reply automation:', automation.name)

  // Send auto-reply
  const autoReply = automation.dm_message || "Thanks for your message! We'll get back to you soon. 👋"
  await sendFacebookDm({
    account,
    recipientId: senderId,
    message: autoReply,
    videoUrl: automation.dm_video_url,
  })
}
