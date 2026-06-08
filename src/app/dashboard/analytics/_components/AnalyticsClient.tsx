'use client'

import { useState, useMemo } from 'react'
import { animate, motion } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts'
import { format, formatDistanceToNow } from 'date-fns'
import {
  Zap, Clock, BarChart3, TrendingUp, CheckCircle2,
  XCircle, ChevronLeft, ChevronRight, Download, Filter,
} from 'lucide-react'
import type { ChartPoint, ActivityItem, AutomationStats } from './AnalyticsDataFetcher'
import { InstagramIcon, FacebookIcon } from '@/components/ui/brand-icons'

function AnimatedNumber({ value }: { value: number }) {
  return <>{value.toLocaleString()}</>
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card rounded-xl shadow-md p-3 text-xs border border-white/10">
      <p className="text-[#8a8a9a] font-medium mb-2">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.dataKey} className="font-semibold" style={{ color: entry.color }}>
          {entry.dataKey === 'instagram' ? 'Instagram' : entry.dataKey === 'facebook' ? 'Facebook' : 'Failed'}: {entry.value}
        </p>
      ))}
    </div>
  )
}

function DMsChart({ data }: { data: ChartPoint[] }) {
  const [tab, setTab] = useState<'7D' | '30D' | '90D'>('30D')

  const displayed = useMemo(() => {
    const days = tab === '7D' ? 7 : tab === '30D' ? 30 : 90
    const slice = data.slice(-days)
    return slice.map((d) => ({
      ...d,
      label: tab === '7D'
        ? format(new Date(d.date), 'EEE')
        : tab === '30D'
        ? format(new Date(d.date), 'MMM d')
        : format(new Date(d.date), 'MMM d'),
    }))
  }, [data, tab])

  return (
    <div className="glass-card rounded-xl border border-white/10 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold text-white">DMs Over Time</h2>
          <p className="text-xs text-[#8a8a9a] mt-0.5">Instagram + Facebook combined</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 text-xs text-[#8a8a9a]">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E1306C]" /> IG
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1877F2]" /> FB
            </span>
          </div>
          <div className="flex rounded-lg overflow-hidden border border-white/10">
            {(['7D', '30D', '90D'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1 text-xs font-medium transition-colors ${
                  tab === t
                    ? 'bg-gradient-to-r from-[#F58529] to-[#DD2A7B] text-white'
                    : 'bg-transparent text-[#8a8a9a] hover:bg-white/10'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {displayed.some(d => d.instagram > 0 || d.facebook > 0) ? (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={displayed} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="igGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#E1306C" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#E1306C" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="fbGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1877F2" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#1877F2" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#22223a" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: '#8a8a9a' }}
              axisLine={false}
              tickLine={false}
              interval={tab === '90D' ? 14 : tab === '30D' ? 6 : 0}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#8a8a9a' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="instagram"
              stroke="#E1306C"
              strokeWidth={2}
              fill="url(#igGrad)"
              dot={false}
              activeDot={{ r: 4, fill: '#E1306C' }}
            />
            <Area
              type="monotone"
              dataKey="facebook"
              stroke="#1877F2"
              strokeWidth={2}
              fill="url(#fbGrad)"
              dot={false}
              activeDot={{ r: 4, fill: '#1877F2' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[280px] flex flex-col items-center justify-center text-[#8a8a9a] text-sm gap-2">
          <BarChart3 className="w-10 h-10 text-[#5a5a6e]" />
          <p>No DM data for this period yet</p>
        </div>
      )}
    </div>
  )
}

const PAGE_SIZE = 20

function ActivityTable({ items }: { items: ActivityItem[] }) {
  const [page, setPage] = useState(0)
  const [filter, setFilter] = useState<'all' | 'instagram' | 'facebook'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'sent' | 'failed' | 'queued'>('all')

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (filter !== 'all' && item.platform !== filter) return false
      if (statusFilter !== 'all' && item.status !== statusFilter) return false
      return true
    })
  }, [items, filter, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE))
  const pageItems = filteredItems.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <div className="glass-card rounded-xl border border-white/10 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 flex-wrap gap-3">
        <h2 className="font-semibold text-white">All DM Activity</h2>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => { setFilter(e.target.value as any); setPage(0) }}
            className="px-3 py-1.5 glass-card border border-white/10 rounded-lg text-xs text-white bg-transparent"
          >
            <option value="all">All Platforms</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as any); setPage(0) }}
            className="px-3 py-1.5 glass-card border border-white/10 rounded-lg text-xs text-white bg-transparent"
          >
            <option value="all">All Status</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
            <option value="queued">Queued</option>
          </select>
        </div>
      </div>

      {filteredItems.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#1a1a2e]">
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-[#8a8a9a]">Platform</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-[#8a8a9a]">Post</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-[#8a8a9a]">Commenter</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-[#8a8a9a]">Automation</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-[#8a8a9a]">Keyword</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-[#8a8a9a]">Status</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-[#8a8a9a]">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#22223a]">
                {pageItems.map((dm) => (
                  <tr key={dm.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
                          dm.platform === 'instagram'
                            ? 'bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]'
                            : 'bg-[#1877F2]'
                        }`}
                      >
                        {dm.platform === 'instagram' ? 'IG' : 'FB'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#8a8a9a] font-mono text-xs">
                      {dm.post_id ? `${dm.post_id.slice(0, 12)}…` : '—'}
                    </td>
                    <td className="px-4 py-3 font-medium text-white">
                      @{dm.commenter_username || 'unknown'}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#8a8a9a]">
                      {dm.automation_name || '—'}
                    </td>
                    <td className="px-4 py-3">
                      {dm.keyword_matched ? (
                        <span className="text-xs bg-[#DD2A7B]/20 text-[#DD2A7B] border border-[#DD2A7B]/30 px-2 py-0.5 rounded-full font-medium">
                          {dm.keyword_matched}
                        </span>
                      ) : (
                        <span className="text-[#8a8a9a] text-xs">any</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                          dm.status === 'sent'
                            ? 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30'
                            : dm.status === 'queued'
                            ? 'bg-[#F7B928]/20 text-[#F7B928] border border-[#F7B928]/30'
                            : 'bg-[#FA3E3E]/20 text-[#FA3E3E] border border-[#FA3E3E]/30'
                        }`}
                      >
                        {dm.status === 'sent' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : dm.status === 'queued' ? (
                          <Clock className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {dm.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#8a8a9a] whitespace-nowrap">
                      {formatDistanceToNow(new Date(dm.created_at), { addSuffix: true })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-white/10">
              <span className="text-xs text-[#8a8a9a]">
                Page {page + 1} of {totalPages} ({filteredItems.length} total)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-white/10 rounded-lg text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-white/10 rounded-lg text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="p-10 text-center text-[#8a8a9a] text-sm">
          No DM activity found with current filters.
        </div>
      )}
    </div>
  )
}

function AutomationStats({ stats }: { stats: AutomationStats[] }) {
  return (
    <div className="glass-card rounded-xl border border-white/10 shadow-sm p-5">
      <h2 className="font-semibold text-white mb-4">Automation Performance</h2>
      {stats.length > 0 ? (
        <div className="space-y-3">
          {stats.map((stat) => (
            <div
              key={stat.id}
              className="flex items-center gap-3 p-3 bg-[#1a1a2e] rounded-xl"
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 ${
                  stat.platform === 'instagram'
                    ? 'bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]'
                    : 'bg-[#1877F2]'
                }`}
              >
                {stat.platform === 'instagram' ? 'IG' : 'FB'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{stat.name}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-[#8a8a9a]">{stat.total_dms_sent} DMs sent</span>
                  <span className={`text-xs font-medium ${
                    stat.success_rate >= 90 ? 'text-[#22c55e]' : 
                    stat.success_rate >= 70 ? 'text-[#F7B928]' : 'text-[#FA3E3E]'
                  }`}>
                    {stat.success_rate}% success
                  </span>
                </div>
              </div>
              <div className="w-16 h-2 bg-[#22223a] rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${
                    stat.success_rate >= 90 ? 'bg-[#22c55e]' : 
                    stat.success_rate >= 70 ? 'bg-[#F7B928]' : 'bg-[#FA3E3E]'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${stat.success_rate}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="h-32 flex flex-col items-center justify-center text-[#8a8a9a] text-xs gap-2">
          <Zap className="w-8 h-8 text-[#5a5a6e]" />
          <p>No automation data yet</p>
        </div>
      )}
    </div>
  )
}

interface Props {
  profileName: string
  plan: string
  dmsUsed: number
  dmsLimit: number
  totalDmsSent: number
  totalDmsFailed: number
  chartData: ChartPoint[]
  allActivity: ActivityItem[]
  automationStats: AutomationStats[]
}

export default function AnalyticsClient({
  profileName,
  plan,
  dmsUsed,
  dmsLimit,
  totalDmsSent,
  totalDmsFailed,
  chartData,
  allActivity,
  automationStats,
}: Props) {
  const isUnlimited = dmsLimit === -1
  const dmsPercent = isUnlimited ? 0 : Math.min((dmsUsed / dmsLimit) * 100, 100)
  const successRate = totalDmsSent + totalDmsFailed > 0 
    ? Math.round((totalDmsSent / (totalDmsSent + totalDmsFailed)) * 100) 
    : 100

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-[#8a8a9a] text-sm mt-0.5">
            Detailed insights into your DM automation performance
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-5 border border-white/10 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#DD2A7B]/20 rounded-lg">
              <Zap className="w-5 h-5 text-[#DD2A7B]" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white">
            <AnimatedNumber value={totalDmsSent} />
          </div>
          <div className="text-sm text-[#8a8a9a] mt-1">Total DMs Sent</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-xl p-5 border border-white/10 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#22c55e]/20 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-[#22c55e]" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white">
            {successRate}%
          </div>
          <div className="text-sm text-[#8a8a9a] mt-1">Success Rate</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-xl p-5 border border-white/10 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#FA3E3E]/20 rounded-lg">
              <XCircle className="w-5 h-5 text-[#FA3E3E]" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white">
            <AnimatedNumber value={totalDmsFailed} />
          </div>
          <div className="text-sm text-[#8a8a9a] mt-1">Failed DMs</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-xl p-5 border border-white/10 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#1877F2]/20 rounded-lg">
              <Clock className="w-5 h-5 text-[#1877F2]" />
            </div>
            {!isUnlimited && (
              <span
                className={`text-xs font-medium ${
                  dmsPercent > 95
                    ? 'text-[#FA3E3E]'
                    : dmsPercent > 80
                    ? 'text-[#F7B928]'
                    : 'text-[#8a8a9a]'
                }`}
              >
                {dmsPercent.toFixed(0)}% used
              </span>
            )}
          </div>
          <div className="text-3xl font-bold text-white">
            <AnimatedNumber value={dmsUsed} />
            {!isUnlimited && (
              <span className="text-base text-[#8a8a9a] font-normal">
                /{dmsLimit.toLocaleString()}
              </span>
            )}
          </div>
          <div className="text-sm text-[#8a8a9a] mt-1">DMs This Month</div>
        </motion.div>
      </div>

      {/* Chart */}
      <DMsChart data={chartData} />

      {/* Automation Stats + Activity Table */}
      <div className="grid grid-cols-1 lg:grid-cols-[35fr_65fr] gap-5">
        <AutomationStats stats={automationStats} />
        <ActivityTable items={allActivity} />
      </div>
    </div>
  )
}
