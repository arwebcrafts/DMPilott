import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getBioPageBySlug, addBioSubscriber } from '@/lib/db/bioPages'
import { getBioBlockById } from '@/lib/db/bioBlocks'
import { validateEmail } from '@/lib/bio/validation'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const body = await req.json()
    const email = (body.email || '').trim().toLowerCase()

    if (!validateEmail(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const service = createServiceClient()
    const page = await getBioPageBySlug(slug, true, service)
    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    let blockId: string | null = body.blockId || null
    if (blockId) {
      const block = await getBioBlockById(blockId, service)
      if (!block || block.bio_page_id !== page.id || block.type !== 'email_capture') {
        return NextResponse.json({ error: 'Invalid email block' }, { status: 400 })
      }
    }

    await addBioSubscriber(page.id, email, blockId, service)
    return NextResponse.json({ success: true, message: 'Subscribed successfully' })
  } catch (error) {
    console.error('[Bio Subscribe]', error)
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
  }
}
