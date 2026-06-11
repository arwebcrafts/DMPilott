'use client'

import { useState, useEffect } from 'react'
import { useUserStore } from '@/stores/userStore'
import { PLAN_LIMITS } from '@/lib/planGating'
import { Loader2, Eye, MousePointerClick, Users, TrendingUp } from 'lucide-react'

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
      {/* Period toggle */}
      <div className="flex gap-2">
        {dayOptions.map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              days === d
                ? 'bg-[#DD2A7B] text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
            }`}
          >
            {d}D
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : data ? (
        <>
          {/* Stats cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Views', value: data.pageViews, icon: Eye },
              { label: 'Period Clicks', value: data.totalClicks, icon: MousePointerClick },
              { label: 'Subscribers', value: data.subscriberCount, icon: Users },
              { label: 'CTR', value: `${data.ctr.toFixed(1)}%`, icon: TrendingUp },
            ].map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="rounded-xl border p-4"
                style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}
              >
                <Icon className="w-4 h-4 text-gray-400 mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</div>
                <div className="text-xs text-gray-500 mt-1">{label}</div>
              </div>
            ))}
          </div>

          {/* Per-link breakdown */}
          {data.blockStats.length > 0 && (
            <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--surface-3)' }}>
              <div className="px-4 py-3 border-b font-semibold text-sm" style={{ borderColor: 'var(--surface-3)', background: 'var(--surface-1)' }}>
                Link Performance ({data.periodDays}D)
              </div>
              <div className="divide-y" style={{ borderColor: 'var(--surface-3)' }}>
                {data.blockStats.map((block) => (
                  <div key={block.id} className="px-4 py-3 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {block.title || 'Untitled'}
                      </div>
                      <div className="text-xs text-gray-500 capitalize">{block.type}</div>
                    </div>
                    <div className="text-sm font-semibold text-[#DD2A7B]">
                      {block.clicks} clicks
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-gray-500 text-center py-8">No analytics data yet</p>
      )}
    </div>
  )
}
