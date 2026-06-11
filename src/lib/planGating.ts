export type Plan = 'free' | 'creator' | 'pro'

export interface PlanLimits {
  dmsPerMonth: number
  maxAccounts: number
  maxGiveaways: number
  analyticsDays: number
  hasAI: boolean
  hasEmailLeads: boolean
  hasAPI: boolean
  maxBioBlocks: number
  maxBioSocialLinks: number
  bioThemePresets: number
  maxBioProducts: number
  hasBioEmailCapture: boolean
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
    maxBioBlocks: 5,
    maxBioSocialLinks: 3,
    bioThemePresets: 2,
    maxBioProducts: 0,
    hasBioEmailCapture: false,
  },
  creator: {
    dmsPerMonth: 3000,
    maxAccounts: 3,
    maxGiveaways: 1,
    analyticsDays: 30,
    hasAI: false,
    hasEmailLeads: false,
    hasAPI: false,
    maxBioBlocks: 15,
    maxBioSocialLinks: 6,
    bioThemePresets: 4,
    maxBioProducts: 3,
    hasBioEmailCapture: false,
  },
  pro: {
    dmsPerMonth: Infinity,
    maxAccounts: 20,
    maxGiveaways: Infinity,
    analyticsDays: 90,
    hasAI: true,
    hasEmailLeads: true,
    hasAPI: true,
    maxBioBlocks: Infinity,
    maxBioSocialLinks: 6,
    bioThemePresets: 4,
    maxBioProducts: Infinity,
    hasBioEmailCapture: true,
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

export function canAddBioBlock(plan: Plan, current: number): boolean {
  return current < PLAN_LIMITS[plan].maxBioBlocks
}

export function canAddBioProduct(plan: Plan, current: number): boolean {
  return current < PLAN_LIMITS[plan].maxBioProducts
}

export function canUseBioEmailCapture(plan: Plan): boolean {
  return PLAN_LIMITS[plan].hasBioEmailCapture
}

export function getRemainingDMs(plan: Plan, used: number): number {
  const limit = PLAN_LIMITS[plan].dmsPerMonth
  if (limit === Infinity) return Infinity
  return Math.max(0, limit - used)
}
