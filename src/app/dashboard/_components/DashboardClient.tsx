'use client'

import { useEffect, useMemo, useState } from 'react'
import { animate, motion } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { formatDistanceToNow, format } from 'date-fns'
import {
  Zap, Clock, BarChart3, Users, TrendingUp, CheckCircle2,
  XCircle, ChevronLeft, ChevronRight, ToggleLeft, ToggleRight,
  Plus, Gift, BarChart2, UserPlus,
} from 'lucide-react'
import type { ChartPoint, TopPost, ActivityItem, AutomationItem } from './DashboardDataFetcher'

// ─── Animated number counter ─────────────────────────────────────────────────

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.2,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.round(v)),
    })
    return controls.stop
  }, [value])
  return <>{display.toLocaleString()}</>
}

// ─── Custom chart tooltip ─────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card rounded-xl shadow-md p-3 text-xs border border-white/10">
      <p className="text-[#8a8a9a] font-medium mb-2">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.dataKey} className="font-semibold" style={{ color: entry.color }}>
          {entry.dataKey === 'instagram' ? 'Instagram' : 'Facebook'}: {entry.value}
        </p>
      ))}
    </div>
  )
}

// ─── DMs chart ───────────────────────────────────────────────────────────────

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
    <div className="glass-card rounded-xl border border-white/10 shadow-sm p-5 h-full">
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
        <ResponsiveContainer width="100%" height={220}>
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
              isAnimationActive
              animationDuration={800}
            />
            <Area
              type="monotone"
              dataKey="facebook"
              stroke="#1877F2"
              strokeWidth={2}
              fill="url(#fbGrad)"
              dot={false}
              activeDot={{ r: 4, fill: '#1877F2' }}
              isAnimationActive
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[220px] flex flex-col items-center justify-center text-[#8a8a9a] text-sm gap-2">
          <BarChart2 className="w-10 h-10 text-[#5a5a6e]" />
          <p>No DM data for this period yet</p>
        </div>
      )}
    </div>
  )
}

// ─── Top posts ────────────────────────────────────────────────────────────────

function TopPosts({ posts }: { posts: TopPost[] }) {
  return (
    <div className="glass-card rounded-xl border border-white/10 shadow-sm p-5 h-full">
      <h2 className="font-semibold text-white mb-4">Top Performing Posts</h2>
      {posts.length > 0 ? (
        <div className="space-y-3">
          {posts.map((post, i) => (
            <div key={post.post_id} className="flex items-center gap-3">
              <span className="text-xs font-bold text-[#8a8a9a] w-4">{i + 1}</span>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 ${
                  post.platform === 'instagram'
                    ? 'bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]'
                    : 'bg-[#1877F2]'
                }`}
              >
                {post.platform === 'instagram' ? 'IG' : 'FB'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate font-mono">
                  {post.post_id.slice(0, 16)}…
                </p>
                <p className="text-[10px] text-[#8a8a9a] capitalize">{post.platform}</p>
              </div>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full text-white flex-shrink-0 ${
                  post.platform === 'instagram'
                    ? 'bg-gradient-to-r from-[#F58529] to-[#DD2A7B]'
                    : 'bg-[#1877F2]'
                }`}
              >
                {post.count} DMs
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="h-32 flex flex-col items-center justify-center text-[#8a8a9a] text-xs gap-2">
          <TrendingUp className="w-8 h-8 text-[#5a5a6e]" />
          <p>No post data yet</p>
        </div>
      )}
    </div>
  )
}

// ─── Recent activity table ────────────────────────────────────────────────────

const PAGE_SIZE = 10

function RecentActivity({ items }: { items: ActivityItem[] }) {
  const [page, setPage] = useState(0)
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE))
  const pageItems = items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <div className="glass-card rounded-xl border border-white/10 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <h2 className="font-semibold text-white">Recent DM Activity</h2>
        <a href="/dashboard/analytics" className="text-xs text-[#1877F2] hover:underline">
          View All →
        </a>
      </div>

      {items.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#1a1a2e]">
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-[#8a8a9a]">Platform</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-[#8a8a9a]">Post</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-[#8a8a9a]">Commenter</th>
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
                Page {page + 1} of {totalPages}
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
          No DM activity yet. Connect an account and create an automation to get started.
        </div>
      )}
    </div>
  )
}

// ─── Active automations mini-list ─────────────────────────────────────────────

function ActiveAutomations({ automations }: { automations: AutomationItem[] }) {
  return (
    <div className="glass-card rounded-xl border border-white/10 shadow-sm p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-white">Top Automations</h2>
        <a href="/dashboard/automations" className="text-xs text-[#1877F2] hover:underline">
          Manage all →
        </a>
      </div>
      {automations.length > 0 ? (
        <div className="space-y-3">
          {automations.map((auto) => (
            <div
              key={auto.id}
              className="flex items-center gap-3 p-3 bg-[#1a1a2e] rounded-xl hover:bg-[#22223a] transition-colors"
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 ${
                  auto.platform === 'instagram'
                    ? 'bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]'
                    : 'bg-[#1877F2]'
                }`}
              >
                {auto.platform === 'instagram' ? 'IG' : 'FB'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{auto.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  {auto.keywords.slice(0, 2).map((kw) => (
                    <span
                      key={kw}
                      className="text-[10px] bg-[#DD2A7B]/20 text-[#DD2A7B] border border-[#DD2A7B]/30 px-1.5 py-0.5 rounded-full"
                    >
                      {kw}
                    </span>
                  ))}
                  {auto.keywords.length > 2 && (
                    <span className="text-[10px] text-[#8a8a9a]">+{auto.keywords.length - 2}</span>
                  )}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-white">{auto.total_dms_sent}</p>
                <p className="text-[10px] text-[#8a8a9a]">DMs</p>
              </div>
              {auto.is_active ? (
                <ToggleRight className="w-5 h-5 text-[#22c55e] flex-shrink-0" />
              ) : (
                <ToggleLeft className="w-5 h-5 text-[#5a5a6e] flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="h-32 flex flex-col items-center justify-center text-[#8a8a9a] text-xs gap-2">
          <Zap className="w-8 h-8 text-[#5a5a6e]" />
          <p>No active automations</p>
          <a href="/dashboard/automations" className="text-[#1877F2] hover:underline">
            Create one →
          </a>
        </div>
      )}
    </div>
  )
}

// ─── Quick actions ────────────────────────────────────────────────────────────

function QuickActions() {
  const actions = [
    {
      href: '/dashboard/automations',
      icon: <Plus className="w-5 h-5" />,
      label: 'New Automation',
      className: 'shimmer-btn text-white',
    },
    {
      href: '/dashboard/giveaways',
      icon: <Gift className="w-5 h-5 text-[#22c55e]" />,
      label: 'Create Giveaway',
      className: 'glass-card text-[#22c55e] border border-[#22c55e]/30 hover:bg-[#22c55e]/10',
    },
    {
      href: '/dashboard/analytics',
      icon: <BarChart3 className="w-5 h-5 text-[#1877F2]" />,
      label: 'View Analytics',
      className: 'glass-card text-[#1877F2] border border-[#1877F2]/30 hover:bg-[#1877F2]/10',
    },
    {
      href: '/dashboard/accounts',
      icon: <UserPlus className="w-5 h-5 text-[#8a8a9a]" />,
      label: 'Add Account',
      className: 'glass-card text-[#8a8a9a] border border-white/10 hover:bg-white/10',
    },
  ]

  return (
    <div className="glass-card rounded-xl border border-white/10 shadow-sm p-5 h-full">
      <h2 className="font-semibold text-white mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <motion.a
            key={action.href}
            href={action.href}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl text-center transition-opacity ${action.className}`}
          >
            {action.icon}
            <span className="text-xs font-medium">{action.label}</span>
          </motion.a>
        ))}
      </div>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

interface Props {
  profileName: string
  plan: string
  dmsUsed: number
  dmsLimit: number  // -1 = unlimited
  totalDmsSent: number
  activeAutomations: number
  igAccounts: number
  fbAccounts: number
  chartData: ChartPoint[]
  topPosts: TopPost[]
  recentActivity: ActivityItem[]
  topAutomations: AutomationItem[]
}

export default function DashboardClient({
  profileName,
  plan,
  dmsUsed,
  dmsLimit,
  totalDmsSent,
  activeAutomations,
  igAccounts,
  fbAccounts,
  chartData,
  topPosts,
  recentActivity,
  topAutomations,
}: Props) {
  const isUnlimited = dmsLimit === -1
  const dmsPercent = isUnlimited ? 0 : Math.min((dmsUsed / dmsLimit) * 100, 100)

  const firstName = profileName?.split(' ')[0] || 'there'

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {firstName} 👋
          </h1>
          <p className="text-[#8a8a9a] text-sm mt-0.5">
            Here&apos;s what&apos;s happening with your automations
          </p>
        </div>
        <motion.a
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          href="/dashboard/accounts"
          className="flex items-center gap-2 px-4 py-2 glass-card border border-white/10 rounded-lg text-sm font-medium text-white hover:bg-white/10 transition-colors"
        >
          <Users className="w-4 h-4" />
          Connect Account
        </motion.a>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total DMs */}
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
            {totalDmsSent > 0 && (
              <span className="text-xs text-[#22c55e] font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Active
              </span>
            )}
          </div>
          <div className="text-3xl font-bold text-white">
            <AnimatedNumber value={totalDmsSent} />
          </div>
          <div className="text-sm text-[#8a8a9a] mt-1">Total DMs Sent</div>
        </motion.div>

        {/* DMs This Month */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
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
            {isUnlimited && (
              <span className="text-xs font-medium text-[#22c55e]">Unlimited</span>
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
          {!isUnlimited && (
            <div className="mt-2 h-1.5 bg-[#22223a] rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full transition-all duration-700 ${
                  dmsPercent > 95
                    ? 'bg-[#FA3E3E]'
                    : dmsPercent > 80
                    ? 'bg-[#F7B928]'
                    : 'bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF]'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${dmsPercent}%` }}
                transition={{ duration: 0.7 }}
              />
            </div>
          )}
        </motion.div>

        {/* Active Automations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-xl p-5 border border-white/10 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#22c55e]/20 rounded-lg">
              <BarChart3 className="w-5 h-5 text-[#22c55e]" />
            </div>
            <span className="text-xs text-[#8a8a9a] capitalize">{plan} plan</span>
          </div>
          <div className="text-3xl font-bold text-white">
            <AnimatedNumber value={activeAutomations} />
          </div>
          <div className="text-sm text-[#8a8a9a] mt-1">Active Automations</div>
        </motion.div>

        {/* Accounts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-xl p-5 border border-white/10 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Users className="w-5 h-5 text-[#8a8a9a]" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white">
            <AnimatedNumber value={igAccounts + fbAccounts} />
          </div>
          <div className="text-sm text-[#8a8a9a] mt-1 flex items-center gap-2 flex-wrap">
            {igAccounts > 0 && (
              <span className="text-xs bg-[#DD2A7B]/20 text-[#DD2A7B] border border-[#DD2A7B]/30 px-2 py-0.5 rounded-full">
                IG ×{igAccounts}
              </span>
            )}
            {fbAccounts > 0 && (
              <span className="text-xs bg-[#1877F2]/20 text-[#1877F2] border border-[#1877F2]/30 px-2 py-0.5 rounded-full">
                FB ×{fbAccounts}
              </span>
            )}
            {igAccounts + fbAccounts === 0 && 'No accounts yet'}
          </div>
        </motion.div>
      </div>

      {/* Chart (65%) + Top Posts (35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-[65fr_35fr] gap-5">
        <DMsChart data={chartData} />
        <TopPosts posts={topPosts} />
      </div>

      {/* Active Automations (50%) + Quick Actions (50%) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ActiveAutomations automations={topAutomations} />
        <QuickActions />
      </div>

      {/* Recent Activity (full width) */}
      <RecentActivity items={recentActivity} />
    </div>
  )
}
