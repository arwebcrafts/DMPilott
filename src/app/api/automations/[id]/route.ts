import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// PATCH /api/automations/[id] - update automation
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  // Map camelCase client fields to snake_case database columns
  const updates: Record<string, unknown> = {}
  if (body.accountId !== undefined) updates.account_id = body.accountId
  if (body.name !== undefined) updates.name = body.name
  if (body.platform !== undefined) updates.platform = body.platform
  if (body.triggerType !== undefined) updates.trigger_type = body.triggerType
  if (body.keywords !== undefined) updates.keywords = body.keywords
  if (body.dmMessage !== undefined) updates.dm_message = body.dmMessage
  if (body.followFacebookUrl !== undefined) updates.follow_facebook_url = body.followFacebookUrl || null
  if (body.followInstagramUrl !== undefined) updates.follow_instagram_url = body.followInstagramUrl || null
  if (body.commentReplyEnabled !== undefined) updates.comment_reply_enabled = body.commentReplyEnabled
  if (body.commentReplyText !== undefined) updates.comment_reply_text = body.commentReplyText
  if (body.sendDelaySeconds !== undefined) updates.send_delay_seconds = body.sendDelaySeconds
  if (body.is_active !== undefined) updates.is_active = body.is_active
  // Also support direct snake_case fields (for toggle endpoint compatibility)
  if (body.dm_message !== undefined) updates.dm_message = body.dm_message
  if (body.trigger_type !== undefined) updates.trigger_type = body.trigger_type
  if (body.account_id !== undefined) updates.account_id = body.account_id

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  const { data: automation, error } = await supabase
    .from('automations')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!automation) {
    return NextResponse.json({ error: 'Automation not found' }, { status: 404 })
  }

  return NextResponse.json({ automation })
}

// PUT /api/automations/[id] - update automation (backwards compat)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return PATCH(request, { params })
}

// DELETE /api/automations/[id] - delete automation
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await supabase
    .from('automations')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
