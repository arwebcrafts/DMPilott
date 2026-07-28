import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getBioPageByUserId } from '@/lib/db/bioPages'
import {
  getBioBlocksByPageId,
  createBioBlock,
  updateBioBlock,
  deleteBioBlock,
  countBioBlocks,
  countBioBlocksByType,
} from '@/lib/db/bioBlocks'
import { getAuthenticatedUserPlan, getPlanLimits } from '@/lib/bio/planChecks'
import {
  canAddBioBlock,
  canAddBioProduct,
  canUseBioEmailCapture,
} from '@/lib/planGating'
import {
  sanitizeText,
  validateUrl,
  validateBlockType,
} from '@/lib/bio/validation'

async function getOwnedPage(userId: string) {
  const service = createServiceClient()
  const page = await getBioPageByUserId(userId, service)
  return { page, service }
}

export async function GET() {
  try {
    const auth = await getAuthenticatedUserPlan()
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { page, service } = await getOwnedPage(auth.userId)
    if (!page) {
      return NextResponse.json({ error: 'Bio page not found' }, { status: 404 })
    }

    const blocks = await getBioBlocksByPageId(page.id, false, service)
    return NextResponse.json({ blocks })
  } catch (error) {
    console.error('[Bio Blocks GET]', error)
    return NextResponse.json({ error: 'Failed to load blocks' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUserPlan()
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    if (!validateBlockType(body.type)) {
      return NextResponse.json({ error: 'Invalid block type' }, { status: 400 })
    }

    const limits = getPlanLimits(auth.plan)
    const { page, service } = await getOwnedPage(auth.userId)
    if (!page) {
      return NextResponse.json({ error: 'Create a bio page first' }, { status: 404 })
    }

    const blockCount = await countBioBlocks(page.id, service)
    if (!canAddBioBlock(auth.plan, blockCount)) {
      return NextResponse.json(
        { error: `Your plan allows up to ${limits.maxBioBlocks} blocks. Upgrade to add more.` },
        { status: 403 }
      )
    }

    if (body.type === 'email_capture' && !canUseBioEmailCapture(auth.plan)) {
      return NextResponse.json(
        { error: 'Email capture requires Pro plan' },
        { status: 403 }
      )
    }

    if (body.type === 'product') {
      const productCount = await countBioBlocksByType(page.id, 'product', service)
      if (!canAddBioProduct(auth.plan, productCount)) {
        return NextResponse.json(
          { error: `Your plan allows up to ${limits.maxBioProducts} product blocks.` },
          { status: 403 }
        )
      }
    }

    // URL is optional on create — user fills it in the edit modal
    if ((body.type === 'link' || body.type === 'product' || body.type === 'video') && body.url?.trim()) {
      const urlCheck = validateUrl(body.url, false)
      if (!urlCheck.valid) {
        return NextResponse.json({ error: urlCheck.error }, { status: 400 })
      }
    }

    const block = await createBioBlock(
      {
        bio_page_id: page.id,
        type: body.type,
        title: sanitizeText(body.title, 200),
        url: sanitizeText(body.url, 500),
        description: sanitizeText(body.description, 500),
        image_url: sanitizeText(body.image_url, 500),
        price: sanitizeText(body.price, 50),
        metadata: body.metadata || {},
        is_active: body.is_active !== false,
      },
      service
    )

    return NextResponse.json({ block })
  } catch (error) {
    console.error('[Bio Blocks POST]', error)
    return NextResponse.json({ error: 'Failed to create block' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUserPlan()
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    if (!body.id) {
      return NextResponse.json({ error: 'Block ID required' }, { status: 400 })
    }

    const { page, service } = await getOwnedPage(auth.userId)
    if (!page) {
      return NextResponse.json({ error: 'Bio page not found' }, { status: 404 })
    }

    // Verify ownership BEFORE writing. The service client bypasses RLS, so
    // updating first and checking after would let a user modify another user's
    // block — the 403 would arrive only after the write already happened.
    const { getBioBlockById } = await import('@/lib/db/bioBlocks')
    const existing = await getBioBlockById(body.id, service)
    if (!existing || existing.bio_page_id !== page.id) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 })
    }

    const updates: Record<string, unknown> = {}
    if (body.title !== undefined) updates.title = sanitizeText(body.title, 200)
    if (body.url !== undefined) {
      const urlCheck = validateUrl(body.url, false)
      if (!urlCheck.valid) {
        return NextResponse.json({ error: urlCheck.error }, { status: 400 })
      }
      updates.url = sanitizeText(body.url, 500)
    }
    if (body.description !== undefined) updates.description = sanitizeText(body.description, 500)
    if (body.image_url !== undefined) updates.image_url = sanitizeText(body.image_url, 500)
    if (body.price !== undefined) updates.price = sanitizeText(body.price, 50)
    if (body.metadata !== undefined) updates.metadata = body.metadata
    if (body.is_active !== undefined) updates.is_active = Boolean(body.is_active)

    const block = await updateBioBlock(body.id, updates, service)
    return NextResponse.json({ block })
  } catch (error) {
    console.error('[Bio Blocks PATCH]', error)
    return NextResponse.json({ error: 'Failed to update block' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUserPlan()
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Block ID required' }, { status: 400 })
    }

    const { page, service } = await getOwnedPage(auth.userId)
    if (!page) {
      return NextResponse.json({ error: 'Bio page not found' }, { status: 404 })
    }

    const { getBioBlockById } = await import('@/lib/db/bioBlocks')
    const block = await getBioBlockById(id, service)
    if (!block || block.bio_page_id !== page.id) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 })
    }

    await deleteBioBlock(id, service)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Bio Blocks DELETE]', error)
    return NextResponse.json({ error: 'Failed to delete block' }, { status: 500 })
  }
}
