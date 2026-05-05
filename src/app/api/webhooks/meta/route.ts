import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createServiceClient } from '@/lib/supabase/server'
import { decryptToken } from '@/lib/encryption'
import axios from 'axios'

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
      for (const change of entry.changes || []) {
        if (change.field === 'feed' && change.value?.item === 'comment') {
          await handleFacebookComment(entry.id, change.value, supabase)
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
  const recipientId = messaging.recipient?.id

  console.log('[Message] From:', senderId, 'Text:', message?.text)
  console.log('[Message] is_echo:', message?.is_echo)

  // Skip echo messages (our own sent messages coming back)
  if (message?.is_echo) {
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
  await sendIgMessage(account, senderId, autoReply)
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

  // Check duplicate in database
  const { data: existingLog } = await supabase
    .from('dm_logs')
    .select('id')
    .eq('automation_id', matchedAutomation.id)
    .eq('post_id', mediaId)
    .eq('commenter_platform_id', commenterId)
    .eq('status', 'sent')
    .single()

  if (existingLog) {
    console.log('[Comment] Already sent DM to this commenter - skipping')
    return
  }

  // Send DM - use comment_id for private replies (per Meta docs)
  console.log('[Comment] Sending DM to @' + commenterUsername)
  const personalizedMessage = matchedAutomation.dm_message
    .replace(/{name}/g, commenterUsername || 'there')
    .replace(/{username}/g, '@' + (commenterUsername || 'user'))

  console.log('[Comment] DM message:', personalizedMessage)
  console.log('[Comment] Comment ID for private reply:', commentId)

  try {
    // Use comment_id recipient per Meta Private Replies API docs
    await sendIgMessage(account, commenterId, personalizedMessage, commentId)

    // Log as sent
    await supabase.from('dm_logs').insert({
      automation_id: matchedAutomation.id,
      user_id: account.user_id,
      account_id: account.id,
      platform: 'instagram',
      post_id: mediaId,
      commenter_platform_id: commenterId,
      commenter_username: commenterUsername,
      keyword_matched: matchedKeyword,
      dm_message_sent: personalizedMessage,
      status: 'sent',
      sent_at: new Date().toISOString(),
    })

    console.log('[Comment] ✅ DM sent successfully to @' + commenterUsername)
  } catch (err: any) {
    const errorMsg = err.response?.data?.error?.message || err.message
    console.log('[Comment] ❌ Failed to send DM:', errorMsg)

    await supabase.from('dm_logs').insert({
      automation_id: matchedAutomation.id,
      user_id: account.user_id,
      account_id: account.id,
      platform: 'instagram',
      post_id: mediaId,
      commenter_platform_id: commenterId,
      commenter_username: commenterUsername,
      keyword_matched: matchedKeyword,
      dm_message_sent: personalizedMessage,
      status: 'failed',
      error_message: errorMsg,
    })
  }
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

async function sendIgMessage(account: any, recipientId: string, message: string, commentId?: string) {
  // Use env token if available (for testing), otherwise use account token
  const accessToken = process.env.IG_ACCESS_TOKEN || decryptToken(account.access_token_encrypted)
  const igBusinessAccountId = account.platform_account_id

  // Use env IG_BUSINESS_ACCOUNT_ID if available (for testing)
  const targetAccountId = process.env.IG_BUSINESS_ACCOUNT_ID || igBusinessAccountId

  console.log('[DM] IG_ACCESS_TOKEN env var:', process.env.IG_ACCESS_TOKEN ? 'SET' : 'NOT SET')
  console.log('[DM] account.access_token_encrypted:', account.access_token_encrypted ? 'HAS VALUE' : 'EMPTY')
  console.log('[DM] Using token prefix:', accessToken ? accessToken.substring(0, 20) + '...' : 'EMPTY!')
  console.log('[DM] Target account ID:', targetAccountId)
  console.log('[DM] Recipient ID:', recipientId)
  console.log('[DM] Comment ID:', commentId || 'NONE')
  console.log('[DM] Message:', message)
  
  // Per Meta Private Replies docs: use comment_id for comment-triggered DMs
  let requestBody: any
  if (commentId) {
    console.log('[DM] Using Private Replies API (comment_id)')
    requestBody = { recipient: { comment_id: commentId }, message: { text: message } }
  } else {
    requestBody = { recipient: { id: recipientId }, message: { text: message } }
  }

  const endpoint = `https://graph.instagram.com/v26.0/${targetAccountId}/messages`

  try {
    const response = await axios.post(endpoint, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    })
    
    console.log('[DM] ✓ Response received:', response.status, response.statusText)
    console.log('[DM] Response data:', JSON.stringify(response.data))
    console.log('[DM] === SEND DM SUCCESS ===')
  } catch (err: any) {
    console.log('[DM] ❌ Request failed')
    console.log('[DM] Error message:', err.message)
    console.log('[DM] Error code:', err.code)
    console.log('[DM] Response data:', err.response?.data ? JSON.stringify(err.response.data) : 'none')
    console.log('[DM] Response status:', err.response?.status)
    console.log('[DM] === SEND DM FAILED ===')
    throw err
  }
}

async function handleFacebookComment(pageId: string, value: any, supabase: any) {
  const { data: account } = await supabase
    .from('connected_accounts')
    .select('*, users!inner(id, plan, dms_used_this_month)')
    .eq('platform_account_id', pageId)
    .eq('is_active', true)
    .single()

  if (!account) return

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
      const commentText = (value.message || '').toLowerCase().trim()
      const found = keywords.find(kw => commentText.includes(kw.toLowerCase()))
      if (found) {
        matchedAutomation = auto
        matchedKeyword = found
        break
      }
    }
  }

  if (!matchedAutomation) return

  const { data: existingLog } = await supabase
    .from('dm_logs')
    .select('id')
    .eq('automation_id', matchedAutomation.id)
    .eq('post_id', value.post_id)
    .eq('commenter_platform_id', value.from?.id)
    .eq('status', 'sent')
    .single()

  if (existingLog) return

  try {
    const accessToken = decryptToken(account.access_token_encrypted)
    const personalizedMessage = matchedAutomation.dm_message
      .replace(/{name}/g, value.from?.name || 'there')
      .replace(/{username}/g, '@' + (value.from?.name || 'user'))

    await axios.post(
      `https://graph.facebook.com/v26.0/me/messages`,
      {
        recipient: { id: value.from?.id },
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
      post_id: value.post_id,
      commenter_platform_id: value.from?.id,
      commenter_username: value.from?.name,
      keyword_matched: matchedKeyword,
      dm_message_sent: matchedAutomation.dm_message,
      status: 'sent',
      sent_at: new Date().toISOString(),
    })

    console.log('[Facebook Comment] ✅ DM sent to', value.from?.name)
  } catch (err: any) {
    console.log('[Facebook Comment] ❌ Failed to send DM:', err.response?.data?.error?.message || err.message)
  }
}
