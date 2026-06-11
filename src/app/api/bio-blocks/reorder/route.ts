import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getBioPageByUserId } from '@/lib/db/bioPages'
import { reorderBioBlocks } from '@/lib/db/bioBlocks'
import { getAuthenticatedUserPlan } from '@/lib/bio/planChecks'

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUserPlan()
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const blockIds = body.blockIds as string[]
    if (!Array.isArray(blockIds) || blockIds.length === 0) {
      return NextResponse.json({ error: 'blockIds array required' }, { status: 400 })
    }

    const service = createServiceClient()
    const page = await getBioPageByUserId(auth.userId, service)
    if (!page) {
      return NextResponse.json({ error: 'Bio page not found' }, { status: 404 })
    }

    await reorderBioBlocks(page.id, blockIds, service)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Bio Blocks Reorder]', error)
    return NextResponse.json({ error: 'Failed to reorder blocks' }, { status: 500 })
  }
}
