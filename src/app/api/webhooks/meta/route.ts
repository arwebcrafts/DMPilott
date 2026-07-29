import { NextResponse, after } from 'next/server'
import crypto from 'crypto'
import { createServiceClient } from '@/lib/supabase/server'
import { decryptToken } from '@/lib/encryption'
import axios from 'axios'
import { processQueuedInstagramDmsForAccount, sendInstagramDm, sendFacebookDm } from '@/lib/instagramDmQueue'
import { handleFollowButton, handleLikeStatusCheck, handleInstagramFollowButton, handleInstagramFollowStatusCheck } from '@/lib/messenger/handlers/postbackHandler'
import { getUserInteraction } from '@/lib/db/userInteractions'
import { getPageConfiguration, getInstagramGiftOffer, getInstagramUserInteraction, updateInstagramUserInteraction } from '@/lib/db/pageConfigurations'
import { generateAiReply } from '@/lib/ai/generateReply'
import { getUserPlanUsage, incrementDmUsage } from '@/lib/planUsage'
import { canUseAI } from '@/lib/planGating'
import { getAutomationMessages } from '@/lib/automations/flow'
import { recordWebhookEvent } from '@/lib/webhookDiagnostics'

console.log('[INIT] Webhook route module loaded')

// Give background processing (after()) headroom to finish sends/AI calls.
// Capped to the platform limit on lower Vercel plans.
export const maxDuration = 60

// Verify Meta webhook signature. The HMAC must be computed over the exact raw
// request bytes — re-serialising the parsed JSON produces different bytes and
// would never match.
function matchesSecret(rawBody: string, signature: string, secret: string): boolean {
  const expected = `sha256=${crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex')}`
  const expectedBuf = Buffer.from(expected)
  const receivedBuf = Buffer.from(signature)
  if (expectedBuf.length !== receivedBuf.length) return false
  return crypto.timingSafeEqual(expectedBuf, receivedBuf)
}

/**
 * Verifies Meta's x-hub-signature-256.
 *
 * A Meta app can sign with either the Meta app secret or the Instagram app
 * secret depending on which product sent the event (Instagram Login for
 * Business signs with the Instagram secret). Checking only one silently
 * rejects every delivery and no DM is ever sent, so try each configured
 * secret and report precisely which situation we are in.
 */
function verifySignature(
  rawBody: string,
  signature: string
): { ok: boolean; reason: string } {
  const secrets: Array<[string, string | undefined]> = [
    ['META_APP_SECRET', process.env.META_APP_SECRET],
    ['INSTAGRAM_APP_SECRET', process.env.INSTAGRAM_APP_SECRET],
  ]
  const configured = secrets.filter(([, v]) => Boolean(v)) as Array<[string, string]>

  if (configured.length === 0) {
    return { ok: false, reason: 'no_app_secret_configured' }
  }
  if (!signature) {
    return { ok: false, reason: 'missing_signature_header' }
  }

  for (const [name, secret] of configured) {
    if (matchesSecret(rawBody, signature, secret)) {
      console.log('[SIG] ✓ Signature verified using', name)
      return { ok: true, reason: name }
    }
  }

  console.error(
    '[SIG] ✗ Signature did not match any configured secret. Checked:',
    configured.map(([n]) => n).join(', '),
    '— the app secret in your environment does not match the app that sent this webhook.'
  )
  return { ok: false, reason: 'signature_mismatch' }
}

// Postgres unique-violation. Raised by idx_dm_logs_comment_id_unique when two
// concurrent webhook deliveries race to claim the same comment or message id.
function isUniqueViolation(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false
  return error.code === '23505' || /duplicate key value/i.test(error.message || '')
}

/**
 * Second line of defence behind the unique index on dm_logs(comment_id).
 *
 * If `idx_dm_logs_comment_id_unique` has not been applied to this database
 * (see migration 015), concurrent webhook deliveries all insert successfully
 * and each one sends a DM. After inserting, re-read every row for this key and
 * only let the oldest one proceed; the losers mark themselves skipped.
 *
 * Returns true when this invocation owns the send.
 */
async function claimDmLogRow(
  supabase: any,
  insertedId: string,
  dedupKey: string,
  logPrefix: string
): Promise<boolean> {
  const { data: rows, error } = await supabase
    .from('dm_logs')
    .select('id, created_at')
    .eq('comment_id', dedupKey)
    .order('created_at', { ascending: true })
    .order('id', { ascending: true })
    .limit(10)

  if (error || !rows || rows.length === 0) {
    // Cannot verify — fall back to proceeding so a transient read error never
    // silently swallows a legitimate reply.
    return true
  }

  if (rows.length === 1 || rows[0].id === insertedId) return true

  console.log(`${logPrefix} Lost dedup race for ${dedupKey} (winner ${rows[0].id}) - not sending`)
  await supabase
    .from('dm_logs')
    .update({ status: 'failed', error_message: 'Duplicate webhook delivery' })
    .eq('id', insertedId)

  return false
}

// Builds the "follow us" footer appended to the last message, or '' if none.
function buildFollowLinks(automation: any): string {
  if (!automation.follow_facebook_url && !automation.follow_instagram_url) return ''
  let out = '\n\n'
  if (automation.follow_facebook_url) out += `👉 Follow us on Facebook: ${automation.follow_facebook_url}\n`
  if (automation.follow_instagram_url) out += `👉 Follow us on Instagram: ${automation.follow_instagram_url}`
  return out
}

// Sends the trailing steps of a multi-step flow in order, spacing them slightly
// so they arrive in sequence, and counting each toward the monthly budget.
async function sendFlowExtraSteps(
  extra: string[],
  send: (message: string) => Promise<any>,
  supabase: any,
  userId: string
) {
  for (const msg of extra) {
    try {
      await new Promise(r => setTimeout(r, 800))
      await send(msg)
      await incrementDmUsage(supabase, userId)
    } catch (err: any) {
      console.log('[Flow] Extra step send failed:', err?.message || err)
      break
    }
  }
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

  // Signature verification can only be skipped outside production, and only
  // when explicitly opted in. Without it, anyone who knows the webhook URL can
  // make the app send DMs from any connected account.
  const skipSignatureEnv = process.env.SKIP_WEBHOOK_SIGNATURE === 'true'

  if (skipSignatureEnv) {
    console.log('[POST] ⚠️ SKIPPING SIGNATURE VERIFICATION (SKIP_WEBHOOK_SIGNATURE=true)')
  } else {
    const sig = verifySignature(rawBody, signature)
    if (!sig.ok) {
      // Record the rejection so it is visible in the dashboard instead of
      // disappearing into the logs as "no DMs are arriving".
      await recordWebhookEvent({
        outcome: 'rejected_signature',
        detail: sig.reason,
        payloadPreview: rawBody.slice(0, 300),
      })
      console.error('[POST] ✗ Rejecting webhook —', sig.reason)
      return new NextResponse(`Invalid signature (${sig.reason})`, { status: 401 })
    }
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

  // Acknowledge Meta immediately, then process after the response is sent.
  // Meta retries aggressively (~15x in 3-4 min) if it doesn't get a fast 200,
  // and will disable a webhook that is repeatedly slow. Processing inline —
  // which can involve an AI call plus several Graph API sends — risks blowing
  // that budget at scale. `after()` runs the work post-response; dedup (the
  // unique index + claimDmLogRow) makes any retry that still slips through safe.
  console.log('[POST] Ack in', Date.now() - startTime, 'ms; processing in background')
  after(async () => {
    try {
      await processWebhookAsync(payload)
      console.log('[POST] ✓ Webhook processed successfully')
    } catch (err: any) {
      console.log('[POST] ❌ Webhook processing error:', err.message)
    }
  })

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

  // Handle postback events (button clicks)
  if (messaging.postback) {
    const payload = messaging.postback.payload
    console.log('[Instagram Postback] Payload:', payload, 'From:', senderId)

    // Handle Instagram visit Instagram button
    if (payload && payload.startsWith('IG_VISIT_INSTAGRAM:')) {
      const accountUsername = payload.replace('IG_VISIT_INSTAGRAM:', '')
      console.log('[Instagram Postback] User clicked Visit Instagram for:', accountUsername)

      // Find the connected account
      const account = await findIgAccount(igAccountId, supabase)
      if (!account) {
        console.log('[Instagram Postback] No matching IG account found for:', igAccountId)
        return
      }

      // Update interaction to mark as visited
      const giftOffer = await getInstagramGiftOffer(accountUsername)
      if (giftOffer) {
        await updateInstagramUserInteraction(senderId, giftOffer.id, {
          interaction_type: 'visited_instagram'
        })
      }

      // Send follow-up message with "I've Followed" button
      try {
        const { sendInstagramButtonMessage } = await import('@/lib/messenger/handlers/postbackHandler')
        await sendInstagramButtonMessage(senderId, accountUsername, account)
        console.log('[Instagram Postback] Sent follow-up message with Follow button')
      } catch (error: any) {
        console.error('[Instagram Postback] Error sending follow-up message:', error)
      }
      return
    }

    // Handle Instagram follow status check
    if (payload && payload.startsWith('IG_CHECK_FOLLOW_STATUS:')) {
      const accountUsername = payload.replace('IG_CHECK_FOLLOW_STATUS:', '')
      console.log('[Instagram Postback] Calling handleInstagramFollowStatusCheck for:', accountUsername)
      try {
        await handleInstagramFollowStatusCheck(senderId, accountUsername)
        console.log('[Instagram Postback] handleInstagramFollowStatusCheck completed')
      } catch (error: any) {
        console.error('[Instagram Postback] Error in handleInstagramFollowStatusCheck:', error)
      }
    }
    return
  }

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

  // ── Story reply / story mention ──────────────────────────────────────────
  // These arrive as messaging events (not comment changes): a story reply is a
  // DM with message.reply_to.story; a story mention is a DM whose attachments
  // include a story_mention. Route them to the story trigger types, which
  // otherwise never fired at all.
  const storyReply = message?.reply_to?.story
  const storyMention = Array.isArray(message?.attachments)
    && message.attachments.some((a: any) => a?.type === 'story_mention')

  if (storyReply || storyMention) {
    const triggerType = storyMention ? 'story_mention' : 'story_reply'
    await handleInstagramStory({
      account, senderId, messageText, messageId: messaging.message?.mid, triggerType, supabase,
    })
    return
  }

  // Check for Instagram gift offer
  console.log('[IG Follow Button] Checking Instagram gift offer for account:', account.username)
  const giftOffer = await getInstagramGiftOffer(account.username)
  console.log('[IG Follow Button] Gift offer found:', !!giftOffer)

  if (giftOffer) {
    console.log('[IG Follow Button] Gift offer ID:', giftOffer.id)
    console.log('[IG Follow Button] Checking user interaction for sender:', senderId)
    const existingInteraction = await getInstagramUserInteraction(senderId, giftOffer.id)
    console.log('[IG Follow Button] Existing interaction found:', !!existingInteraction)

    // Only send follow button if user hasn't interacted yet
    if (!existingInteraction) {
      console.log('[IG Follow Button] Sending follow button to new user:', senderId)
      try {
        await handleInstagramFollowButton(senderId, account.username, account)
        console.log('[IG Follow Button] Follow button sent successfully')
      } catch (err: any) {
        console.log('[IG Follow Button] Error sending follow button:', err.message)
      }
    } else {
      console.log('[IG Follow Button] User already interacted, skipping follow button:', senderId)
    }
  } else {
    console.log('[IG Follow Button] No Instagram gift offer found for account:', account.username)
  }

  // ── Dedup Step 1: In-memory fast path (helps within same warm instance) ──
  // NOTE: On Vercel serverless this Set resets on cold start, so it's only
  // a fast-path optimisation. The real guard is the DB check below.
  const messageId = messaging.message?.mid
  if (!messageId) {
    // No message ID means we can't reliably dedup — Meta should always provide `mid`.
    // Without it, skip processing entirely to be safe.
    console.log('[Message] ⚠️ No message mid found — skipping to prevent duplicates')
    return
  }
  const dmDedupKey = `dm_ig_${messageId}`
  if (isProcessed(dmDedupKey)) {
    console.log('[Message] Already processed this DM event (in-memory dedup) - skipping')
    return
  }
  markProcessed(dmDedupKey)

  // ── Dedup Step 2: Database-level check using message mid ──
  // Check if we already have a dm_log entry for this exact message mid
  const { data: existingMidLog } = await supabase
    .from('dm_logs')
    .select('id')
    .eq('comment_id', `mid:${messageId}`)
    .limit(1)
    .maybeSingle()

  if (existingMidLog) {
    console.log('[Message] Already processed message mid:', messageId, '- skipping (DB dedup)')
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

  // ── Dedup Step 3: Cooldown — don't reply to same sender within 5 minutes ──
  // Meta aggressively retries webhook delivery (up to ~15 times in 3-4 minutes).
  // A 5-minute cooldown covers the entire retry window.
  const cooldownSeconds = 300
  const { data: recentReply } = await supabase
    .from('dm_logs')
    .select('id')
    .eq('automation_id', automation.id)
    .eq('commenter_platform_id', senderId)
    .eq('platform', 'instagram')
    .gte('created_at', new Date(Date.now() - cooldownSeconds * 1000).toISOString())
    .limit(1)
    .maybeSingle()

  if (recentReply) {
    console.log('[Message] Already replied to sender', senderId, 'within', cooldownSeconds, 's cooldown - skipping duplicate')
    return
  }

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

  // Monthly plan limit — stop replying once the subscription budget is spent.
  const igPlan = await getUserPlanUsage(supabase, account.user_id)
  if (igPlan && igPlan.remaining <= 0) {
    console.log('[Message] Monthly DM limit reached for plan:', igPlan.plan, '- skipping auto-reply')
    return
  }

  // Resolve the reply. Precedence: AI (handles the whole conversation) → a
  // multi-step flow → the single dm_message. flowExtra holds steps 2..N.
  const useAi = automation.ai_replies_enabled && igPlan && canUseAI(igPlan.plan)
  const igMessages = useAi
    ? [await generateAiReply({
        instruction: automation.dm_message || '',
        incomingText: messageText || '',
        senderName: senderUsername,
        fallback: (automation.dm_message || "Thanks for your message! We'll get back to you soon. 👋"),
      })]
    : getAutomationMessages(automation, senderUsername, senderUsername)
  let autoReply = igMessages[0]
  const igFlowExtra = igMessages.slice(1)

  // Append follow links to the LAST message of the sequence.
  const igFollowLinks = buildFollowLinks(automation)
  if (igFollowLinks) {
    if (igFlowExtra.length > 0) igFlowExtra[igFlowExtra.length - 1] += igFollowLinks
    else autoReply += igFollowLinks
  }

  // Log to dm_logs BEFORE sending to ensure dedup works even if send is slow.
  // Insert as 'pending' so processQueuedInstagramDmsForAccount doesn't pick it up!
  const { data: insertedLog, error: logError } = await supabase.from('dm_logs').insert({
    automation_id: automation.id,
    user_id: account.user_id,
    account_id: account.id,
    platform: 'instagram',
    commenter_platform_id: senderId,
    commenter_username: senderUsername,
    dm_message_sent: autoReply,
    comment_id: `mid:${messageId}`,
    status: 'pending',
  }).select('id').single()

  if (logError) {
    // 23505 = unique violation on idx_dm_logs_comment_id_unique. That means a
    // concurrent invocation already claimed this message id, so this one must
    // not send. Any other error is a real problem and must be visible.
    if (isUniqueViolation(logError)) {
      console.log('[Message] Duplicate webhook delivery for mid', messageId, '- another invocation is handling it')
    } else {
      console.error('[Message] ❌ Failed to log DM, aborting send:', logError.code, logError.message)
    }
    return
  }

  if (insertedLog && !(await claimDmLogRow(supabase, insertedLog.id, `mid:${messageId}`, '[Message]'))) {
    return
  }

  try {
    // Send auto-reply
    await sendInstagramDm({
      account,
      recipientId: senderId,
      message: autoReply,
      button: automation.button_text && automation.button_url
        ? { text: automation.button_text, url: automation.button_url }
        : null,
    })

    // Mark as sent in dm_logs so queue processor never resends
    await supabase
      .from('dm_logs')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('id', insertedLog.id)

    // Count against the user's monthly plan budget
    await incrementDmUsage(supabase, account.user_id)

    // Send any additional flow steps in order.
    await sendFlowExtraSteps(igFlowExtra, msg => sendInstagramDm({ account, recipientId: senderId, message: msg }), supabase, account.user_id)

    // Increment DM counter
    await supabase
      .from('automations')
      .update({ total_dms_sent: (automation.total_dms_sent || 0) + 1 })
      .eq('id', automation.id)

    console.log('[Message] ✓ DM sent and logged as sent for automation:', automation.name)
  } catch (sendErr: any) {
    console.log('[Message] ❌ Error sending DM:', sendErr?.message || sendErr)
    await supabase
      .from('dm_logs')
      .update({ status: 'failed', error_message: sendErr?.message || 'Send failed' })
      .eq('id', insertedLog.id)
  }
}

// Handles a story reply or story mention: matches an automation of the given
// story trigger type for this account and sends its DM. Mirrors the dm_received
// path (dedup by message id, monthly-limit check, usage increment).
async function handleInstagramStory(params: {
  account: any
  senderId: string
  messageText: string | undefined
  messageId: string | undefined
  triggerType: 'story_reply' | 'story_mention'
  supabase: any
}) {
  const { account, senderId, messageText, messageId, triggerType, supabase } = params
  console.log(`[Story] ${triggerType} from`, senderId, 'on account', account.username)

  if (!messageId) {
    console.log('[Story] No message mid — skipping to prevent duplicates')
    return
  }

  const dedupKey = `mid:${messageId}`

  const { data: automations } = await supabase
    .from('automations')
    .select('*')
    .eq('account_id', account.id)
    .eq('is_active', true)
    .eq('trigger_type', triggerType)

  if (!automations || automations.length === 0) {
    console.log('[Story] No', triggerType, 'automation for this account')
    return
  }
  const automation = automations[0]

  // Monthly plan limit
  const plan = await getUserPlanUsage(supabase, account.user_id)
  if (plan && plan.remaining <= 0) {
    console.log('[Story] Monthly DM limit reached for plan:', plan.plan)
    return
  }

  // Fetch sender username for personalization (best effort)
  let senderUsername: string | null = null
  try {
    const token = decryptToken(account.access_token_encrypted)
    const res = await axios.get(`https://graph.instagram.com/${senderId}`, {
      params: { fields: 'username', access_token: token },
      timeout: 5000,
    })
    senderUsername = res.data?.username || null
  } catch { /* non-fatal */ }

  const baseMessage = (automation.dm_message || 'Thanks for sharing! 🙌')
    .replace(/{name}/g, senderUsername || 'there')
    .replace(/{username}/g, senderUsername ? `@${senderUsername}` : 'user')

  let reply = baseMessage
  if (automation.ai_replies_enabled && plan && canUseAI(plan.plan)) {
    reply = await generateAiReply({
      instruction: automation.dm_message || '',
      incomingText: messageText || `(replied to your story)`,
      senderName: senderUsername,
      fallback: baseMessage,
    })
  }

  // Insert-before-send with the unique index guarding against duplicates.
  const { data: inserted, error: logError } = await supabase.from('dm_logs').insert({
    automation_id: automation.id,
    user_id: account.user_id,
    account_id: account.id,
    platform: 'instagram',
    commenter_platform_id: senderId,
    commenter_username: senderUsername,
    dm_message_sent: reply,
    comment_id: dedupKey,
    status: 'pending',
  }).select('id').single()

  if (logError) {
    if (isUniqueViolation(logError)) {
      console.log('[Story] Duplicate delivery for', dedupKey, '- another invocation handling it')
    } else {
      console.error('[Story] Failed to log DM:', logError.code, logError.message)
    }
    return
  }

  if (inserted && !(await claimDmLogRow(supabase, inserted.id, dedupKey, '[Story]'))) {
    return
  }

  try {
    await sendInstagramDm({
      account, recipientId: senderId, message: reply,
      button: automation.button_text && automation.button_url
        ? { text: automation.button_text, url: automation.button_url }
        : null,
    })
    await supabase.from('dm_logs').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', inserted.id)
    await incrementDmUsage(supabase, account.user_id)
    await supabase.from('automations').update({ total_dms_sent: (automation.total_dms_sent || 0) + 1 }).eq('id', automation.id)
    console.log('[Story] ✓ DM sent for', triggerType)
  } catch (err: any) {
    console.log('[Story] ❌ Send failed:', err?.message || err)
    await supabase.from('dm_logs').update({ status: 'failed', error_message: err?.message || 'Send failed' }).eq('id', inserted.id)
  }
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
    await recordWebhookEvent({
      outcome: 'no_account', eventKind: 'comment', igAccountId,
      detail: `No connected account matches Instagram id ${igAccountId}`,
    })
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

  // A post-specific automation (media_id set) should win over a whole-account
  // one, so evaluate the targeted automations first.
  const candidates = [...(automations || [])].sort((a, b) => {
    const aTargeted = a.media_id ? 0 : 1
    const bTargeted = b.media_id ? 0 : 1
    return aTargeted - bTargeted
  })

  for (const auto of candidates) {
    // Per-video targeting: skip automations bound to a different post.
    // media_id === null means "whole account" and matches every post.
    if (auto.media_id && String(auto.media_id) !== String(mediaId)) {
      continue
    }

    if (auto.trigger_type === 'any_comment') {
      matchedAutomation = auto
      break
    }
    if (auto.trigger_type === 'comment_keyword') {
      const keywords: string[] = auto.keywords || []
      const commentLower = (commentText || '').toLowerCase().trim()
      // Use word-boundary matching to avoid partial matches (e.g. 'INFO' should not match 'information')
      const found = keywords.find(kw => {
        try {
          const escaped = kw.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          return new RegExp(`\\b${escaped}\\b`, 'i').test(commentLower)
        } catch {
          return commentLower === kw.toLowerCase()
        }
      })
      if (found) {
        matchedAutomation = auto
        matchedKeyword = found
        break
      }
    }
  }

  if (!matchedAutomation) {
    console.log('[Comment] No matching automation found')
    await recordWebhookEvent({
      outcome: (automations && automations.length > 0) ? 'no_keyword_match' : 'no_automation',
      eventKind: 'comment', igAccountId,
      accountId: account.id, userId: account.user_id,
      detail: (automations && automations.length > 0)
        ? `Comment "${(commentText || '').slice(0, 80)}" did not match any keyword on ${automations.length} active automation(s)`
        : 'No active automation for this account',
    })
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

  // Database-level dedup: check if this comment was already processed
  const { data: existingDm } = await supabase
    .from('dm_logs')
    .select('id')
    .eq('comment_id', commentId)
    .limit(1)
    .maybeSingle()

  if (existingDm) {
    console.log('[Comment] DM already queued for comment', commentId, '- skipping duplicate')
    return
  }

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
    if (isUniqueViolation(insertError)) {
      console.log('[Comment] Duplicate webhook delivery for comment', commentId, '- already enqueued')
    } else {
      console.error('[Comment] ❌ Failed to enqueue DM:', insertError.code, insertError.message)
    }
    return
  }

  const queueResult = await processQueuedInstagramDmsForAccount(supabase, account.id)
  console.log('[Comment] Queue processor result:', queueResult)
  await recordWebhookEvent({
    outcome: queueResult.processed > 0 ? 'sent' : 'queued',
    eventKind: 'comment', igAccountId,
    accountId: account.id, userId: account.user_id,
    detail: queueResult.processed > 0
      ? `Sent DM to @${commenterUsername || 'user'} (keyword: ${matchedKeyword || 'any comment'})`
      : `Queued for @${commenterUsername || 'user'} — check Meta permissions / rate limit if it stays queued`,
  })
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

  // Skip comments from the Page itself to prevent infinite loops
  if (commenterId === pageId) {
    console.log('[Facebook Comment] Skipping comment from Page itself (bot comment)')
    return
  }

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

  // Post-specific automations take priority over whole-account ones.
  const candidates = [...(automations || [])].sort((a, b) => {
    const aTargeted = a.media_id ? 0 : 1
    const bTargeted = b.media_id ? 0 : 1
    return aTargeted - bTargeted
  })

  for (const auto of candidates) {
    // Per-post targeting: skip automations bound to a different post.
    if (auto.media_id && String(auto.media_id) !== String(postId)) {
      continue
    }

    if (auto.trigger_type === 'any_comment') {
      matchedAutomation = auto
      break
    }
    if (auto.trigger_type === 'comment_keyword') {
      const keywords: string[] = auto.keywords || []
      const commentLower = commentText.toLowerCase().trim()
      // Use word-boundary matching to avoid partial matches
      const found = keywords.find(kw => {
        try {
          const escaped = kw.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          return new RegExp(`\\b${escaped}\\b`, 'i').test(commentLower)
        } catch {
          return commentLower === kw.toLowerCase()
        }
      })
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

  // Database-level dedup: check if this comment was already processed
  const { data: existingFbDm } = await supabase
    .from('dm_logs')
    .select('id')
    .eq('comment_id', commentId)
    .limit(1)
    .maybeSingle()

  if (existingFbDm) {
    console.log('[Facebook Comment] DM already queued for comment', commentId, '- skipping duplicate')
    return
  }

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
    if (isUniqueViolation(insertError)) {
      console.log('[Facebook Comment] Duplicate webhook delivery for comment', commentId, '- already enqueued')
    } else {
      console.error('[Facebook Comment] ❌ Failed to enqueue DM:', insertError.code, insertError.message)
    }
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

  // ── Dedup Step 1: In-memory fast path ──
  const fbMessageId = messaging.message?.mid
  if (!fbMessageId) {
    console.log('[Facebook Message] ⚠️ No message mid found — skipping to prevent duplicates')
    return
  }
  const fbDmDedupKey = `dm_fb_${fbMessageId}`
  if (isProcessed(fbDmDedupKey)) {
    console.log('[Facebook Message] Already processed this DM event (in-memory dedup) - skipping')
    return
  }
  markProcessed(fbDmDedupKey)

  // ── Dedup Step 2: Database-level check using message mid ──
  const { data: existingFbMidLog } = await supabase
    .from('dm_logs')
    .select('id')
    .eq('comment_id', `mid:${fbMessageId}`)
    .limit(1)
    .maybeSingle()

  if (existingFbMidLog) {
    console.log('[Facebook Message] Already processed message mid:', fbMessageId, '- skipping (DB dedup)')
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

  // ── Dedup Step 3: Cooldown — don't reply to same sender within 5 minutes ──
  const fbCooldownSeconds = 300
  const { data: recentFbReply } = await supabase
    .from('dm_logs')
    .select('id')
    .eq('automation_id', automation.id)
    .eq('commenter_platform_id', senderId)
    .eq('platform', 'facebook')
    .gte('created_at', new Date(Date.now() - fbCooldownSeconds * 1000).toISOString())
    .limit(1)
    .maybeSingle()

  if (recentFbReply) {
    console.log('[Facebook Message] Already replied to sender', senderId, 'within', fbCooldownSeconds, 's cooldown - skipping duplicate')
    return
  }

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

  // Monthly plan limit
  const fbPlan = await getUserPlanUsage(supabase, account.user_id)
  if (fbPlan && fbPlan.remaining <= 0) {
    console.log('[Facebook Message] Monthly DM limit reached for plan:', fbPlan.plan, '- skipping auto-reply')
    return
  }

  // Personalize message with variables
  const fbBaseMessage = (automation.dm_message || "Thanks for your message! We'll get back to you soon. 👋")
    .replace(/{name}/g, senderName || 'there')
    .replace(/{username}/g, senderName || 'there')

  // Resolve reply: AI → flow → single message. fbFlowExtra holds steps 2..N.
  const fbUseAi = automation.ai_replies_enabled && fbPlan && canUseAI(fbPlan.plan)
  const fbMessages = fbUseAi
    ? [await generateAiReply({
        instruction: automation.dm_message || '',
        incomingText: messageText || '',
        senderName,
        fallback: fbBaseMessage,
      })]
    : getAutomationMessages(automation, senderName, senderName)
  let autoReply = fbMessages[0]
  const fbFlowExtra = fbMessages.slice(1)

  // Append follow links to the last message of the sequence.
  const fbFollowLinks = buildFollowLinks(automation)
  if (fbFollowLinks) {
    if (fbFlowExtra.length > 0) fbFlowExtra[fbFlowExtra.length - 1] += fbFollowLinks
    else autoReply += fbFollowLinks
  }

  // Log to dm_logs BEFORE sending to ensure dedup works even if send is slow.
  // Insert as 'pending' so processQueuedInstagramDmsForAccount doesn't pick it up!
  const { data: insertedFbLog, error: fbLogError } = await supabase.from('dm_logs').insert({
    automation_id: automation.id,
    user_id: account.user_id,
    account_id: account.id,
    platform: 'facebook',
    commenter_platform_id: senderId,
    commenter_username: senderName,
    dm_message_sent: autoReply,
    comment_id: `mid:${fbMessageId}`,
    status: 'pending',
  }).select('id').single()

  if (fbLogError) {
    if (isUniqueViolation(fbLogError)) {
      console.log('[Facebook Message] Duplicate webhook delivery for mid', fbMessageId, '- another invocation is handling it')
    } else {
      console.error('[Facebook Message] ❌ Failed to log DM, aborting send:', fbLogError.code, fbLogError.message)
    }
    return
  }

  if (insertedFbLog && !(await claimDmLogRow(supabase, insertedFbLog.id, `mid:${fbMessageId}`, '[Facebook Message]'))) {
    return
  }

  try {
    // Send auto-reply
    const sendResult = await sendFacebookDm({
      account,
      recipientId: senderId,
      message: autoReply,
    })

    if (sendResult.success) {
      await supabase
        .from('dm_logs')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', insertedFbLog.id)

      // Count against the user's monthly plan budget
      await incrementDmUsage(supabase, account.user_id)

      // Send any additional flow steps in order.
      await sendFlowExtraSteps(
        fbFlowExtra,
        async msg => { await sendFacebookDm({ account, recipientId: senderId, message: msg }) },
        supabase,
        account.user_id
      )

      // Increment DM counter
      await supabase
        .from('automations')
        .update({ total_dms_sent: (automation.total_dms_sent || 0) + 1 })
        .eq('id', automation.id)

      console.log('[Facebook Message] ✓ DM sent and logged as sent for automation:', automation.name)
    } else {
      await supabase
        .from('dm_logs')
        .update({ status: 'failed', error_message: sendResult.error || 'Send failed' })
        .eq('id', insertedFbLog.id)
    }
  } catch (fbSendErr: any) {
    console.log('[Facebook Message] ❌ Error sending DM:', fbSendErr?.message || fbSendErr)
    await supabase
      .from('dm_logs')
      .update({ status: 'failed', error_message: fbSendErr?.message || 'Send failed' })
      .eq('id', insertedFbLog.id)
  }

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
