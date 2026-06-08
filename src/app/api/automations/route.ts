import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
    dmVideoUrl,
    commentReplyEnabled,
    commentReplyText,
    sendDelaySeconds,
  } = body

  console.log('[Automation] Request body:', {
    accountId,
    name,
    platform,
    triggerType,
    keywords,
    dmMessage: dmMessage?.substring(0, 50) + '...',
    dmVideoUrl,
    commentReplyEnabled,
    sendDelaySeconds,
  })

  // Validate required fields
  if (!accountId || !platform || !triggerType || !dmMessage) {
    console.log('[Automation] ❌ Missing required fields')
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const validTriggerTypes = ['any_comment', 'comment_keyword', 'dm_received', 'story_mention']
  if (!validTriggerTypes.includes(triggerType)) {
    console.log('[Automation] ❌ Invalid trigger type:', triggerType)
    return NextResponse.json({ error: 'Invalid trigger type' }, { status: 400 })
  }

  if (triggerType === 'comment_keyword' && (!keywords || keywords.length === 0)) {
    console.log('[Automation] ❌ No keywords provided for keyword trigger')
    return NextResponse.json({ error: 'At least one keyword is required' }, { status: 400 })
  }

  const normalizedVideoUrl =
    typeof dmVideoUrl === 'string' && dmVideoUrl.trim().length > 0 ? dmVideoUrl.trim() : null

  if (normalizedVideoUrl && !/^https?:\/\//i.test(normalizedVideoUrl)) {
    console.log('[Automation] ❌ Invalid video URL format')
    return NextResponse.json({ error: 'DM video URL must start with http:// or https://' }, { status: 400 })
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
      dm_video_url: normalizedVideoUrl,
      comment_reply_enabled: commentReplyEnabled || false,
      comment_reply_text: commentReplyText,
      send_delay_seconds: sendDelaySeconds || 0,
    })
    .select()
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
