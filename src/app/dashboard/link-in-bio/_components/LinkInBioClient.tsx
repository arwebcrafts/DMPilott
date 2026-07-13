'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import type { BioPage, BioBlock, BioTheme } from '@/lib/bio/types'
import { DEFAULT_BIO_THEME } from '@/lib/bio/types'
import { validateSlug, normalizeSlug } from '@/lib/bio/validation'
import { useUserStore } from '@/stores/userStore'
import type { BioTab } from '@/components/dashboard/LinkInBioSidebarNav'
import { BIO_TABS } from '@/components/dashboard/LinkInBioSidebarNav'
import { BioPreview } from './BioPreview'
import { OverviewTab } from './OverviewTab'
import { LinksTab } from './LinksTab'
import { DesignTab } from './DesignTab'
import { AnalyticsTab } from './AnalyticsTab'
import { ShareTab } from './ShareTab'
import { Loader2, Smartphone } from 'lucide-react'
import { motion } from 'framer-motion'

const VALID_TABS: BioTab[] = ['overview', 'links', 'design', 'analytics', 'share']

const TAB_TITLES: Record<BioTab, string> = {
  overview: 'Overview',
  links: 'Links',
  design: 'Design',
  analytics: 'Insights',
  share: 'Share',
}

function LinkInBioClientInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, accounts, fetchUser, fetchAccounts } = useUserStore()
  const [page, setPage] = useState<BioPage | null>(null)
  const [blocks, setBlocks] = useState<BioBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [previewTheme, setPreviewTheme] = useState<BioTheme>(DEFAULT_BIO_THEME)
  const [slugInput, setSlugInput] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const tabParam = searchParams.get('tab') as BioTab | null
  const activeView: BioTab = tabParam && VALID_TABS.includes(tabParam) ? tabParam : 'overview'

  const slugNormalized = normalizeSlug(slugInput)
  const slugValidation = slugNormalized ? validateSlug(slugNormalized) : null
  const canCreate = Boolean(slugNormalized && slugValidation?.valid && !creating)

  const fetchData = useCallback(async () => {
    setLoadError(null)
    try {
      const res = await fetch('/api/bio-pages', { credentials: 'same-origin' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setLoadError(data.error || 'Failed to load your bio page')
        return
      }
      setPage(data.page ?? null)
      setBlocks(data.blocks || [])
      if (data.page?.theme) setPreviewTheme(data.page.theme)
    } catch {
      setLoadError('Network error while loading. Refresh and try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    fetchUser()
    fetchAccounts()
  }, [fetchData, fetchUser, fetchAccounts])

  useEffect(() => {
    if (page || slugInput) return
    const fromIg = accounts.find((a) => a.platform === 'instagram' && a.username)?.username
    const fromEmail = user?.email?.split('@')[0]
    const raw = fromIg || fromEmail || ''
    const suggestion = normalizeSlug(raw).replace(/[^a-z0-9_-]/g, '').slice(0, 30)
    if (suggestion.length >= 3) setSlugInput(suggestion)
  }, [user, accounts, page, slugInput])

  async function createPage(e?: React.FormEvent) {
    e?.preventDefault()
    setCreateError(null)

    if (!slugNormalized) {
      setCreateError('Choose a username for your page URL')
      return
    }
    if (!slugValidation?.valid) {
      setCreateError(slugValidation?.error || 'Invalid username')
      return
    }

    setCreating(true)
    try {
      const res = await fetch('/api/bio-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          slug: slugNormalized,
          display_name: user?.fullName || slugNormalized,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setCreateError(data.error || `Could not create page (${res.status})`)
        return
      }
      if (!data.page) {
        setCreateError('Unexpected server response. Refresh and try again.')
        return
      }
      setPage(data.page)
      setBlocks([])
      setPreviewTheme(data.page.theme)
      router.replace('/dashboard/link-in-bio?tab=overview')
    } catch {
      setCreateError('Network error. Check your connection and try again.')
    } finally {
      setCreating(false)
    }
  }

  async function updatePage(updates: Partial<BioPage>): Promise<void> {
    setSaving(true)
    try {
      const res = await fetch('/api/bio-pages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')
      setPage(data.page)
      if (data.page.theme) setPreviewTheme(data.page.theme)
    } finally {
      setSaving(false)
    }
  }

  function navigateToTab(tab: BioTab) {
    router.push(`/dashboard/link-in-bio?tab=${tab}`)
  }

  const previewPage = page ? { ...page, theme: previewTheme } : null

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!page) {
    return (
      <div className="max-w-lg mx-auto py-12 px-4">
        {loadError && (
          <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
            {loadError}
          </div>
        )}
        <div
          className="rounded-2xl border p-8 text-center space-y-6"
          style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center mx-auto">
            <span className="text-2xl">🔗</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Create Your Link in Bio</h2>
            <p className="text-sm text-gray-500 mt-2">
              One link for everything. Share it on Instagram, TikTok, or anywhere.
            </p>
          </div>
          <form className="space-y-3 text-left" onSubmit={createPage}>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Your page URL</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 whitespace-nowrap">dmpilott.vercel.app/</span>
                <input
                  value={slugInput}
                  onChange={(e) => {
                    setSlugInput(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))
                    setCreateError(null)
                  }}
                  placeholder="yourname"
                  autoComplete="off"
                  className="flex-1 px-3 py-2 rounded-lg border text-sm bg-white dark:bg-gray-900"
                  style={{ borderColor: 'var(--surface-3)' }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                3–30 characters. Letters, numbers, underscore, hyphen only.
              </p>
              {slugNormalized && !slugValidation?.valid && (
                <p className="text-xs text-red-500 mt-1">{slugValidation?.error}</p>
              )}
            </div>

            {createError && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
                {createError}
              </div>
            )}

            <motion.button
              type="submit"
              whileTap={canCreate ? { scale: 0.98 } : undefined}
              disabled={!canCreate}
              className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {creating ? 'Creating...' : 'Create My Page'}
            </motion.button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Mobile section nav — sidebar is hidden below md */}
      <nav className="md:hidden mb-5 -mx-1 flex gap-1 overflow-x-auto pb-1 scrollbar-none">
        {BIO_TABS.map(({ tab, label }) => (
          <button
            key={tab}
            type="button"
            onClick={() => navigateToTab(tab)}
            className={`shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeView === tab
                ? 'bg-[#DD2A7B] text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="flex gap-4 lg:gap-6 items-start">
      {/* Main editor — left */}
      <div className="flex-1 min-w-0">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{TAB_TITLES[activeView]}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {activeView === 'overview' && 'Status, stats, and quick actions'}
            {activeView === 'links' && 'Add and organize your links'}
            {activeView === 'design' && 'Customize how your page looks'}
            {activeView === 'analytics' && 'Views, clicks, and signups'}
            {activeView === 'share' && 'Copy your URL and download QR code'}
          </p>
        </div>

        {activeView === 'overview' && (
          <OverviewTab
            page={page}
            blocks={blocks}
            onUpdate={updatePage}
            saving={saving}
            onNavigate={navigateToTab}
          />
        )}
        {activeView === 'links' && <LinksTab blocks={blocks} onRefresh={fetchData} />}
        {activeView === 'design' && (
          <DesignTab
            page={page}
            onUpdate={updatePage}
            onThemeChange={setPreviewTheme}
            saving={saving}
          />
        )}
        {activeView === 'analytics' && <AnalyticsTab hasPage={!!page} />}
        {activeView === 'share' && <ShareTab page={page} />}
      </div>

      {/* Live preview — sticky on the right, always visible */}
      <aside className="w-[168px] sm:w-[200px] lg:w-[260px] shrink-0 sticky top-20 self-start z-10">
        <div
          className="rounded-2xl border p-3 lg:p-4 shadow-sm"
          style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}
        >
          <div className="flex items-center justify-center gap-1.5 mb-3 lg:mb-4">
            <Smartphone className="w-3.5 h-3.5 text-[#DD2A7B]" />
            <p className="text-[10px] lg:text-xs font-semibold uppercase tracking-wider text-gray-500">Live Preview</p>
          </div>
          <div className="scale-[0.85] sm:scale-90 lg:scale-100 origin-top">
            <BioPreview page={previewPage} blocks={blocks} />
          </div>
        </div>
      </aside>
      </div>
    </div>
  )
}

export function LinkInBioClient() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      }
    >
      <LinkInBioClientInner />
    </Suspense>
  )
}
