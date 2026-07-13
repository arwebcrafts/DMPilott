import { createClient } from '@/lib/supabase/server'
import { PLAN_LIMITS, type Plan } from '@/lib/planGating'

export async function getAuthenticatedUserPlan(): Promise<{
  userId: string
  plan: Plan
} | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('plan')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) {
    console.error('[planChecks] profile lookup failed:', profileError.message)
  }

  return {
    userId: user.id,
    plan: (profile?.plan as Plan) || 'free',
  }
}

export function getPlanLimits(plan: Plan) {
  return PLAN_LIMITS[plan]
}
