import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createServiceClient } from '@/lib/supabase/server'
import { decryptToken } from '@/lib/encryption'
import axios from 'axios'
import { processQueuedInstagramDmsForAccount, sendInstagramDm, sendFacebookDm } from '@/lib/instagramDmQueue'
import { handleFollowButton, handleLikeStatusCheck } from '@/lib/messenger/handlers/postbackHandler'
import { getUserInteraction } from '@/lib/db/userInteractions'
import { getPageConfiguration } from '@/lib/db/pageConfigurations'

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

  // Fetch sender username for personalization
  let senderUsername = null
  try {
    const token = decryptToken(account.access_token_encrypted)
    const senderInfoRes = await axios.get(`https://graph.instagram.com/${senderId}`, {
      params: { fields: 'username', access_token: token },
      timeout: 5000,
    })
    senderUsername = senderInfoRes.data?.username
    console.log('[Message] Sender username:', senderUsername)
  } catch (err: any) {
    console.log('[Message] Could not fetch sender username:', err?.response?.data?.error?.message || err?.message)
  }

  // Personalize message with variables
  let autoReply = (automation.dm_message || "Thanks for your message! We'll get back to you soon. 👋")
    .replace(/{name}/g, senderUsername || 'there')
    .replace(/{username}/g, senderUsername ? `@${senderUsername}` : 'user')

  // Append follow links if configured
  if (automation.follow_facebook_url || automation.follow_instagram_url) {
    autoReply += '\n\n'
    if (automation.follow_facebook_url) {
      autoReply += `👉 Follow us on Facebook: ${automation.follow_facebook_url}\n`
    }
    if (automation.follow_instagram_url) {
      autoReply += `👉 Follow us on Instagram: ${automation.follow_instagram_url}`
    }
  }

  // Send auto-reply
  await sendInstagramDm({
    account,
    recipientId: senderId,
    message: autoReply,
  })

  // Increment DM counter
  await supabase
    .from('automations')
    .update({ total_dms_sent: automation.total_dms_sent + 1 })
    .eq('id', automation.id)

  console.log('[Message] ✓ DM counter incremented for automation:', automation.name)
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

  // === DIAGNOSTIC LOGGING (when 0 found but UI shows automation) ===
  if (!automations || automations.length === 0) {
    console.log('[Comment][DIAG] Running diagnostic queries for account_id:', account.id)

    // 1. All automations for this exact account_id (ignore is_active + platform)
    const { data: allForAccountId } = await supabase
      .from('automations')
      .select('id, name, platform, is_active, trigger_type, account_id, user_id, created_at')
      .eq('account_id', account.id)
    console.log('[Comment][DIAG] All rows with this account_id (no filters):', JSON.stringify(allForAccountId))

    // 2. All active automations for this account_id (ignore platform filter)
    const { data: activeForAccount } = await supabase
      .from('automations')
      .select('id, name, platform, is_active, trigger_type, account_id')
      .eq('account_id', account.id)
      .eq('is_active', true)
    console.log('[Comment][DIAG] Active rows for this account_id (no platform filter):', JSON.stringify(activeForAccount))

    // 3. All automations for the same user (to see what account_ids they actually point to)
    const { data: allUserAutos } = await supabase
      .from('automations')
      .select('id, name, platform, is_active, trigger_type, account_id')
      .eq('user_id', account.user_id)
      .order('created_at', { ascending: false })
      .limit(20)
    console.log('[Comment][DIAG] Recent automations for user (showing their account_id values):', JSON.stringify(allUserAutos))

    // 4. All connected_accounts rows for this IG numeric id (to detect duplicates / stale rows)
    const { data: allAccountRows } = await supabase
      .from('connected_accounts')
      .select('id, platform_account_id, username, is_active, platform, created_at')
      .eq('platform_account_id', igAccountId)
    console.log('[Comment][DIAG] All connected_accounts rows for IG id ' + igAccountId + ':', JSON.stringify(allAccountRows))
  }
  // === END DIAGNOSTIC ===

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

  // Instagram exposes two IDs for the same account:
  //   - platform_account_id: app-scoped ID returned by OAuth /me
  //   - ig_business_account_id: IG Business Account ID sent in webhook entry.id
  // Webhooks arrive keyed by the IG Business Account ID, so match either column.
  const { data: account, error } = await supabase
    .from('connected_accounts')
    .select('*')
    .or(`platform_account_id.eq.${igAccountId},ig_business_account_id.eq.${igAccountId}`)
    .eq('is_active', true)
    .eq('platform', 'instagram')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.log('[Account] Query error:', error.message)
  }

  if (account) {
    console.log('[Account] Found account:', account.username, 'created:', account.created_at)
    return account
  }

  // Self-healing fallback: the webhook ID was not stored yet for any account.
  // Resolve it by asking the Instagram API for each active account's IDs, then
  // persist the mapping so future lookups are instant.
  console.log('[Account] No direct match. Attempting self-healing resolution via IG API...')
  const resolved = await resolveAndLinkIgAccount(igAccountId, supabase)
  if (resolved) {
    console.log('[Account] ✓ Self-healing resolved account:', resolved.username)
    return resolved
  }

  console.log('[Account] No matching account found')
  return null
}

// Query the Instagram API for each active IG account to discover which one owns
// the given webhook account ID, then persist ig_business_account_id for fast
// future lookups. This is account-agnostic and works for any user in the app.
async function resolveAndLinkIgAccount(igAccountId: string, supabase: any) {
  const { data: candidates } = await supabase
    .from('connected_accounts')
    .select('*')
    .eq('is_active', true)
    .eq('platform', 'instagram')

  console.log('[Account][Resolve] Active IG accounts to check:', candidates?.length || 0)

  for (const candidate of candidates || []) {
    let token: string
    try {
      token = decryptToken(candidate.access_token_encrypted)
    } catch (e: any) {
      console.log('[Account][Resolve] Failed to decrypt token for', candidate.username, e.message)
      continue
    }

    try {
      const res = await axios.get('https://graph.instagram.com/me', {
        params: { fields: 'id,user_id,username', access_token: token },
        timeout: 5000,
      })
      const ids = [res.data?.id, res.data?.user_id]
        .filter(Boolean)
        .map((v: any) => String(v))
      console.log('[Account][Resolve] @' + candidate.username, 'API ids:', JSON.stringify(ids))

      if (ids.includes(String(igAccountId))) {
        console.log('[Account][Resolve] ✓ Match found for @' + candidate.username + '. Linking ig_business_account_id.')
        await supabase
          .from('connected_accounts')
          .update({ ig_business_account_id: igAccountId })
          .eq('id', candidate.id)
        return { ...candidate, ig_business_account_id: igAccountId }
      }
    } catch (err: any) {
      console.log('[Account][Resolve] IG API lookup failed for @' + candidate.username + ':',
        err?.response?.data?.error?.message || err.message)
    }
  }

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
    .replace(/{username}/g, commenterName || 'there')

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
  // Handle postback events (button clicks)
  if (messaging.postback) {
    const payload = messaging.postback.payload
    const senderId = messaging.sender?.id
    console.log('[Facebook Postback] Payload:', payload, 'From:', senderId)
    
    if (payload === 'CHECK_LIKE_STATUS') {
      try {
        console.log('[Facebook Postback] Calling handleLikeStatusCheck for:', senderId)
        await handleLikeStatusCheck(senderId)
        console.log('[Facebook Postback] handleLikeStatusCheck completed')
      } catch (error) {
        console.error('[Facebook Postback] Error in handleLikeStatusCheck:', error)
      }
    }
    return
  }

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

  // Fetch sender name for personalization
  let senderName = null
  try {
    const token = decryptToken(account.access_token_encrypted)
    const senderInfoRes = await axios.get(`https://graph.facebook.com/v19.0/${senderId}`, {
      params: { fields: 'first_name,last_name,name', access_token: token },
      timeout: 5000,
    })
    senderName = senderInfoRes.data?.name || senderInfoRes.data?.first_name
    console.log('[Facebook Message] Sender name:', senderName)
  } catch (err: any) {
    console.log('[Facebook Message] Could not fetch sender name:', err?.response?.data?.error?.message || err?.message)
    // Fallback: Use senderId if name fetch fails
    senderName = `User ${senderId?.substring(0, 8)}`
    console.log('[Facebook Message] Using fallback name:', senderName)
  }

  // Personalize message with variables
  let autoReply = (automation.dm_message || "Thanks for your message! We'll get back to you soon. 👋")
    .replace(/{name}/g, senderName || 'there')
    .replace(/{username}/g, senderName || 'there')

  // Append follow links if configured
  if (automation.follow_facebook_url || automation.follow_instagram_url) {
    autoReply += '\n\n'
    if (automation.follow_facebook_url) {
      autoReply += `👉 Follow us on Facebook: ${automation.follow_facebook_url}\n`
    }
    if (automation.follow_instagram_url) {
      autoReply += `👉 Follow us on Instagram: ${automation.follow_instagram_url}`
    }
  }

  // Send auto-reply
  await sendFacebookDm({
    account,
    recipientId: senderId,
    message: autoReply,
  })

  // Check if user has already interacted with follow button
  console.log('[Follow Button] Checking page configuration...')
  const pageConfig = await getPageConfiguration()
  console.log('[Follow Button] Page config found:', !!pageConfig)
  if (pageConfig) {
    console.log('[Follow Button] Page config ID:', pageConfig.id)
    console.log('[Follow Button] Checking user interaction for sender:', senderId)
    const existingInteraction = await getUserInteraction(senderId, pageConfig.id)
    console.log('[Follow Button] Existing interaction found:', !!existingInteraction)
    
    // Only send follow button if user hasn't interacted yet
    if (!existingInteraction) {
      console.log('[Follow Button] Sending follow button to new user:', senderId)
      try {
        await handleFollowButton(senderId)
        console.log('[Follow Button] Follow button sent successfully')
      } catch (err: any) {
        console.log('[Follow Button] Error sending follow button:', err.message)
      }
    } else {
      console.log('[Follow Button] User already interacted, skipping follow button:', senderId)
    }
  } else {
    console.log('[Follow Button] No page configuration found')
  }
}
