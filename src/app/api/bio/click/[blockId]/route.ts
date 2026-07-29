import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import {
  getBioBlockById,
  incrementBlockClickCount,
} from '@/lib/db/bioBlocks'
import { getBioPageById, recordBioClick } from '@/lib/db/bioPages'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ blockId: string }> }
) {
  try {
    const { blockId } = await params
    const service = createServiceClient()
    const block = await getBioBlockById(blockId, service)

    if (!block || !block.is_active) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }

    if (block.type !== 'link' && block.type !== 'product') {
      return NextResponse.json({ error: 'Invalid block type' }, { status: 400 })
    }

    if (!block.url) {
      return NextResponse.json({ error: 'No URL configured' }, { status: 400 })
    }

    // Defense in depth: only ever redirect to http(s), regardless of how the
    // row was stored. Blocks javascript:/data: and other unsafe schemes.
    let target: URL
    try {
      target = new URL(block.url)
      if (target.protocol !== 'http:' && target.protocol !== 'https:') {
        throw new Error('unsafe protocol')
      }
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }

    const page = await getBioPageById(block.bio_page_id, service)
    if (!page || !page.is_published) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    const referrer = req.headers.get('referer') || undefined
    const userAgent = req.headers.get('user-agent') || undefined

    await recordBioClick(page.id, blockId, 'click', { referrer, userAgent }, service)
    await incrementBlockClickCount(blockId, service)

    return NextResponse.redirect(target.toString(), 302)
  } catch (error) {
    console.error('[Bio Click]', error)
    return NextResponse.json({ error: 'Redirect failed' }, { status: 500 })
  }
}
