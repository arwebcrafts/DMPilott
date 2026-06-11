import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { Plan, PlanLimits } from '@/lib/planGating'

interface User {
  id: string
  email: string
  fullName: string | null
  avatarUrl: string | null
  plan: Plan
  stripeCustomerId: string | null
  dmsUsedThisMonth: number
  dmsResetAt: string | null
  planExpiresAt: string | null
}

interface ConnectedAccount {
  id: string
  platform: 'instagram' | 'facebook'
  username: string | null
  displayName: string | null
  profilePictureUrl: string | null
  followerCount: number
  isActive: boolean
  webhookSubscribed: boolean
}

interface UserStore {
  user: User | null
  accounts: ConnectedAccount[]
  isLoading: boolean
  fetchUser: () => Promise<void>
  fetchAccounts: () => Promise<void>
  planLimits: PlanLimits
}

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  accounts: [],
  isLoading: true,
  planLimits: {
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

  fetchUser: async () => {
    const supabase = createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (!authUser) {
      set({ user: null, isLoading: false })
      return
    }

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()

    if (profile) {
      set({
        user: {
          id: profile.id,
          email: profile.email,
          fullName: profile.full_name,
          avatarUrl: profile.avatar_url,
          plan: profile.plan as Plan,
          stripeCustomerId: profile.stripe_customer_id,
          dmsUsedThisMonth: profile.dms_used_this_month,
          dmsResetAt: profile.dms_reset_at,
          planExpiresAt: profile.plan_expires_at,
        },
        isLoading: false,
      })
    } else {
      set({ user: null, isLoading: false })
    }
  },

  fetchAccounts: async () => {
    const supabase = createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return

    const { data: accounts } = await supabase
      .from('connected_accounts')
      .select('*')
      .eq('user_id', authUser.id)
      .eq('is_active', true)

    set({ accounts: accounts || [] })
  },
}))
