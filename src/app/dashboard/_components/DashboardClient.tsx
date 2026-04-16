'use client'

import { useEffect, useMemo, useState } from 'react'
import { animate } from 'framer-motion'
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
    <div className="bg-white border border-[#E4E6EA] rounded-xl shadow-md p-3 text-xs">
      <p className="text-[#65676B] font-medium mb-2">{label}</p>
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
    <div className="bg-white rounded-xl border border-[#E4E6EA] shadow-sm p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold text-[#1C1E21]">DMs Over Time</h2>
          <p className="text-xs text-[#65676B] mt-0.5">Instagram + Facebook combined</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 text-xs text-[#65676B]">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E1306C]" /> IG
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1877F2]" /> FB
            </span>
          </div>
          <div className="flex rounded-lg overflow-hidden border border-[#E4E6EA]">
            {(['7D', '30D', '90D'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1 text-xs font-medium transition-colors ${
                  tab === t
                    ? 'bg-[#1877F2] text-white'
                    : 'bg-white text-[#65676B] hover:bg-[#F0F2F5]'
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
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F5" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: '#65676B' }}
              axisLine={false}
              tickLine={false}
              interval={tab === '90D' ? 14 : tab === '30D' ? 6 : 0}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#65676B' }}
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
        <div className="h-[220px] flex flex-col items-center justify-center text-[#65676B] text-sm gap-2">
          <BarChart2 className="w-10 h-10 text-[#CED0D4]" />
          <p>No DM data for this period yet</p>
        </div>
      )}
    </div>
  )
}

// ─── Top posts ────────────────────────────────────────────────────────────────

function TopPosts({ posts }: { posts: TopPost[] }) {
  return (
    <div className="bg-white rounded-xl border border-[#E4E6EA] shadow-sm p-5 h-full">
      <h2 className="font-semibold text-[#1C1E21] mb-4">Top Performing Posts</h2>
      {posts.length > 0 ? (
        <div className="space-y-3">
          {posts.map((post, i) => (
            <div key={post.post_id} className="flex items-center gap-3">
              <span className="text-xs font-bold text-[#65676B] w-4">{i + 1}</span>
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
                <p className="text-xs font-medium text-[#1C1E21] truncate font-mono">
                  {post.post_id.slice(0, 16)}…
                </p>
                <p className="text-[10px] text-[#65676B] capitalize">{post.platform}</p>
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
        <div className="h-32 flex flex-col items-center justify-center text-[#65676B] text-xs gap-2">
          <TrendingUp className="w-8 h-8 text-[#CED0D4]" />
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
    <div className="bg-white rounded-xl border border-[#E4E6EA] shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0F2F5]">
        <h2 className="font-semibold text-[#1C1E21]">Recent DM Activity</h2>
        <a href="/dashboard/analytics" className="text-xs text-[#1877F2] hover:underline">
          View All →
        </a>
      </div>

      {items.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F7F8FA]">
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-[#65676B]">Platform</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-[#65676B]">Post</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-[#65676B]">Commenter</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-[#65676B]">Keyword</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-[#65676B]">Status</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-[#65676B]">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F2F5]">
                {pageItems.map((dm) => (
                  <tr key={dm.id} className="hover:bg-[#F9FAFB] transition-colors">
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
                    <td className="px-4 py-3 text-[#65676B] font-mono text-xs">
                      {dm.post_id ? `${dm.post_id.slice(0, 12)}…` : '—'}
                    </td>
                    <td className="px-4 py-3 font-medium text-[#1C1E21]">
                      @{dm.commenter_username || 'unknown'}
                    </td>
                    <td className="px-4 py-3">
                      {dm.keyword_matched ? (
                        <span className="text-xs bg-[#FDE8F0] text-[#E1306C] px-2 py-0.5 rounded-full font-medium">
                          {dm.keyword_matched}
                        </span>
                      ) : (
                        <span className="text-[#65676B] text-xs">any</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                          dm.status === 'sent'
                            ? 'bg-[#E8F5E9] text-[#31A24C]'
                            : dm.status === 'queued'
                            ? 'bg-[#FEF9E7] text-[#F7B928]'
                            : 'bg-[#FDECEA] text-[#FA3E3E]'
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
                    <td className="px-4 py-3 text-xs text-[#65676B] whitespace-nowrap">
                      {formatDistanceToNow(new Date(dm.created_at), { addSuffix: true })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-[#F0F2F5]">
              <span className="text-xs text-[#65676B]">
                Page {page + 1} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-[#CED0D4] rounded-lg text-[#1C1E21] hover:bg-[#F0F2F5] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-[#CED0D4] rounded-lg text-[#1C1E21] hover:bg-[#F0F2F5] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="p-10 text-center text-[#65676B] text-sm">
          No DM activity yet. Connect an account and create an automation to get started.
        </div>
      )}
    </div>
  )
}

// ─── Active automations mini-list ─────────────────────────────────────────────

function ActiveAutomations({ automations }: { automations: AutomationItem[] }) {
  return (
    <div className="bg-white rounded-xl border border-[#E4E6EA] shadow-sm p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-[#1C1E21]">Top Automations</h2>
        <a href="/dashboard/automations" className="text-xs text-[#1877F2] hover:underline">
          Manage all →
        </a>
      </div>
      {automations.length > 0 ? (
        <div className="space-y-3">
          {automations.map((auto) => (
            <div
              key={auto.id}
              className="flex items-center gap-3 p-3 bg-[#F7F8FA] rounded-xl"
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
                <p className="text-sm font-medium text-[#1C1E21] truncate">{auto.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  {auto.keywords.slice(0, 2).map((kw) => (
                    <span
                      key={kw}
                      className="text-[10px] bg-[#FDE8F0] text-[#E1306C] px-1.5 py-0.5 rounded-full"
                    >
                      {kw}
                    </span>
                  ))}
                  {auto.keywords.length > 2 && (
                    <span className="text-[10px] text-[#65676B]">+{auto.keywords.length - 2}</span>
                  )}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-[#1C1E21]">{auto.total_dms_sent}</p>
                <p className="text-[10px] text-[#65676B]">DMs</p>
              </div>
              {auto.is_active ? (
                <ToggleRight className="w-5 h-5 text-[#31A24C] flex-shrink-0" />
              ) : (
                <ToggleLeft className="w-5 h-5 text-[#CED0D4] flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="h-32 flex flex-col items-center justify-center text-[#65676B] text-xs gap-2">
          <Zap className="w-8 h-8 text-[#CED0D4]" />
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
      className: 'bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white',
    },
    {
      href: '/dashboard/giveaways',
      icon: <Gift className="w-5 h-5 text-[#31A24C]" />,
      label: 'Create Giveaway',
      className: 'bg-[#E8F5E9] text-[#31A24C] hover:bg-[#d4edda]',
    },
    {
      href: '/dashboard/analytics',
      icon: <BarChart3 className="w-5 h-5 text-[#1877F2]" />,
      label: 'View Analytics',
      className: 'bg-[#E7F0FD] text-[#1877F2] hover:bg-[#d4e5f7]',
    },
    {
      href: '/dashboard/accounts',
      icon: <UserPlus className="w-5 h-5 text-[#65676B]" />,
      label: 'Add Account',
      className: 'bg-[#F0F2F5] text-[#65676B] hover:bg-[#E4E6EA]',
    },
  ]

  return (
    <div className="bg-white rounded-xl border border-[#E4E6EA] shadow-sm p-5 h-full">
      <h2 className="font-semibold text-[#1C1E21] mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <a
            key={action.href}
            href={action.href}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl text-center transition-opacity hover:opacity-90 ${action.className}`}
          >
            {action.icon}
            <span className="text-xs font-medium">{action.label}</span>
          </a>
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
          <h1 className="text-2xl font-bold text-[#1C1E21]">
            Welcome back, {firstName} 👋
          </h1>
          <p className="text-[#65676B] text-sm mt-0.5">
            Here&apos;s what&apos;s happening with your automations
          </p>
        </div>
        <a
          href="/dashboard/accounts"
          className="flex items-center gap-2 px-4 py-2 bg-white border border-[#CED0D4] rounded-lg text-sm font-medium text-[#1C1E21] hover:bg-[#F0F2F5] transition-colors"
        >
          <Users className="w-4 h-4" />
          Connect Account
        </a>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total DMs */}
        <div className="bg-white rounded-xl p-5 border border-[#E4E6EA] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#FDE8F0] rounded-lg">
              <Zap className="w-5 h-5 text-[#E1306C]" />
            </div>
            {totalDmsSent > 0 && (
              <span className="text-xs text-[#31A24C] font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Active
              </span>
            )}
          </div>
          <div className="text-3xl font-bold text-[#1C1E21]">
            <AnimatedNumber value={totalDmsSent} />
          </div>
          <div className="text-sm text-[#65676B] mt-1">Total DMs Sent</div>
        </div>

        {/* DMs This Month */}
        <div className="bg-white rounded-xl p-5 border border-[#E4E6EA] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#E7F0FD] rounded-lg">
              <Clock className="w-5 h-5 text-[#1877F2]" />
            </div>
            {!isUnlimited && (
              <span
                className={`text-xs font-medium ${
                  dmsPercent > 95
                    ? 'text-[#FA3E3E]'
                    : dmsPercent > 80
                    ? 'text-[#F7B928]'
                    : 'text-[#65676B]'
                }`}
              >
                {dmsPercent.toFixed(0)}% used
              </span>
            )}
            {isUnlimited && (
              <span className="text-xs font-medium text-[#31A24C]">Unlimited</span>
            )}
          </div>
          <div className="text-3xl font-bold text-[#1C1E21]">
            <AnimatedNumber value={dmsUsed} />
            {!isUnlimited && (
              <span className="text-base text-[#65676B] font-normal">
                /{dmsLimit.toLocaleString()}
              </span>
            )}
          </div>
          <div className="text-sm text-[#65676B] mt-1">DMs This Month</div>
          {!isUnlimited && (
            <div className="mt-2 h-1.5 bg-[#F0F2F5] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  dmsPercent > 95
                    ? 'bg-[#FA3E3E]'
                    : dmsPercent > 80
                    ? 'bg-[#F7B928]'
                    : 'bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF]'
                }`}
                style={{ width: `${dmsPercent}%` }}
              />
            </div>
          )}
        </div>

        {/* Active Automations */}
        <div className="bg-white rounded-xl p-5 border border-[#E4E6EA] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#E8F5E9] rounded-lg">
              <BarChart3 className="w-5 h-5 text-[#31A24C]" />
            </div>
            <span className="text-xs text-[#65676B] capitalize">{plan} plan</span>
          </div>
          <div className="text-3xl font-bold text-[#1C1E21]">
            <AnimatedNumber value={activeAutomations} />
          </div>
          <div className="text-sm text-[#65676B] mt-1">Active Automations</div>
        </div>

        {/* Accounts */}
        <div className="bg-white rounded-xl p-5 border border-[#E4E6EA] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#F0F2F5] rounded-lg">
              <Users className="w-5 h-5 text-[#65676B]" />
            </div>
          </div>
          <div className="text-3xl font-bold text-[#1C1E21]">
            <AnimatedNumber value={igAccounts + fbAccounts} />
          </div>
          <div className="text-sm text-[#65676B] mt-1 flex items-center gap-2 flex-wrap">
            {igAccounts > 0 && (
              <span className="text-xs bg-[#FDE8F0] text-[#E1306C] px-2 py-0.5 rounded-full">
                IG ×{igAccounts}
              </span>
            )}
            {fbAccounts > 0 && (
              <span className="text-xs bg-[#E7F0FD] text-[#1877F2] px-2 py-0.5 rounded-full">
                FB ×{fbAccounts}
              </span>
            )}
            {igAccounts + fbAccounts === 0 && 'No accounts yet'}
          </div>
        </div>
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
