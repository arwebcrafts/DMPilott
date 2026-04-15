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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const {
    accountId,
    name,
    platform,
    triggerType,
    keywords,
    dmMessage,
    commentReplyEnabled,
    commentReplyText,
    sendDelaySeconds,
  } = body

  // Validate required fields
  if (!accountId || !platform || !triggerType || !dmMessage) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (triggerType === 'comment_keyword' && (!keywords || keywords.length === 0)) {
    return NextResponse.json({ error: 'At least one keyword is required' }, { status: 400 })
  }

  // Check account belongs to user
  const { data: account } = await supabase
    .from('connected_accounts')
    .select('id')
    .eq('id', accountId)
    .eq('user_id', user.id)
    .single()

  if (!account) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 })
  }

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
      comment_reply_enabled: commentReplyEnabled || false,
      comment_reply_text: commentReplyText,
      send_delay_seconds: sendDelaySeconds || 0,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ automation }, { status: 201 })
}
