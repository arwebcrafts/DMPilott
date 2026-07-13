'use client'

import { useState, useEffect } from 'react'
import { useUserStore } from '@/stores/userStore'
import { PLAN_LIMITS } from '@/lib/planGating'
import { Loader2, Eye, MousePointerClick, Mail, TrendingUp } from 'lucide-react'

interface AnalyticsTabProps {
  hasPage: boolean
}

interface AnalyticsData {
  pageViews: number
  periodViews: number
  totalClicks: number
  subscriberCount: number
  ctr: number
  periodDays: number
  blockStats: {
    id: string
    title: string | null
    type: string
    clicks: number
    totalClicks: number
  }[]
}

export function AnalyticsTab({ hasPage }: AnalyticsTabProps) {
  const { user } = useUserStore()
  const plan = user?.plan || 'free'
  const limits = PLAN_LIMITS[plan]

  const [days, setDays] = useState(limits.analyticsDays)
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(false)

  const dayOptions = [7, 30, 90].filter((d) => d <= limits.analyticsDays)

  useEffect(() => {
    if (!hasPage) return
    fetchAnalytics(days)
  }, [hasPage, days])

  async function fetchAnalytics(period: number) {
    setLoading(true)
    try {
      const res = await fetch(`/api/bio-pages/analytics?days=${period}`)
      if (res.ok) {
        const json = await res.json()
        setData(json.analytics)
      }
    } finally {
      setLoading(false)
    }
  }

  if (!hasPage) {
    return (
      <div className="rounded-xl border p-8 text-center text-gray-500 text-sm" style={{ borderColor: 'var(--surface-3)' }}>
        Create and publish your bio page to see analytics
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {dayOptions.map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              days === d
                ? 'bg-[#DD2A7B] text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
            }`}
          >
            Last {d} days
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Total Page Views', value: data.pageViews, icon: Eye, sub: 'All time' },
              { label: 'Views This Period', value: data.periodViews, icon: Eye, sub: `${data.periodDays} days` },
              { label: 'Link Clicks', value: data.totalClicks, icon: MousePointerClick, sub: `${data.periodDays} days` },
              { label: 'Email Signups', value: data.subscriberCount, icon: Mail, sub: 'From email blocks' },
            ].map(({ label, value, icon: Icon, sub }) => (
              <div
                key={label}
                className="rounded-2xl border p-6 min-h-[140px] flex flex-col justify-between"
                style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}
              >
                <div className="flex items-center justify-between">
                  <Icon className="w-6 h-6 text-[#DD2A7B]" />
                  <span className="text-xs text-gray-400">{sub}</span>
                </div>
                <div>
                  <div className="text-4xl font-bold text-gray-900 dark:text-gray-100">{value}</div>
                  <div className="text-sm text-gray-500 mt-2">{label}</div>
                </div>
              </div>
            ))}
          </div>

          <div
            className="rounded-2xl border p-6 flex items-center gap-4"
            style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}
          >
            <TrendingUp className="w-8 h-8 text-[#DD2A7B] flex-shrink-0" />
            <div>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{data.ctr.toFixed(1)}%</div>
              <div className="text-sm text-gray-500">Click-through rate (clicks ÷ views)</div>
            </div>
          </div>

          {data.blockStats.length > 0 && (
            <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--surface-3)' }}>
              <div className="px-5 py-4 border-b font-semibold text-sm" style={{ borderColor: 'var(--surface-3)', background: 'var(--surface-1)' }}>
                Link Performance ({data.periodDays} days)
              </div>
              <div className="divide-y" style={{ borderColor: 'var(--surface-3)' }}>
                {data.blockStats.map((block) => (
                  <div key={block.id} className="px-5 py-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {block.title || 'Untitled'}
                      </div>
                      <div className="text-xs text-gray-500 capitalize">{block.type.replace('_', ' ')}</div>
                    </div>
                    <div className="text-lg font-semibold text-[#DD2A7B]">
                      {block.clicks}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-gray-500 text-center py-12">No analytics data yet. Share your page to get views.</p>
      )}
    </div>
  )
}
