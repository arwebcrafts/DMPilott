import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import axios from 'axios'

// DELETE /api/accounts/[id] - disconnect account
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const serviceClient = createServiceClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: account } = await supabase
    .from('connected_accounts')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!account) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 })
  }

  try {
    const { decryptToken } = await import('@/lib/encryption')
    const accessToken = decryptToken(account.access_token_encrypted)

    await axios.post(
      `https://graph.facebook.com/v21.0/${account.platform_account_id}/subscribed_apps`,
      { subscribed_fields: 'comments,mentions,messaging,feed' },
      { params: { access_token: accessToken, method: 'DELETE' } }
    )
  } catch (err) {
    console.error('Failed to unsubscribe webhook:', err)
  }

  await serviceClient
    .from('connected_accounts')
    .update({ is_active: false })
    .eq('id', id)

  await serviceClient
    .from('automations')
    .update({ is_active: false })
    .eq('account_id', id)

  return NextResponse.json({ success: true })
}
