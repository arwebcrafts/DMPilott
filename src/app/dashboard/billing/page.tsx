'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/stores/userStore'
import { PLAN_LIMITS } from '@/lib/planGating'
import { Check, CreditCard, Download, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    description: 'Perfect for testing',
    features: [
      '300 DMs/month',
      '1 Instagram account',
      'Basic keyword automation',
      '7-day analytics',
    ],
    limitations: [
      'No Facebook support',
      'No giveaway mode',
      'No AI features',
    ],
  },
  {
    id: 'creator',
    name: 'Creator',
    price: 9,
    yearlyPrice: 7.20,
    description: 'Most popular for growing creators',
    features: [
      '3,000 DMs/month',
      '2 Instagram + 1 Facebook',
      'All trigger types',
      'Giveaway mode (1 active)',
      'Unique discount codes',
      '30-day analytics',
    ],
    limitations: [],
    popular: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19,
    yearlyPrice: 15.20,
    description: 'For serious creators & businesses',
    features: [
      'Unlimited DMs',
      '10 Instagram + 10 Facebook',
      'AI conversation replies',
      'Multi-language auto-detect',
      'Email lead capture',
      'Unlimited giveaways',
      '90-day analytics + CSV export',
      'API access + Zapier',
    ],
    limitations: [],
  },
]

export default function BillingPage() {
  const [loading, setLoading] = useState(false)
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly')
  const [portalLoading, setPortalLoading] = useState(false)
  const { user } = useUserStore()
  const supabase = createClient()

  const currentPlan = user?.plan || 'free'

  async function handleUpgrade(planId: string) {
    if (planId === 'free') return
    setLoading(true)

    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return

    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, userId: authUser.id }),
      })

      const { checkoutUrl, error } = await res.json()
      if (error) throw new Error(error)
      if (checkoutUrl) window.location.href = checkoutUrl
    } catch (err: any) {
      alert(err.message || 'Failed to start checkout')
    }
    setLoading(false)
  }

  async function openPortal() {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const { portalUrl, error } = await res.json()
      if (error) throw new Error(error)
      if (portalUrl) window.location.href = portalUrl
    } catch (err: any) {
      alert(err.message || 'Failed to open billing portal')
    }
    setPortalLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Billing & Plans</h1>
        <p className="text-gray-600 dark:text-gray-300 text-sm">Manage your subscription and billing</p>
      </div>

      {/* Current plan */}
      <div className="rounded-xl border p-5 shadow-sm" style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Current Plan</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 capitalize">{currentPlan}</div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openPortal}
            disabled={portalLoading}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
            style={{ borderColor: 'var(--surface-3)' }}
          >
            {portalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
            Manage Subscription
          </motion.button>
        </div>
      </div>

      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-4">
        <span className={`text-sm font-medium ${billingInterval === 'monthly' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-300'}`}>
          Monthly
        </span>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setBillingInterval(billingInterval === 'monthly' ? 'yearly' : 'monthly')}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            billingInterval === 'yearly' ? 'bg-[#22c55e]' : 'bg-gray-300 dark:bg-gray-600'
          }`}
        >
          <motion.span
            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
              billingInterval === 'yearly' ? 'translate-x-7' : 'translate-x-1'
            }`}
          />
        </motion.button>
        <span className={`text-sm font-medium ${billingInterval === 'yearly' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-300'}`}>
          Yearly <span className="text-[#22c55e] text-xs">(-20%)</span>
        </span>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map((plan, index) => {
          const price = billingInterval === 'yearly' ? plan.yearlyPrice : plan.price
          const isCurrent = plan.id === currentPlan

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-xl border-2 shadow-sm ${
                plan.popular ? 'border-[#DD2A7B]' :
                isCurrent ? 'border-[#22c55e]' :
                ''
              } relative overflow-hidden`}
              style={{ background: 'var(--surface-0)', borderColor: plan.popular || isCurrent ? undefined : 'var(--surface-3)' }}
            >
              {plan.popular && (
                <div className="bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white text-xs font-medium text-center py-1">
                  MOST POPULAR
                </div>
              )}
              {isCurrent && (
                <div className="bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30 text-xs font-medium text-center py-1">
                  CURRENT PLAN
                </div>
              )}

              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{plan.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{plan.description}</p>

                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    ${price !== undefined ? price : plan.price}
                  </span>
                  {price !== undefined && price > 0 && (
                    <span className="text-gray-600 dark:text-gray-300 text-sm">/{billingInterval === 'yearly' ? 'mo (billed yearly)' : 'month'}</span>
                  )}
                </div>

                <ul className="space-y-2 mb-5">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100">
                      <Check className="w-4 h-4 text-[#22c55e]" /> {f}
                    </li>
                  ))}
                  {plan.limitations.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <span className="w-4 h-4 text-center">–</span> {f}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-2.5 border text-[#22c55e] rounded-lg text-sm font-medium cursor-default"
                    style={{ borderColor: 'var(--surface-3)' }}
                  >
                    Current Plan
                  </button>
                ) : plan.id === 'free' ? (
                  <button disabled className="w-full py-2.5 border text-gray-600 dark:text-gray-300 rounded-lg text-sm font-medium cursor-not-allowed" style={{ borderColor: 'var(--surface-3)' }}>
                    Free Forever
                  </button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={loading}
                    className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors text-white ${
                      plan.popular
                        ? ''
                        : 'bg-[#1877F2] hover:bg-[#166FE5]'
                    } disabled:opacity-50`}
                    style={{ background: plan.popular ? 'var(--accent)' : undefined }}
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : `Upgrade to ${plan.name}`}
                  </motion.button>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      <p className="text-center text-xs text-gray-600 dark:text-gray-300">
        All paid plans include a 7-day free trial. Cancel anytime.
      </p>
    </div>
  )
}
