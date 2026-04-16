import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PLAN_LIMITS } from '@/lib/planGating'
import DashboardClient from './DashboardClient'

export interface ChartPoint { date: string; instagram: number; facebook: number }
export interface TopPost { post_id: string; platform: string; count: number }
export interface ActivityItem {
  id: string
  post_id: string | null
  commenter_username: string | null
  keyword_matched: string | null
  platform: string
  status: string
  created_at: string
  automation_name: string | null
}
export interface AutomationItem {
  id: string
  name: string
  platform: string
  keywords: string[]
  total_dms_sent: number
  is_active: boolean
}

export default async function DashboardDataFetcher() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)

  const [
    { data: profile },
    { count: totalDmsSent },
    { count: activeAutomations },
    { data: accounts },
    { data: dmsRaw },
    { data: recentRaw },
    { data: topAutomationsRaw },
  ] = await Promise.all([
    supabase.from('users').select('full_name, plan, dms_used_this_month').eq('id', user.id).single(),
    supabase.from('dm_logs').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'sent'),
    supabase.from('automations').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_active', true),
    supabase.from('connected_accounts').select('platform').eq('user_id', user.id).eq('is_active', true),
    supabase.from('dm_logs').select('created_at, platform, post_id').eq('user_id', user.id).eq('status', 'sent').gte('created_at', ninetyDaysAgo.toISOString()).limit(2000),
    supabase.from('dm_logs').select('id, post_id, commenter_username, keyword_matched, platform, status, created_at, automations(name)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
    supabase.from('automations').select('id, name, platform, keywords, total_dms_sent, is_active').eq('user_id', user.id).eq('is_active', true).order('total_dms_sent', { ascending: false }).limit(3),
  ])

  const plan = ((profile?.plan as string) || 'free') as keyof typeof PLAN_LIMITS
  const rawLimit = PLAN_LIMITS[plan].dmsPerMonth
  const dmsUsed = profile?.dms_used_this_month || 0
  // Infinity is not serializable — use -1 to represent "unlimited"
  const dmsLimit = rawLimit === Infinity ? -1 : rawLimit
  const igAccounts = accounts?.filter((a: any) => a.platform === 'instagram').length || 0
  const fbAccounts = accounts?.filter((a: any) => a.platform === 'facebook').length || 0

  // Build 90-day chart data (fill missing days with 0)
  const dmsByDay: Record<string, { instagram: number; facebook: number }> = {}
  dmsRaw?.forEach((dm: any) => {
    const day = (dm.created_at as string).split('T')[0]
    if (!dmsByDay[day]) dmsByDay[day] = { instagram: 0, facebook: 0 }
    if (dm.platform === 'instagram') dmsByDay[day].instagram++
    else dmsByDay[day].facebook++
  })

  const chartData: ChartPoint[] = []
  for (let i = 89; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    const dateStr = d.toISOString().split('T')[0]
    chartData.push({
      date: dateStr,
      instagram: dmsByDay[dateStr]?.instagram || 0,
      facebook: dmsByDay[dateStr]?.facebook || 0,
    })
  }

  // Top 5 posts by DM count
  const postMap: Record<string, { platform: string; count: number }> = {}
  dmsRaw?.forEach((dm: any) => {
    if (!dm.post_id) return
    const key = dm.post_id as string
    if (!postMap[key]) postMap[key] = { platform: dm.platform, count: 0 }
    postMap[key].count++
  })
  const topPosts: TopPost[] = Object.entries(postMap)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 5)
    .map(([post_id, d]) => ({ post_id, ...d }))

  const recentActivity: ActivityItem[] = (recentRaw || []).map((dm: any) => ({
    id: dm.id,
    post_id: dm.post_id ?? null,
    commenter_username: dm.commenter_username ?? null,
    keyword_matched: dm.keyword_matched ?? null,
    platform: dm.platform,
    status: dm.status,
    created_at: dm.created_at,
    automation_name: dm.automations?.name ?? null,
  }))

  const topAutomations: AutomationItem[] = (topAutomationsRaw || []).map((a: any) => ({
    id: a.id,
    name: a.name,
    platform: a.platform,
    keywords: a.keywords || [],
    total_dms_sent: a.total_dms_sent || 0,
    is_active: a.is_active,
  }))

  return (
    <DashboardClient
      profileName={profile?.full_name || ''}
      plan={plan}
      dmsUsed={dmsUsed}
      dmsLimit={dmsLimit}
      totalDmsSent={totalDmsSent || 0}
      activeAutomations={activeAutomations || 0}
      igAccounts={igAccounts}
      fbAccounts={fbAccounts}
      chartData={chartData}
      topPosts={topPosts}
      recentActivity={recentActivity}
      topAutomations={topAutomations}
    />
  )
}
