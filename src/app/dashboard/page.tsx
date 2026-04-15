import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PLAN_LIMITS } from '@/lib/planGating'
import { AreaChart, BarChart3, Users, Zap, TrendingUp, Clock, CheckCircle2, XCircle } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch stats
  const { count: totalDMs } = await supabase
    .from('dm_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'sent')

  const { count: activeAutomations } = await supabase
    .from('automations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_active', true)

  const { data: accounts } = await supabase
    .from('connected_accounts')
    .select('platform, is_active')
    .eq('user_id', user.id)
    .eq('is_active', true)

  // Fetch recent DM activity
  const { data: recentDMs } = await supabase
    .from('dm_logs')
    .select('*, automations(name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Fetch DMs over last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: dmsOverTime } = await supabase
    .from('dm_logs')
    .select('created_at, platform, status')
    .eq('user_id', user.id)
    .eq('status', 'sent')
    .gte('created_at', thirtyDaysAgo.toISOString())

  const plan = (profile?.plan || 'free') as keyof typeof PLAN_LIMITS
  const planLimits = PLAN_LIMITS[plan]
  const dmsUsed = profile?.dms_used_this_month || 0
  const dmsLimit = planLimits.dmsPerMonth
  const dmsPercent = dmsLimit === Infinity ? 0 : (dmsUsed / dmsLimit) * 100

  // Group DMs by day
  const dmsByDay: Record<string, { instagram: number; facebook: number }> = {}
  dmsOverTime?.forEach((dm: any) => {
    const day = dm.created_at.split('T')[0]
    if (!dmsByDay[day]) dmsByDay[day] = { instagram: 0, facebook: 0 }
    const platform = dm.platform as 'instagram' | 'facebook'
    dmsByDay[day][platform]++
  })

  const recentDays = Object.entries(dmsByDay).slice(-7).map(([day, counts]) => ({
    day: new Date(day).toLocaleDateString('en-US', { weekday: 'short' }),
    ...counts,
  }))

  const igAccounts = accounts?.filter(a => a.platform === 'instagram').length || 0
  const fbAccounts = accounts?.filter(a => a.platform === 'facebook').length || 0

  return (
    <div className="space-y-6">
      {/* Welcome bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1E21]">
            Good morning, {profile?.full_name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="text-[#65676B] text-sm">Here&apos;s what&apos;s happening with your automations</p>
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
        <div className="bg-white rounded-xl p-5 shadow-sm border border-[#E4E6EA]">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#FDE8F0] rounded-lg">
              <Zap className="w-5 h-5 text-[#E1306C]" />
            </div>
            <span className="text-xs text-[#31A24C] font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +12%
            </span>
          </div>
          <div className="text-3xl font-bold text-[#1C1E21]">{totalDMs?.toLocaleString() || 0}</div>
          <div className="text-sm text-[#65676B]">Total DMs Sent</div>
        </div>

        {/* DMs This Month */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-[#E4E6EA]">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#E7F0FD] rounded-lg">
              <Clock className="w-5 h-5 text-[#1877F2]" />
            </div>
            {dmsLimit !== Infinity && (
              <span className={`text-xs font-medium ${
                dmsPercent > 95 ? 'text-[#FA3E3E]' :
                dmsPercent > 80 ? 'text-[#F7B928]' :
                'text-[#65676B]'
              }`}>
                {dmsPercent.toFixed(0)}% used
              </span>
            )}
          </div>
          <div className="text-3xl font-bold text-[#1C1E21]">
            {dmsUsed.toLocaleString()}
            <span className="text-lg text-[#65676B] font-normal">
              /{dmsLimit === Infinity ? '∞' : dmsLimit.toLocaleString()}
            </span>
          </div>
          <div className="text-sm text-[#65676B]">DMs This Month</div>
          {dmsLimit !== Infinity && (
            <div className="mt-2 h-1.5 bg-[#F0F2F5] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  dmsPercent > 95 ? 'bg-[#FA3E3E]' :
                  dmsPercent > 80 ? 'bg-[#F7B928]' :
                  'bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF]'
                }`}
                style={{ width: `${Math.min(dmsPercent, 100)}%` }}
              />
            </div>
          )}
        </div>

        {/* Active Automations */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-[#E4E6EA]">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#E8F5E9] rounded-lg">
              <BarChart3 className="w-5 h-5 text-[#31A24C]" />
            </div>
          </div>
          <div className="text-3xl font-bold text-[#1C1E21]">{activeAutomations || 0}</div>
          <div className="text-sm text-[#65676B]">Active Automations</div>
        </div>

        {/* Accounts */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-[#E4E6EA]">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#F0F2F5] rounded-lg">
              <Users className="w-5 h-5 text-[#65676B]" />
            </div>
          </div>
          <div className="text-3xl font-bold text-[#1C1E21]">{igAccounts + fbAccounts}</div>
          <div className="text-sm text-[#65676B] flex items-center gap-2">
            {igAccounts > 0 && (
              <span className="text-xs bg-[#FDE8F0] text-[#E1306C] px-2 py-0.5 rounded-full">
                IG {igAccounts}✓
              </span>
            )}
            {fbAccounts > 0 && (
              <span className="text-xs bg-[#E7F0FD] text-[#1877F2] px-2 py-0.5 rounded-full">
                FB {fbAccounts}✓
              </span>
            )}
            {igAccounts + fbAccounts === 0 && 'No accounts yet'}
          </div>
        </div>
      </div>

      {/* Chart + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* DMs Over Time */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-[#E4E6EA]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#1C1E21]">DMs Sent — Last 7 Days</h2>
            <div className="flex gap-4 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-[#E1306C]" /> Instagram
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-[#1877F2]" /> Facebook
              </span>
            </div>
          </div>
          {recentDays.length > 0 ? (
            <div className="flex items-end gap-2 h-40">
              {recentDays.map((day, i) => {
                const maxIg = Math.max(...recentDays.map(d => d.instagram), 1)
                const maxFb = Math.max(...recentDays.map(d => d.facebook), 1)
                const max = Math.max(maxIg, maxFb)
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col-reverse gap-0.5" style={{ height: '120px' }}>
                      <div
                        className="w-full bg-[#E1306C] rounded-t opacity-80"
                        style={{ height: `${(day.instagram / max) * 100}%`, minHeight: day.instagram > 0 ? '4px' : '0' }}
                      />
                      <div
                        className="w-full bg-[#1877F2] rounded-t opacity-80"
                        style={{ height: `${(day.facebook / max) * 100}%`, minHeight: day.facebook > 0 ? '4px' : '0' }}
                      />
                    </div>
                    <span className="text-xs text-[#65676B]">{day.day}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-[#65676B] text-sm">
              No DM data yet. Connect an account and create your first automation!
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-[#E4E6EA]">
          <h2 className="font-semibold text-[#1C1E21] mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <a
              href="/dashboard/automations"
              className="flex flex-col items-center gap-2 p-4 bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] rounded-lg text-white text-center"
            >
              <span className="text-2xl">⚡</span>
              <span className="text-xs font-medium">New Automation</span>
            </a>
            <a
              href="/dashboard/giveaways"
              className="flex flex-col items-center gap-2 p-4 bg-[#E8F5E9] rounded-lg text-center hover:bg-[#d4edda] transition-colors"
            >
              <span className="text-2xl">🎁</span>
              <span className="text-xs font-medium text-[#31A24C]">Create Giveaway</span>
            </a>
            <a
              href="/dashboard/analytics"
              className="flex flex-col items-center gap-2 p-4 bg-[#E7F0FD] rounded-lg text-center hover:bg-[#d4e5f7] transition-colors"
            >
              <span className="text-2xl">📊</span>
              <span className="text-xs font-medium text-[#1877F2]">View Analytics</span>
            </a>
            <a
              href="/dashboard/accounts"
              className="flex flex-col items-center gap-2 p-4 bg-[#F0F2F5] rounded-lg text-center hover:bg-[#E4E6EA] transition-colors"
            >
              <span className="text-2xl">👥</span>
              <span className="text-xs font-medium text-[#65676B]">Add Account</span>
            </a>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E4E6EA]">
        <div className="flex items-center justify-between p-5 border-b border-[#F0F2F5]">
          <h2 className="font-semibold text-[#1C1E21]">Recent DM Activity</h2>
          <a href="/dashboard/analytics" className="text-sm text-[#1877F2] hover:underline">View All →</a>
        </div>
        {recentDMs && recentDMs.length > 0 ? (
          <div className="divide-y divide-[#F0F2F5]">
            {recentDMs.map((dm: any) => (
              <div key={dm.id} className="flex items-center gap-4 p-4 hover:bg-[#F9F9F9]">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                  dm.platform === 'instagram' ? 'bg-[#E1306C]' : 'bg-[#1877F2]'
                }`}>
                  {dm.platform === 'instagram' ? 'IG' : 'FB'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#1C1E21] truncate">
                    @{dm.commenter_username || 'unknown'}
                  </div>
                  <div className="text-xs text-[#65676B]">
                    via {dm.automations?.name || 'automation'} · {dm.keyword_matched ? `Keyword: ${dm.keyword_matched}` : dm.post_id}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                    dm.status === 'sent' ? 'bg-[#E8F5E9] text-[#31A24C]' :
                    dm.status === 'queued' ? 'bg-[#FEF9E7] text-[#F7B928]' :
                    'bg-[#FDECEA] text-[#FA3E3E]'
                  }`}>
                    {dm.status === 'sent' ? <CheckCircle2 className="w-3 h-3" /> :
                     dm.status === 'queued' ? <Clock className="w-3 h-3" /> :
                     <XCircle className="w-3 h-3" />}
                    {dm.status}
                  </span>
                  <span className="text-xs text-[#65676B]">
                    {new Date(dm.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-[#65676B] text-sm">
            No DM activity yet. Connect an Instagram or Facebook account and create an automation to get started.
          </div>
        )}
      </div>
    </div>
  )
}
