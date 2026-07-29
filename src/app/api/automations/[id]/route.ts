import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  mapUpdatableFields,
  VALID_PLATFORMS,
  VALID_TRIGGER_TYPES,
} from '@/lib/automations/updateFields'
import { getAuthenticatedUserPlan } from '@/lib/bio/planChecks'
import { canUseAI, canUsePerPostTargeting } from '@/lib/planGating'

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

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const updates = mapUpdatableFields(body)
  const { plan } = (await getAuthenticatedUserPlan()) || { plan: 'free' as const }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  if (updates.trigger_type !== undefined && !(VALID_TRIGGER_TYPES as readonly string[]).includes(String(updates.trigger_type))) {
    return NextResponse.json({ error: 'Invalid trigger type' }, { status: 400 })
  }

  if (updates.platform !== undefined && !(VALID_PLATFORMS as readonly string[]).includes(String(updates.platform))) {
    return NextResponse.json({ error: 'Invalid platform' }, { status: 400 })
  }

  if (updates.keywords !== undefined) {
    if (!Array.isArray(updates.keywords)) {
      return NextResponse.json({ error: 'Keywords must be an array' }, { status: 400 })
    }
    updates.keywords = (updates.keywords as unknown[])
      .map(kw => String(kw).trim())
      .filter(Boolean)
  }

  if (updates.trigger_type === 'comment_keyword') {
    const keywords = (updates.keywords ?? []) as unknown[]
    if (body.keywords !== undefined && keywords.length === 0) {
      return NextResponse.json({ error: 'At least one keyword is required' }, { status: 400 })
    }
  }

  if (updates.dm_message !== undefined && !String(updates.dm_message).trim()) {
    return NextResponse.json({ error: 'DM message cannot be empty' }, { status: 400 })
  }

  // Plan gating on feature toggles.
  if (updates.ai_replies_enabled === true && !canUseAI(plan)) {
    return NextResponse.json(
      { error: 'AI replies are available on the Pro plan. Upgrade to enable AI.', code: 'plan_limit' },
      { status: 403 }
    )
  }
  if (updates.media_id && !canUsePerPostTargeting(plan)) {
    return NextResponse.json(
      { error: 'Targeting a specific post requires the Creator plan or higher.', code: 'plan_limit' },
      { status: 403 }
    )
  }

  // Never let a user re-point an automation at an account they do not own.
  if (updates.account_id !== undefined) {
    const { data: account } = await supabase
      .from('connected_accounts')
      .select('id')
      .eq('id', updates.account_id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }
  }

  const { data: automation, error } = await supabase
    .from('automations')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select('*, connected_accounts(username, platform)')
    .maybeSingle()

  if (error) {
    console.error('[Automation] Update failed:', error.message)
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
