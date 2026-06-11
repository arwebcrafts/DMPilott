import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import type { Metadata } from 'next'
import { createServiceClient } from '@/lib/supabase/server'
import { getBioPageBySlug, incrementBioPageViews, recordBioClick } from '@/lib/db/bioPages'
import { getBioBlocksByPageId } from '@/lib/db/bioBlocks'
import { isReservedSlug } from '@/lib/bio/reservedSlugs'
import { BioPublicView } from '@/components/bio/BioPublicView'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  if (isReservedSlug(slug)) return { title: 'Not Found' }

  const service = createServiceClient()
  const page = await getBioPageBySlug(slug, true, service)
  if (!page) return { title: 'Not Found' }

  return {
    title: page.display_name || page.slug,
    description: page.bio || `Link in bio for ${page.display_name || page.slug}`,
    robots: page.is_published ? 'index, follow' : 'noindex, nofollow',
  }
}

export default async function PublicBioPage({ params }: PageProps) {
  const { slug } = await params

  if (isReservedSlug(slug)) notFound()

  const service = createServiceClient()
  const page = await getBioPageBySlug(slug, true, service)
  if (!page) notFound()

  const blocks = await getBioBlocksByPageId(page.id, true, service)

  // Track view once per cookie session
  const cookieStore = await cookies()
  const viewCookie = `bio_view_${page.id}`
  if (!cookieStore.get(viewCookie)) {
    await incrementBioPageViews(page.id, service)
    await recordBioClick(page.id, null, 'view', {}, service)
    cookieStore.set(viewCookie, '1', { maxAge: 3600, path: '/', sameSite: 'lax' })
  }

  return <BioPublicView page={page} blocks={blocks} />
}
