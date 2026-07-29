import {
  PLAN_LIMITS,
  PRICING,
  canCreateAutomation,
  canUseAI,
  canUseFollowGate,
  canUsePerPostTargeting,
  canSendDM,
  getRemainingDMs,
} from '../planGating'

describe('plan gating', () => {
  it('free plan is the most restricted, pro the least', () => {
    expect(PLAN_LIMITS.free.maxAutomations).toBeLessThan(PLAN_LIMITS.creator.maxAutomations)
    expect(PLAN_LIMITS.creator.maxAutomations).toBeLessThan(PLAN_LIMITS.pro.maxAutomations)
    expect(PLAN_LIMITS.free.dmsPerMonth).toBeLessThan(PLAN_LIMITS.pro.dmsPerMonth)
  })

  it('no plan is unlimited', () => {
    for (const plan of ['free', 'creator', 'pro', 'business'] as const) {
      expect(Number.isFinite(PLAN_LIMITS[plan].dmsPerMonth)).toBe(true)
      expect(Number.isFinite(PLAN_LIMITS[plan].maxAutomations)).toBe(true)
      expect(Number.isFinite(PLAN_LIMITS[plan].maxBioBlocks)).toBe(true)
    }
  })

  it('AI is Pro-only', () => {
    expect(canUseAI('free')).toBe(false)
    expect(canUseAI('creator')).toBe(false)
    expect(canUseAI('pro')).toBe(true)
  })

  it('follow-to-unlock is Pro-only', () => {
    expect(canUseFollowGate('free')).toBe(false)
    expect(canUseFollowGate('creator')).toBe(false)
    expect(canUseFollowGate('pro')).toBe(true)
  })

  it('per-post targeting starts at Creator', () => {
    expect(canUsePerPostTargeting('free')).toBe(false)
    expect(canUsePerPostTargeting('creator')).toBe(true)
    expect(canUsePerPostTargeting('pro')).toBe(true)
  })

  it('enforces the automation count limit', () => {
    expect(canCreateAutomation('free', 0)).toBe(true)
    expect(canCreateAutomation('free', 1)).toBe(false) // free = 1 automation
    expect(canCreateAutomation('pro', 49)).toBe(true)
    expect(canCreateAutomation('pro', 50)).toBe(false)
    expect(canCreateAutomation('business', 199)).toBe(true)
    expect(canCreateAutomation('business', 200)).toBe(false)
  })

  it('enforces the monthly DM limit', () => {
    expect(canSendDM('free', 149)).toBe(true)
    expect(canSendDM('free', 150)).toBe(false)
    expect(getRemainingDMs('free', 150)).toBe(0)
    expect(getRemainingDMs('free', 200)).toBe(0)
  })

  it('pricing config covers every plan and yearly saves ~2 months', () => {
    expect(PRICING.map(p => p.key)).toEqual(['free', 'creator', 'pro', 'business'])
    for (const p of PRICING) {
      if (p.monthly > 0) {
        // Yearly is billed as 10x monthly (two months free).
        expect(p.yearly).toBe(p.monthly * 10)
      }
    }
  })
})
