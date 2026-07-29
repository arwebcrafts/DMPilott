export type Plan = 'free' | 'creator' | 'pro'

export interface PlanLimits {
  // Core automation limits
  dmsPerMonth: number
  maxAccounts: number
  maxAutomations: number
  maxGiveaways: number
  analyticsDays: number
  // Feature flags
  hasAI: boolean
  hasFollowGate: boolean
  hasPerPostTargeting: boolean
  hasKeywordTriggers: boolean
  hasEmailLeads: boolean
  hasAPI: boolean
  hasRemoveBranding: boolean
  hasPrioritySupport: boolean
  // Link-in-Bio
  maxBioBlocks: number
  maxBioSocialLinks: number
  bioThemePresets: number
  maxBioProducts: number
  hasBioEmailCapture: boolean
}

// All limits are finite on purpose — no plan is "unlimited". The Pro numbers
// are high enough to feel generous while keeping infrastructure cost bounded.
export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: {
    dmsPerMonth: 150,
    maxAccounts: 1,
    maxAutomations: 1,
    maxGiveaways: 0,
    analyticsDays: 7,
    hasAI: false,
    hasFollowGate: false,
    hasPerPostTargeting: false,
    hasKeywordTriggers: true,
    hasEmailLeads: false,
    hasAPI: false,
    hasRemoveBranding: false,
    hasPrioritySupport: false,
    maxBioBlocks: 3,
    maxBioSocialLinks: 3,
    bioThemePresets: 2,
    maxBioProducts: 0,
    hasBioEmailCapture: false,
  },
  creator: {
    dmsPerMonth: 3000,
    maxAccounts: 3,
    maxAutomations: 15,
    maxGiveaways: 3,
    analyticsDays: 30,
    hasAI: false,
    hasFollowGate: false,
    hasPerPostTargeting: true,
    hasKeywordTriggers: true,
    hasEmailLeads: true,
    hasAPI: false,
    hasRemoveBranding: true,
    hasPrioritySupport: false,
    maxBioBlocks: 15,
    maxBioSocialLinks: 6,
    bioThemePresets: 4,
    maxBioProducts: 3,
    hasBioEmailCapture: false,
  },
  pro: {
    dmsPerMonth: 25000,
    maxAccounts: 10,
    maxAutomations: 100,
    maxGiveaways: 25,
    analyticsDays: 90,
    hasAI: true,
    hasFollowGate: true,
    hasPerPostTargeting: true,
    hasKeywordTriggers: true,
    hasEmailLeads: true,
    hasAPI: true,
    hasRemoveBranding: true,
    hasPrioritySupport: true,
    maxBioBlocks: 100,
    maxBioSocialLinks: 6,
    bioThemePresets: 4,
    maxBioProducts: 100,
    hasBioEmailCapture: true,
  },
}

// ---------------------------------------------------------------------------
// Pricing — single source of truth for the pricing page and (later) Stripe.
// Yearly is billed as 10x the monthly rate (2 months free).
// ---------------------------------------------------------------------------
export interface PlanPricing {
  key: Plan
  name: string
  tagline: string
  monthly: number
  yearly: number
  highlighted?: boolean
  cta: string
  /** Marketing bullet list shown on the pricing page. */
  features: string[]
}

export const PRICING: PlanPricing[] = [
  {
    key: 'free',
    name: 'Free',
    tagline: 'For creators getting started with DM automation.',
    monthly: 0,
    yearly: 0,
    cta: 'Start free',
    features: [
      '1 Instagram or Facebook account',
      '1 active automation',
      '150 DMs / month',
      'Comment → DM automation',
      'Keyword triggers & auto-reply',
      'Link-in-Bio (3 blocks)',
      '7-day analytics',
      'DMPilot badge on your bio page',
    ],
  },
  {
    key: 'creator',
    name: 'Creator',
    tagline: 'For growing creators running real campaigns.',
    monthly: 19,
    yearly: 190,
    cta: 'Upgrade to Creator',
    features: [
      '3 accounts (Instagram + Facebook)',
      '15 active automations',
      '3,000 DMs / month',
      'Target a specific post or your whole account',
      'Email lead capture',
      'Link-in-Bio (15 blocks, 3 products)',
      '30-day analytics',
      'Remove DMPilot badge',
    ],
  },
  {
    key: 'pro',
    name: 'Pro',
    tagline: 'For businesses that want AI and follow-to-unlock flows.',
    monthly: 49,
    yearly: 490,
    highlighted: true,
    cta: 'Upgrade to Pro',
    features: [
      '10 accounts',
      '100 active automations',
      '25,000 DMs / month',
      'AI auto-replies that handle the conversation',
      'Follow-to-unlock: require a follow before the link',
      'Per-post targeting',
      'Link-in-Bio (100 blocks, products, email capture)',
      '90-day analytics',
      'Priority support & API access',
    ],
  },
]

export function getPlanPricing(plan: Plan): PlanPricing {
  return PRICING.find(p => p.key === plan) || PRICING[0]
}

// ---------------------------------------------------------------------------
// Gate helpers
// ---------------------------------------------------------------------------
export function canSendDM(plan: Plan, used: number): boolean {
  return used < PLAN_LIMITS[plan].dmsPerMonth
}

export function canAddAccount(plan: Plan, current: number): boolean {
  return current < PLAN_LIMITS[plan].maxAccounts
}

export function canCreateAutomation(plan: Plan, current: number): boolean {
  return current < PLAN_LIMITS[plan].maxAutomations
}

export function canCreateGiveaway(plan: Plan, current: number): boolean {
  return current < PLAN_LIMITS[plan].maxGiveaways
}

export function canUseAI(plan: Plan): boolean {
  return PLAN_LIMITS[plan].hasAI
}

export function canUseFollowGate(plan: Plan): boolean {
  return PLAN_LIMITS[plan].hasFollowGate
}

export function canUsePerPostTargeting(plan: Plan): boolean {
  return PLAN_LIMITS[plan].hasPerPostTargeting
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
  return Math.max(0, PLAN_LIMITS[plan].dmsPerMonth - used)
}
