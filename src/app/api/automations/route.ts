import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAuthenticatedUserPlan } from '@/lib/bio/planChecks'
import { PLAN_LIMITS, canCreateAutomation, canUseAI, canUsePerPostTargeting } from '@/lib/planGating'
import { parseFlowSteps } from '@/lib/automations/flow'

// GET /api/automations - list user's automations
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: automations } = await supabase
    .from('automations')
    .select('*, connected_accounts(username, platform)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return NextResponse.json({ automations })
}

// POST /api/automations - create new automation
export async function POST(request: Request) {
  console.log('[Automation] ===== CREATE AUTOMATION START =====')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    console.log('[Automation] ❌ Unauthorized - no user found')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('[Automation] User ID:', user.id)

  const body = await request.json()
  const {
    accountId,
    name,
    platform,
    triggerType,
    keywords,
    dmMessage,
    followFacebookUrl,
    followInstagramUrl,
    commentReplyEnabled,
    commentReplyText,
    sendDelaySeconds,
    mediaId,
    mediaCaption,
    aiRepliesEnabled,
    flowSteps,
  } = body

  console.log('[Automation] Request body:', {
    accountId,
    name,
    platform,
    triggerType,
    keywords,
    dmMessage: dmMessage?.substring(0, 50) + '...',
    followFacebookUrl,
    followInstagramUrl,
    commentReplyEnabled,
    sendDelaySeconds,
  })

  // Validate required fields
  if (!accountId || !platform || !triggerType || !dmMessage) {
    console.log('[Automation] ❌ Missing required fields')
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const validTriggerTypes = ['any_comment', 'comment_keyword', 'dm_received', 'story_mention', 'story_reply']
  if (!validTriggerTypes.includes(triggerType)) {
    console.log('[Automation] ❌ Invalid trigger type:', triggerType)
    return NextResponse.json({ error: 'Invalid trigger type' }, { status: 400 })
  }

  // ── Plan gating ──────────────────────────────────────────────────────────
  const auth = await getAuthenticatedUserPlan()
  const plan = auth?.plan || 'free'
  const limits = PLAN_LIMITS[plan]

  const { count: automationCount } = await supabase
    .from('automations')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if (!canCreateAutomation(plan, automationCount || 0)) {
    return NextResponse.json(
      {
        error: `Your ${plan} plan allows up to ${limits.maxAutomations} automation${limits.maxAutomations === 1 ? '' : 's'}. Upgrade to add more.`,
        code: 'plan_limit',
      },
      { status: 403 }
    )
  }

  if (aiRepliesEnabled && !canUseAI(plan)) {
    return NextResponse.json(
      { error: 'AI replies are available on the Pro plan. Upgrade to enable AI.', code: 'plan_limit' },
      { status: 403 }
    )
  }

  if (mediaId && !canUsePerPostTargeting(plan)) {
    return NextResponse.json(
      { error: 'Targeting a specific post requires the Creator plan or higher.', code: 'plan_limit' },
      { status: 403 }
    )
  }

  // Multi-step flows are a paid feature (free plan sends a single message).
  const parsedFlow = parseFlowSteps(flowSteps)
  if (parsedFlow.length > 1 && plan === 'free') {
    return NextResponse.json(
      { error: 'Multi-step flows are available on the Creator plan and up. Upgrade to build a flow.', code: 'plan_limit' },
      { status: 403 }
    )
  }

  if (triggerType === 'comment_keyword' && (!keywords || keywords.length === 0)) {
    console.log('[Automation] ❌ No keywords provided for keyword trigger')
    return NextResponse.json({ error: 'At least one keyword is required' }, { status: 400 })
  }

  // Check account belongs to user and get full details
  console.log('[Automation] Fetching account details for account_id:', accountId)
  const { data: account, error: accountError } = await supabase
    .from('connected_accounts')
    .select('*')
    .eq('id', accountId)
    .eq('user_id', user.id)
    .single()

  if (accountError) {
    console.log('[Automation] ❌ Account query error:', accountError.message)
    return NextResponse.json({ error: 'Account not found' }, { status: 404 })
  }

  if (!account) {
    console.log('[Automation] ❌ Account not found for account_id:', accountId)
    return NextResponse.json({ error: 'Account not found' }, { status: 404 })
  }

  console.log('[Automation] ✓ Account found:', {
    id: account.id,
    username: account.username,
    platform: account.platform,
    platform_account_id: account.platform_account_id,
    is_active: account.is_active,
  })

  const { data: automation, error } = await supabase
    .from('automations')
    .insert({
      user_id: user.id,
      account_id: accountId,
      name: name || 'Untitled Automation',
      platform,
      trigger_type: triggerType,
      keywords: keywords || [],
      dm_message: dmMessage,
      follow_facebook_url: followFacebookUrl || null,
      follow_instagram_url: followInstagramUrl || null,
      comment_reply_enabled: commentReplyEnabled || false,
      comment_reply_text: commentReplyText,
      send_delay_seconds: sendDelaySeconds || 0,
      media_id: mediaId || null,
      media_caption: mediaCaption || null,
      ai_replies_enabled: aiRepliesEnabled || false,
      flow_steps: parsedFlow.length > 0 ? parsedFlow : null,
    })
    .select('*, connected_accounts(username, platform)')
    .single()

  if (error) {
    console.log('[Automation] ❌ Failed to create automation:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  console.log('[Automation] ✓ Automation created successfully:', {
    id: automation.id,
    name: automation.name,
    account_id: automation.account_id,
    platform: automation.platform,
    trigger_type: automation.trigger_type,
  })
  console.log('[Automation] ===== CREATE AUTOMATION END =====')

  return NextResponse.json({ automation }, { status: 201 })
}
