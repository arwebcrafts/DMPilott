'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, X } from 'lucide-react'
import { MarketingPageLayout } from '@/components/landing/pages/MarketingPageLayout'
import { PRICING, PLAN_LIMITS, type Plan } from '@/lib/planGating'

type Cycle = 'monthly' | 'yearly'

// Feature comparison matrix. `true`/`false` render a check/dash; a string shows
// the value. Keyed to real PLAN_LIMITS so the table never drifts from billing.
const COMPARISON: { label: string; value: (p: Plan) => string | boolean }[] = [
  { label: 'Connected accounts', value: p => String(PLAN_LIMITS[p].maxAccounts) },
  { label: 'Active automations', value: p => String(PLAN_LIMITS[p].maxAutomations) },
  { label: 'DMs per month', value: p => PLAN_LIMITS[p].dmsPerMonth.toLocaleString() },
  { label: 'Comment → DM automation', value: () => true },
  { label: 'Keyword triggers & auto-reply', value: p => PLAN_LIMITS[p].hasKeywordTriggers },
  { label: 'Target a specific post', value: p => PLAN_LIMITS[p].hasPerPostTargeting },
  { label: 'AI auto-replies', value: p => PLAN_LIMITS[p].hasAI },
  { label: 'Follow-to-unlock flow', value: p => PLAN_LIMITS[p].hasFollowGate },
  { label: 'Email lead capture', value: p => PLAN_LIMITS[p].hasEmailLeads },
  { label: 'Link-in-Bio blocks', value: p => String(PLAN_LIMITS[p].maxBioBlocks) },
  { label: 'Remove DMPilot badge', value: p => PLAN_LIMITS[p].hasRemoveBranding },
  { label: 'Analytics history', value: p => `${PLAN_LIMITS[p].analyticsDays} days` },
  { label: 'API access', value: p => PLAN_LIMITS[p].hasAPI },
  { label: 'Priority support', value: p => PLAN_LIMITS[p].hasPrioritySupport },
]

function Cell({ value }: { value: string | boolean }) {
  if (value === true) return <Check className="w-4 h-4 mx-auto text-green-600" aria-label="Included" />
  if (value === false) return <X className="w-4 h-4 mx-auto text-gray-300 dark:text-gray-600" aria-label="Not included" />
  return <span className="text-sm text-gray-900 dark:text-gray-100">{value}</span>
}

export function PricingPageClient() {
  const [cycle, setCycle] = useState<Cycle>('monthly')

  return (
    <MarketingPageLayout
      title="Pricing that scales with you"
      subtitle="Instagram & Facebook automation"
      description="Start free, upgrade when you grow. Every paid plan is billed monthly or yearly — pick yearly and get two months free."
    >
      {/* Billing cycle toggle */}
      <div className="flex items-center justify-center gap-3 mb-10">
        <button
          onClick={() => setCycle('monthly')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${cycle === 'monthly' ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}
          style={cycle === 'monthly' ? { background: 'var(--accent)' } : { background: 'var(--surface-2)' }}
        >
          Monthly
        </button>
        <button
          onClick={() => setCycle('yearly')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${cycle === 'yearly' ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}
          style={cycle === 'yearly' ? { background: 'var(--accent)' } : { background: 'var(--surface-2)' }}
        >
          Yearly
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-500 text-white">2 MONTHS FREE</span>
        </button>
      </div>

      {/* Plan cards */}
      <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto px-4">
        {PRICING.map(plan => {
          const price = cycle === 'monthly' ? plan.monthly : plan.yearly
          const suffix = plan.monthly === 0 ? '' : cycle === 'monthly' ? '/mo' : '/yr'
          return (
            <div
              key={plan.key}
              className="rounded-2xl border p-6 flex flex-col relative"
              style={{
                background: 'var(--surface-0)',
                borderColor: plan.highlighted ? 'var(--accent)' : 'var(--surface-3)',
                boxShadow: plan.highlighted ? '0 10px 40px rgba(221,42,123,0.15)' : 'var(--shadow-sm)',
              }}
            >
              {plan.highlighted && (
                <span
                  className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-bold px-3 py-1 rounded-full text-white"
                  style={{ background: 'var(--accent)' }}
                >
                  MOST POPULAR
                </span>
              )}
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{plan.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 min-h-[40px]">{plan.tagline}</p>
              <div className="mt-4 mb-1">
                <span className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">${price}</span>
                <span className="text-sm text-gray-500">{suffix}</span>
              </div>
              {plan.monthly > 0 && cycle === 'yearly' && (
                <p className="text-xs text-green-600 mb-2">${plan.monthly * 12 - plan.yearly} saved per year</p>
              )}
              <Link
                href="/signup"
                className={`mt-4 mb-6 text-center px-4 py-2.5 rounded-xl text-sm font-semibold ${plan.highlighted ? 'text-white' : 'text-gray-900 dark:text-gray-100 border'}`}
                style={plan.highlighted ? { background: 'var(--accent)' } : { borderColor: 'var(--surface-3)' }}
              >
                {plan.cta}
              </Link>
              <ul className="space-y-2.5">
                {plan.features.map(feat => (
                  <li key={feat} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-200">
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                    {feat}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>

      {/* Comparison table */}
      <div className="max-w-5xl mx-auto px-4 mt-20">
        <h2 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">Compare every feature</h2>
        <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--surface-3)' }}>
          <table className="w-full text-left border-collapse min-w-[560px]">
            <thead>
              <tr style={{ background: 'var(--surface-1)' }}>
                <th className="p-4 text-sm font-semibold text-gray-900 dark:text-gray-100">Feature</th>
                {PRICING.map(p => (
                  <th key={p.key} className="p-4 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row, i) => (
                <tr key={row.label} style={{ background: i % 2 ? 'var(--surface-0)' : 'transparent' }}>
                  <td className="p-4 text-sm text-gray-700 dark:text-gray-200 border-t" style={{ borderColor: 'var(--surface-2)' }}>
                    {row.label}
                  </td>
                  {PRICING.map(p => (
                    <td key={p.key} className="p-4 text-center border-t" style={{ borderColor: 'var(--surface-2)' }}>
                      <Cell value={row.value(p.key)} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto px-4 mt-20 mb-8">
        <h2 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">Pricing FAQ</h2>
        <div className="space-y-4">
          {[
            {
              q: 'Is there really a free plan?',
              a: 'Yes. The Free plan lets you connect one account, run one automation, and send up to 150 DMs a month — no credit card required. Upgrade only when you outgrow it.',
            },
            {
              q: 'What counts as a DM?',
              a: 'Each auto-reply DMPilot sends on your behalf — whether triggered by a comment or an incoming message — counts as one DM against your monthly limit.',
            },
            {
              q: 'What do AI replies do?',
              a: 'On the Pro plan, AI reads the incoming message and writes a natural, on-brand reply using your DM message as the brand voice — instead of sending the same fixed text every time.',
            },
            {
              q: 'What is follow-to-unlock?',
              a: 'A Pro flow where a follower must follow you before they receive your link. If they are not following, DMPilot asks them to follow, then confirm — then delivers the link.',
            },
            {
              q: 'Can I switch between monthly and yearly?',
              a: 'Yes. Yearly is billed once at ten months’ price (two months free). You can change plans or cancel any time.',
            },
          ].map(item => (
            <div key={item.q} className="rounded-xl border p-5" style={{ borderColor: 'var(--surface-3)', background: 'var(--surface-0)' }}>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{item.q}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </MarketingPageLayout>
  )
}
