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
  
  try {
    const page = await getBioPageBySlug(slug, true, service)
    if (!page) notFound()

    const blocks = await getBioBlocksByPageId(page.id, true, service)

    // Track view once per cookie session
    const cookieStore = await cookies()
    const viewCookie = `bio_view_${page.id}`
    if (!cookieStore.get(viewCookie)) {
      try {
        await incrementBioPageViews(page.id, service)
        await recordBioClick(page.id, null, 'view', {}, service)
        cookieStore.set(viewCookie, '1', { maxAge: 3600, path: '/', sameSite: 'lax' })
      } catch (err) {
        console.error('Failed to log bio view analytics:', err)
      }
    }

    return <BioPublicView page={page} blocks={blocks} />
  } catch (error: any) {
    console.error(`[PublicBioPage] Error loading bio page for slug ${slug}:`, error)
    
    // Check if it's a missing database table error
    const isDbMissing = error?.message?.includes('does not exist') || error?.message?.includes('relation')
    
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <div className="max-w-md p-8 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-red-600 dark:text-red-400">⚠️</span>
          </div>
          <h1 className="text-xl font-bold mb-2">Could Not Load Bio Page</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {isDbMissing 
              ? "The database tables for the Link-in-Bio module are not set up yet. Please run migration 010_bio_pages.sql in your Supabase dashboard."
              : "An unexpected error occurred while loading this bio page."}
          </p>
          <a href="/" className="px-5 py-2.5 rounded-xl font-medium text-white bg-gradient-to-r from-[#F58529] to-[#DD2A7B] hover:scale-[1.02] transition-transform inline-block">
            Go to Home
          </a>
        </div>
      </div>
    )
  }
}
