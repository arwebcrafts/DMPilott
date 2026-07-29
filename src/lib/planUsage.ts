import { PLAN_LIMITS, type Plan } from '@/lib/planGating'

// Server-side plan + usage helpers that work with the service client (no auth
// context), used by the webhook and queue where we only have a user_id.

interface UserPlanRow {
  plan: Plan
  dms_used_this_month: number
  dms_reset_at: string | null
}

/**
 * Fetches a user's plan and DM usage, rolling the monthly counter over when the
 * reset date has passed. Returns null if the user cannot be found.
 */
export async function getUserPlanUsage(
  supabase: any,
  userId: string
): Promise<{ plan: Plan; used: number; limit: number; remaining: number } | null> {
  const { data, error } = await supabase
    .from('users')
    .select('plan, dms_used_this_month, dms_reset_at')
    .eq('id', userId)
    .maybeSingle()

  if (error || !data) return null
  const row = data as UserPlanRow
  const plan: Plan = row.plan || 'free'

  let used = row.dms_used_this_month || 0

  // Roll the monthly window if it has elapsed.
  const resetAt = row.dms_reset_at ? new Date(row.dms_reset_at).getTime() : 0
  if (resetAt && Date.now() >= resetAt) {
    const nextReset = startOfNextMonth()
    await supabase
      .from('users')
      .update({ dms_used_this_month: 0, dms_reset_at: nextReset })
      .eq('id', userId)
    used = 0
  }

  const limit = PLAN_LIMITS[plan].dmsPerMonth
  return { plan, used, limit, remaining: Math.max(0, limit - used) }
}

/**
 * Atomically increments a user's monthly DM counter after a successful send.
 * Best-effort — a failure here must not fail the send that already happened.
 */
export async function incrementDmUsage(supabase: any, userId: string): Promise<void> {
  try {
    // Prefer an atomic RPC if present; fall back to read-modify-write.
    const { error } = await supabase.rpc('increment_dm_usage', { p_user_id: userId })
    if (!error) return
  } catch {
    /* RPC not installed — fall through */
  }

  const { data } = await supabase
    .from('users')
    .select('dms_used_this_month')
    .eq('id', userId)
    .maybeSingle()
  const current = (data?.dms_used_this_month as number) || 0
  await supabase
    .from('users')
    .update({ dms_used_this_month: current + 1 })
    .eq('id', userId)
}

function startOfNextMonth(): string {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)).toISOString()
}
