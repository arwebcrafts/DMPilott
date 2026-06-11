import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getBioPageByUserId, getBioAnalytics } from '@/lib/db/bioPages'
import { getBioBlocksByPageId } from '@/lib/db/bioBlocks'
import { getAuthenticatedUserPlan, getPlanLimits } from '@/lib/bio/planChecks'

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUserPlan()
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const daysParam = req.nextUrl.searchParams.get('days')
    const days = daysParam ? parseInt(daysParam, 10) : getPlanLimits(auth.plan).analyticsDays
    const limits = getPlanLimits(auth.plan)
    const effectiveDays = Math.min(days, limits.analyticsDays)

    const service = createServiceClient()
    const page = await getBioPageByUserId(auth.userId, service)
    if (!page) {
      return NextResponse.json({ error: 'Bio page not found' }, { status: 404 })
    }

    const analytics = await getBioAnalytics(page.id, effectiveDays, service)
    const blocks = await getBioBlocksByPageId(page.id, false, service)

    const blockStats = blocks
      .filter((b) => b.type === 'link' || b.type === 'product')
      .map((b) => ({
        id: b.id,
        title: b.title,
        type: b.type,
        clicks: analytics.blockClicks[b.id] || 0,
        totalClicks: b.click_count,
      }))
      .sort((a, b) => b.clicks - a.clicks)

    return NextResponse.json({
      analytics: {
        ...analytics,
        periodDays: effectiveDays,
        blockStats,
      },
    })
  } catch (error) {
    console.error('[Bio Analytics GET]', error)
    return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 })
  }
}
