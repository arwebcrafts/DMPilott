import { createServiceClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { BioBlock, BioBlockType } from '@/lib/bio/types'

function getDb(client?: SupabaseClient) {
  return client || createServiceClient()
}

export interface CreateBioBlockInput {
  bio_page_id: string
  type: BioBlockType
  title?: string | null
  url?: string | null
  description?: string | null
  image_url?: string | null
  price?: string | null
  metadata?: Record<string, unknown>
  sort_order?: number
  is_active?: boolean
}

export interface UpdateBioBlockInput {
  type?: BioBlockType
  title?: string | null
  url?: string | null
  description?: string | null
  image_url?: string | null
  price?: string | null
  metadata?: Record<string, unknown>
  sort_order?: number
  is_active?: boolean
}

export async function getBioBlocksByPageId(
  bioPageId: string,
  activeOnly = false,
  client?: SupabaseClient
): Promise<BioBlock[]> {
  const db = getDb(client)
  let query = db
    .from('bio_blocks')
    .select('*')
    .eq('bio_page_id', bioPageId)
    .order('sort_order', { ascending: true })

  if (activeOnly) query = query.eq('is_active', true)

  const { data, error } = await query
  if (error) throw new Error(`Failed to get bio blocks: ${error.message}`)
  return (data || []) as BioBlock[]
}

export async function getBioBlockById(
  id: string,
  client?: SupabaseClient
): Promise<BioBlock | null> {
  const db = getDb(client)
  const { data, error } = await db.from('bio_blocks').select('*').eq('id', id).maybeSingle()
  if (error) throw new Error(`Failed to get bio block: ${error.message}`)
  return data as BioBlock | null
}

export async function countBioBlocks(
  bioPageId: string,
  client?: SupabaseClient
): Promise<number> {
  const db = getDb(client)
  const { count, error } = await db
    .from('bio_blocks')
    .select('*', { count: 'exact', head: true })
    .eq('bio_page_id', bioPageId)

  if (error) throw new Error(`Failed to count blocks: ${error.message}`)
  return count || 0
}

export async function countBioBlocksByType(
  bioPageId: string,
  type: BioBlockType,
  client?: SupabaseClient
): Promise<number> {
  const db = getDb(client)
  const { count, error } = await db
    .from('bio_blocks')
    .select('*', { count: 'exact', head: true })
    .eq('bio_page_id', bioPageId)
    .eq('type', type)

  if (error) throw new Error(`Failed to count blocks: ${error.message}`)
  return count || 0
}

export async function getNextSortOrder(
  bioPageId: string,
  client?: SupabaseClient
): Promise<number> {
  const blocks = await getBioBlocksByPageId(bioPageId, false, client)
  if (blocks.length === 0) return 0
  return Math.max(...blocks.map((b) => b.sort_order)) + 1
}

export async function createBioBlock(
  input: CreateBioBlockInput,
  client?: SupabaseClient
): Promise<BioBlock> {
  const db = getDb(client)
  const sortOrder = input.sort_order ?? (await getNextSortOrder(input.bio_page_id, db))

  const { data, error } = await db
    .from('bio_blocks')
    .insert({
      bio_page_id: input.bio_page_id,
      type: input.type,
      title: input.title ?? null,
      url: input.url ?? null,
      description: input.description ?? null,
      image_url: input.image_url ?? null,
      price: input.price ?? null,
      metadata: input.metadata ?? {},
      sort_order: sortOrder,
      is_active: input.is_active ?? true,
    })
    .select()
    .single()

  if (error) throw new Error(`Failed to create bio block: ${error.message}`)
  return data as BioBlock
}

export async function updateBioBlock(
  id: string,
  input: UpdateBioBlockInput,
  client?: SupabaseClient
): Promise<BioBlock> {
  const db = getDb(client)
  const { data, error } = await db
    .from('bio_blocks')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(`Failed to update bio block: ${error.message}`)
  return data as BioBlock
}

export async function deleteBioBlock(id: string, client?: SupabaseClient): Promise<void> {
  const db = getDb(client)
  const { error } = await db.from('bio_blocks').delete().eq('id', id)
  if (error) throw new Error(`Failed to delete bio block: ${error.message}`)
}

export async function reorderBioBlocks(
  bioPageId: string,
  blockIds: string[],
  client?: SupabaseClient
): Promise<void> {
  const db = getDb(client)
  for (let i = 0; i < blockIds.length; i++) {
    const { error } = await db
      .from('bio_blocks')
      .update({ sort_order: i })
      .eq('id', blockIds[i])
      .eq('bio_page_id', bioPageId)

    if (error) throw new Error(`Failed to reorder blocks: ${error.message}`)
  }
}

export async function incrementBlockClickCount(
  blockId: string,
  client?: SupabaseClient
): Promise<void> {
  const db = getDb(client)
  const block = await getBioBlockById(blockId, db)
  if (!block) return

  await db
    .from('bio_blocks')
    .update({ click_count: block.click_count + 1 })
    .eq('id', blockId)
}
