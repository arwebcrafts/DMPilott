import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

/**
 * DELETE /api/account
 *
 * Permanently erases the signed-in user and everything belonging to them.
 * Meta requires a working deletion path as a condition of App Review, and the
 * public instructions at /data-deletion point here, so this must actually
 * remove data rather than deactivate it.
 *
 * Rows that reference users(id) with ON DELETE CASCADE go automatically; the
 * explicit deletes below cover tables that do not cascade and make the
 * intent auditable.
 */
export async function DELETE() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const service = createServiceClient()

  // Revoke Meta access first. If this fails we still proceed — the user asked
  // to be deleted, and holding their data hostage to a third-party API error
  // is exactly what the deletion requirement exists to prevent.
  try {
    const { data: accounts } = await service
      .from('connected_accounts')
      .select('id, platform_account_id, access_token_encrypted')
      .eq('user_id', user.id)

    const { decryptToken } = await import('@/lib/encryption')
    const axios = (await import('axios')).default

    for (const account of accounts || []) {
      try {
        const accessToken = decryptToken(account.access_token_encrypted)
        await axios.delete(
          `https://graph.facebook.com/v21.0/${account.platform_account_id}/subscribed_apps`,
          { params: { access_token: accessToken } }
        )
      } catch {
        // Token may already be expired or revoked on Meta's side.
      }
    }
  } catch (err: any) {
    console.error('[Account Delete] Meta unsubscribe step failed:', err?.message || err)
  }

  // Every one of these cascades from users(id) or auth.users(id), so the final
  // delete would clear them anyway. They are listed explicitly so a broken
  // cascade can never leave a user's data behind silently. Child tables
  // (bio_blocks, bio_clicks, bio_subscribers, giveaway_entries,
  // instagram_user_interactions, user_page_interactions) cascade from these.
  const tables = [
    'dm_logs',
    'automations',
    'connected_accounts',
    'bio_pages',
    'giveaways',
    'discount_codes',
    'subscriptions',
    'webhook_events',
    'page_configurations',
    'instagram_gift_offers',
  ]

  for (const table of tables) {
    const { error } = await service.from(table).delete().eq('user_id', user.id)
    // A missing optional table must not abort the deletion of everything else.
    if (error) {
      console.error(`[Account Delete] Could not clear ${table}:`, error.message)
    }
  }

  await service.from('users').delete().eq('id', user.id)

  const { error: authError } = await service.auth.admin.deleteUser(user.id)
  if (authError) {
    console.error('[Account Delete] Auth user deletion failed:', authError.message)
    return NextResponse.json(
      { error: 'Your data was deleted but the login could not be removed. Contact support.' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
