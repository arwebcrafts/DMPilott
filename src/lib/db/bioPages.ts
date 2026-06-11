import { createServiceClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { BioPage, BioTheme, SocialLink } from '@/lib/bio/types'
import { DEFAULT_BIO_THEME } from '@/lib/bio/types'
import { mergeThemeWithDefaults } from '@/lib/bio/validation'

function getDb(client?: SupabaseClient) {
  return client || createServiceClient()
}

export interface CreateBioPageInput {
  user_id: string
  slug: string
  display_name?: string | null
  bio?: string | null
  avatar_url?: string | null
  theme?: BioTheme
  social_links?: SocialLink[]
  is_published?: boolean
}

export interface UpdateBioPageInput {
  slug?: string
  display_name?: string | null
  bio?: string | null
  avatar_url?: string | null
  theme?: BioTheme
  social_links?: SocialLink[]
  is_published?: boolean
}

function parseBioPage(row: Record<string, unknown>): BioPage {
  return {
    ...row,
    theme: mergeThemeWithDefaults(row.theme as BioTheme),
    social_links: (row.social_links as SocialLink[]) || [],
  } as BioPage
}

export async function getBioPageByUserId(
  userId: string,
  client?: SupabaseClient
): Promise<BioPage | null> {
  const db = getDb(client)
  const { data, error } = await db
    .from('bio_pages')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw new Error(`Failed to get bio page: ${error.message}`)
  return data ? parseBioPage(data) : null
}

export async function getBioPageBySlug(
  slug: string,
  publishedOnly = true,
  client?: SupabaseClient
): Promise<BioPage | null> {
  const db = getDb(client)
  let query = db.from('bio_pages').select('*').eq('slug', slug.toLowerCase())
  if (publishedOnly) query = query.eq('is_published', true)

  const { data, error } = await query.maybeSingle()
  if (error) throw new Error(`Failed to get bio page: ${error.message}`)
  return data ? parseBioPage(data) : null
}

export async function getBioPageById(
  id: string,
  client?: SupabaseClient
): Promise<BioPage | null> {
  const db = getDb(client)
  const { data, error } = await db.from('bio_pages').select('*').eq('id', id).maybeSingle()
  if (error) throw new Error(`Failed to get bio page: ${error.message}`)
  return data ? parseBioPage(data) : null
}

export async function isSlugAvailable(
  slug: string,
  excludeUserId?: string,
  client?: SupabaseClient
): Promise<boolean> {
  const db = getDb(client)
  const { data, error } = await db
    .from('bio_pages')
    .select('user_id')
    .eq('slug', slug.toLowerCase())
    .maybeSingle()

  if (error) throw new Error(`Failed to check slug: ${error.message}`)
  if (!data) return true
  if (excludeUserId && data.user_id === excludeUserId) return true
  return false
}

export async function createBioPage(
  input: CreateBioPageInput,
  client?: SupabaseClient
): Promise<BioPage> {
  const db = getDb(client)
  const { data, error } = await db
    .from('bio_pages')
    .insert({
      user_id: input.user_id,
      slug: input.slug.toLowerCase(),
      display_name: input.display_name ?? null,
      bio: input.bio ?? null,
      avatar_url: input.avatar_url ?? null,
      theme: input.theme ?? DEFAULT_BIO_THEME,
      social_links: input.social_links ?? [],
      is_published: input.is_published ?? false,
    })
    .select()
    .single()

  if (error) throw new Error(`Failed to create bio page: ${error.message}`)
  return parseBioPage(data)
}

export async function updateBioPage(
  id: string,
  input: UpdateBioPageInput,
  client?: SupabaseClient
): Promise<BioPage> {
  const db = getDb(client)
  const payload: Record<string, unknown> = { ...input }
  if (input.slug) payload.slug = input.slug.toLowerCase()

  const { data, error } = await db
    .from('bio_pages')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(`Failed to update bio page: ${error.message}`)
  return parseBioPage(data)
}

export async function incrementBioPageViews(
  id: string,
  client?: SupabaseClient
): Promise<void> {
  const db = getDb(client)
  const page = await getBioPageById(id, db)
  if (!page) return

  await db
    .from('bio_pages')
    .update({ view_count: page.view_count + 1 })
    .eq('id', id)
}

export async function recordBioClick(
  bioPageId: string,
  blockId: string | null,
  eventType: 'click' | 'view',
  meta?: { referrer?: string; userAgent?: string },
  client?: SupabaseClient
): Promise<void> {
  const db = getDb(client)
  await db.from('bio_clicks').insert({
    bio_page_id: bioPageId,
    block_id: blockId,
    event_type: eventType,
    referrer: meta?.referrer?.slice(0, 500) ?? null,
    user_agent: meta?.userAgent?.slice(0, 500) ?? null,
  })
}

export async function getBioAnalytics(
  bioPageId: string,
  days: number,
  client?: SupabaseClient
) {
  const db = getDb(client)
  const since = new Date()
  since.setDate(since.getDate() - days)

  const { data: clicks, error: clicksError } = await db
    .from('bio_clicks')
    .select('id, block_id, event_type, created_at')
    .eq('bio_page_id', bioPageId)
    .gte('created_at', since.toISOString())

  if (clicksError) throw new Error(`Failed to get analytics: ${clicksError.message}`)

  const { count: subscriberCount, error: subError } = await db
    .from('bio_subscribers')
    .select('*', { count: 'exact', head: true })
    .eq('bio_page_id', bioPageId)

  if (subError) throw new Error(`Failed to get subscribers: ${subError.message}`)

  const page = await getBioPageById(bioPageId, db)
  const clickEvents = clicks?.filter((c) => c.event_type === 'click') || []
  const viewEvents = clicks?.filter((c) => c.event_type === 'view') || []

  const blockClickMap: Record<string, number> = {}
  for (const c of clickEvents) {
    if (c.block_id) {
      blockClickMap[c.block_id] = (blockClickMap[c.block_id] || 0) + 1
    }
  }

  return {
    pageViews: page?.view_count || 0,
    periodViews: viewEvents.length,
    totalClicks: clickEvents.length,
    subscriberCount: subscriberCount || 0,
    blockClicks: blockClickMap,
    ctr: viewEvents.length > 0 ? (clickEvents.length / viewEvents.length) * 100 : 0,
  }
}

export async function addBioSubscriber(
  bioPageId: string,
  email: string,
  blockId?: string | null,
  client?: SupabaseClient
): Promise<void> {
  const db = getDb(client)
  const { error } = await db.from('bio_subscribers').insert({
    bio_page_id: bioPageId,
    block_id: blockId ?? null,
    email: email.toLowerCase().trim(),
  })
  if (error) throw new Error(`Failed to add subscriber: ${error.message}`)
}
