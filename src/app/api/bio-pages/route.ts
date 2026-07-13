import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import {
  getBioPageByUserId,
  createBioPage,
  updateBioPage,
  isSlugAvailable,
} from '@/lib/db/bioPages'
import { getBioBlocksByPageId } from '@/lib/db/bioBlocks'
import { getAuthenticatedUserPlan, getPlanLimits } from '@/lib/bio/planChecks'
import {
  normalizeSlug,
  validateSlug,
  sanitizeText,
  validateSocialLinks,
  validateTheme,
} from '@/lib/bio/validation'
import { DEFAULT_BIO_THEME } from '@/lib/bio/types'

export async function GET() {
  try {
    const auth = await getAuthenticatedUserPlan()
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const service = createServiceClient()
    const page = await getBioPageByUserId(auth.userId, service)
    if (!page) {
      return NextResponse.json({ page: null, blocks: [] })
    }

    const blocks = await getBioBlocksByPageId(page.id, false, service)
    return NextResponse.json({ page, blocks })
  } catch (error) {
    console.error('[Bio Pages GET]', error)
    return NextResponse.json({ error: 'Failed to load bio page' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUserPlan()
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const slugInput = normalizeSlug(body.slug || '')
    const slugCheck = validateSlug(slugInput)
    if (!slugCheck.valid) {
      return NextResponse.json({ error: slugCheck.error }, { status: 400 })
    }

    const service = createServiceClient()
    const existing = await getBioPageByUserId(auth.userId, service)
    if (existing) {
      return NextResponse.json({ error: 'Bio page already exists' }, { status: 409 })
    }

    const available = await isSlugAvailable(slugInput, auth.userId, service)
    if (!available) {
      return NextResponse.json({ error: 'Slug is already taken' }, { status: 409 })
    }

    const page = await createBioPage(
      {
        user_id: auth.userId,
        slug: slugInput,
        display_name: sanitizeText(body.display_name, 100),
        bio: sanitizeText(body.bio, 500),
        avatar_url: sanitizeText(body.avatar_url, 500),
        theme: DEFAULT_BIO_THEME,
        social_links: [],
        is_published: false,
      },
      service
    )

    return NextResponse.json({ page })
  } catch (error) {
    console.error('[Bio Pages POST]', error)
    const message = error instanceof Error ? error.message : 'Failed to create bio page'
    if (message.includes('bio_pages') && message.includes('does not exist')) {
      return NextResponse.json(
        { error: 'Bio pages database is not set up. Run migration 010_bio_pages.sql in Supabase.' },
        { status: 503 }
      )
    }
    if (message.includes('duplicate key') || message.includes('unique constraint')) {
      return NextResponse.json({ error: 'You already have a bio page or this username is taken.' }, { status: 409 })
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUserPlan()
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const service = createServiceClient()
    const page = await getBioPageByUserId(auth.userId, service)
    if (!page) {
      return NextResponse.json({ error: 'Bio page not found' }, { status: 404 })
    }

    const limits = getPlanLimits(auth.plan)
    const updates: Record<string, unknown> = {}

    if (body.slug !== undefined) {
      const slugInput = normalizeSlug(body.slug)
      const slugCheck = validateSlug(slugInput)
      if (!slugCheck.valid) {
        return NextResponse.json({ error: slugCheck.error }, { status: 400 })
      }
      const available = await isSlugAvailable(slugInput, auth.userId, service)
      if (!available) {
        return NextResponse.json({ error: 'Slug is already taken' }, { status: 409 })
      }
      updates.slug = slugInput
    }

    if (body.display_name !== undefined) {
      updates.display_name = sanitizeText(body.display_name, 100)
    }
    if (body.bio !== undefined) {
      updates.bio = sanitizeText(body.bio, 500)
    }
    if (body.avatar_url !== undefined) {
      updates.avatar_url = sanitizeText(body.avatar_url, 500)
    }
    if (body.is_published !== undefined) {
      updates.is_published = Boolean(body.is_published)
    }
    if (body.theme !== undefined) {
      const theme = validateTheme(body.theme)
      const allowedPresets = ['minimal', 'gradient', 'dark', 'instagram'].slice(0, limits.bioThemePresets)
      if (theme.preset !== 'custom' && !allowedPresets.includes(theme.preset)) {
        return NextResponse.json(
          { error: `Your plan allows ${limits.bioThemePresets} theme preset(s). Upgrade to unlock more.` },
          { status: 403 }
        )
      }
      updates.theme = theme
    }
    if (body.social_links !== undefined) {
      const links = validateSocialLinks(body.social_links).slice(0, limits.maxBioSocialLinks)
      updates.social_links = links
    }

    const updated = await updateBioPage(page.id, updates, service)
    return NextResponse.json({ page: updated })
  } catch (error) {
    console.error('[Bio Pages PATCH]', error)
    return NextResponse.json({ error: 'Failed to update bio page' }, { status: 500 })
  }
}
