import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PLAN_LIMITS } from '@/lib/planGating'
import AnalyticsClient from './AnalyticsClient'

export interface ChartPoint { date: string; instagram: number; facebook: number }
export interface ActivityItem {
  id: string
  post_id: string | null
  commenter_username: string | null
  keyword_matched: string | null
  platform: string
  status: string
  created_at: string
  automation_name: string | null
  error_message: string | null
}
export interface AutomationStats {
  id: string
  name: string
  platform: string
  total_dms_sent: number
  success_rate: number
}

export default async function AnalyticsDataFetcher() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)

  const [
    { data: profile },
    { count: totalDmsSent },
    { count: totalDmsFailed },
    { data: dmsRaw },
    { data: allActivityRaw },
    { data: automationStatsRaw },
  ] = await Promise.all([
    supabase.from('users').select('full_name, plan, dms_used_this_month').eq('id', user.id).single(),
    supabase.from('dm_logs').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'sent'),
    supabase.from('dm_logs').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'failed'),
    supabase.from('dm_logs').select('created_at, platform, post_id, status').eq('user_id', user.id).gte('created_at', ninetyDaysAgo.toISOString()).limit(5000),
    supabase.from('dm_logs').select('id, post_id, commenter_username, keyword_matched, platform, status, created_at, error_message, automations(name)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(2000),
    supabase.from('automations').select('id, name, platform, total_dms_sent').eq('user_id', user.id),
  ])

  const plan = ((profile?.plan as string) || 'free') as keyof typeof PLAN_LIMITS
  const rawLimit = PLAN_LIMITS[plan].dmsPerMonth
  const dmsUsed = profile?.dms_used_this_month || 0
  const dmsLimit = rawLimit === Infinity ? -1 : rawLimit

  // Build 90-day chart data
  const dmsByDay: Record<string, { instagram: number; facebook: number; failed: number }> = {}
  dmsRaw?.forEach((dm: any) => {
    const day = (dm.created_at as string).split('T')[0]
    if (!dmsByDay[day]) dmsByDay[day] = { instagram: 0, facebook: 0, failed: 0 }
    if (dm.status === 'failed') {
      dmsByDay[day].failed++
    } else if (dm.platform === 'instagram') {
      dmsByDay[day].instagram++
    } else {
      dmsByDay[day].facebook++
    }
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

  const allActivity: ActivityItem[] = (allActivityRaw || []).map((dm: any) => ({
    id: dm.id,
    post_id: dm.post_id ?? null,
    commenter_username: dm.commenter_username ?? null,
    keyword_matched: dm.keyword_matched ?? null,
    platform: dm.platform,
    status: dm.status,
    created_at: dm.created_at,
    automation_name: dm.automations?.name ?? null,
    error_message: dm.error_message ?? null,
  }))

  // Calculate automation success rates
  const automationStats: AutomationStats[] = (automationStatsRaw || []).map((auto: any) => {
    const autoDms = allActivity.filter(a => a.automation_name === auto.name)
    const successCount = autoDms.filter(a => a.status === 'sent').length
    const successRate = autoDms.length > 0 ? (successCount / autoDms.length) * 100 : 100
    return {
      id: auto.id,
      name: auto.name,
      platform: auto.platform,
      total_dms_sent: auto.total_dms_sent || 0,
      success_rate: Math.round(successRate),
    }
  })

  return (
    <AnalyticsClient
      profileName={profile?.full_name || ''}
      plan={plan}
      dmsUsed={dmsUsed}
      dmsLimit={dmsLimit}
      totalDmsSent={totalDmsSent || 0}
      totalDmsFailed={totalDmsFailed || 0}
      chartData={chartData}
      allActivity={allActivity}
      automationStats={automationStats}
    />
  )
}
