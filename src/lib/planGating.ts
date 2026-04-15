export type Plan = 'free' | 'creator' | 'pro'

export interface PlanLimits {
  dmsPerMonth: number
  maxAccounts: number
  maxGiveaways: number
  analyticsDays: number
  hasAI: boolean
  hasEmailLeads: boolean
  hasAPI: boolean
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: {
    dmsPerMonth: 300,
    maxAccounts: 1,
    maxGiveaways: 0,
    analyticsDays: 7,
    hasAI: false,
    hasEmailLeads: false,
    hasAPI: false,
  },
  creator: {
    dmsPerMonth: 3000,
    maxAccounts: 3,
    maxGiveaways: 1,
    analyticsDays: 30,
    hasAI: false,
    hasEmailLeads: false,
    hasAPI: false,
  },
  pro: {
    dmsPerMonth: Infinity,
    maxAccounts: 20,
    maxGiveaways: Infinity,
    analyticsDays: 90,
    hasAI: true,
    hasEmailLeads: true,
    hasAPI: true,
  },
}

export function canSendDM(plan: Plan, used: number): boolean {
  return used < PLAN_LIMITS[plan].dmsPerMonth
}

export function canAddAccount(plan: Plan, current: number): boolean {
  return current < PLAN_LIMITS[plan].maxAccounts
}

export function canCreateGiveaway(plan: Plan, current: number): boolean {
  return current < PLAN_LIMITS[plan].maxGiveaways
}

export function canUseAI(plan: Plan): boolean {
  return PLAN_LIMITS[plan].hasAI
}

export function getRemainingDMs(plan: Plan, used: number): number {
  const limit = PLAN_LIMITS[plan].dmsPerMonth
  if (limit === Infinity) return Infinity
  return Math.max(0, limit - used)
}
