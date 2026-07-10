'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUserStore } from '@/stores/userStore'
import type { BioPage, BioBlock } from '@/lib/bio/types'
import {
  Loader2, Link2, LayoutGrid, Palette, BarChart3, Share2, Smartphone, X,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { OverviewTab } from './OverviewTab'
import { DesignTab } from './DesignTab'
import { LinksTab } from './LinksTab'
import { AnalyticsTab } from './AnalyticsTab'
import { ShareTab } from './ShareTab'
import { BioPreview } from './BioPreview'

type Tab = 'overview' | 'links' | 'design' | 'analytics' | 'share'

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'links', label: 'Links', icon: Link2 },
  { id: 'design', label: 'Design', icon: Palette },
  { id: 'analytics', label: 'Insights', icon: BarChart3 },
  { id: 'share', label: 'Share', icon: Share2 },
]

export function LinkInBioClient() {
  const { user, accounts, fetchUser, fetchAccounts } = useUserStore()
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [page, setPage] = useState<BioPage | null>(null)
  const [blocks, setBlocks] = useState<BioBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [creating, setCreating] = useState(false)
  const [slugInput, setSlugInput] = useState('')
  const [previewTheme, setPreviewTheme] = useState<BioPage['theme'] | null>(null)
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/bio-pages')
      if (res.ok) {
        const data = await res.json()
        setPage(data.page)
        setBlocks(data.blocks || [])
        if (data.page) setSlugInput(data.page.slug)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()
    fetchAccounts()
    loadData()
  }, [fetchUser, fetchAccounts, loadData])

  useEffect(() => {
    if (!page && accounts.length > 0 && !slugInput) {
      const igAccount = accounts.find((a) => a.platform === 'instagram' && a.username)
      if (igAccount?.username) {
        setSlugInput(igAccount.username.toLowerCase().replace(/[^a-z0-9_-]/g, ''))
      }
    }
  }, [accounts, page, slugInput])

  async function createPage() {
    if (!slugInput.trim()) return
    setCreating(true)
    try {
      const res = await fetch('/api/bio-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: slugInput,
          display_name: user?.fullName || slugInput,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Failed to create page')
        return
      }
      setPage(data.page)
      await loadData()
    } finally {
      setCreating(false)
    }
  }

  async function updatePage(updates: Partial<BioPage>) {
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
      setPreviewTheme(null)
    } finally {
      setSaving(false)
    }
  }

  const previewPage = page ? { ...page, theme: previewTheme || page.theme } : null

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[#DD2A7B]" />
      </div>
    )
  }

  if (!page) {
    return (
      <div className="max-w-lg mx-auto py-12 px-4">
        <div className="rounded-2xl border p-8 text-center shadow-sm" style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Link2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Your Link in Bio</h2>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            One premium link page for Instagram. Share all your links, videos, and products in one tap.
          </p>
          <div className="flex items-center gap-2 mb-6 rounded-xl border p-2" style={{ borderColor: 'var(--surface-3)' }}>
            <span className="text-sm text-gray-400 pl-2">{typeof window !== 'undefined' ? window.location.origin : ''}/</span>
            <input
              value={slugInput}
              onChange={(e) => setSlugInput(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
              className="flex-1 px-2 py-2 rounded-lg text-sm font-medium bg-transparent outline-none"
              placeholder="yourname"
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={createPage}
            disabled={creating || !slugInput.trim()}
            className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
          >
            {creating && <Loader2 className="w-4 h-4 animate-spin" />}
            Create My Page
          </motion.button>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-20 lg:pb-0">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Link in Bio</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Premium link page for your Instagram profile
          </p>
        </div>
        <button
          onClick={() => setMobilePreviewOpen(true)}
          className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium"
          style={{ borderColor: 'var(--surface-3)' }}
        >
          <Smartphone className="w-4 h-4" />
          Preview
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 p-1 rounded-2xl border overflow-x-auto" style={{ background: 'var(--surface-1)', borderColor: 'var(--surface-3)' }}>
        {TABS.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="min-w-0">
          {activeTab === 'overview' && (
            <OverviewTab
              page={page}
              blocks={blocks}
              onUpdate={updatePage}
              saving={saving}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}
          {activeTab === 'design' && (
            <DesignTab page={page} onUpdate={updatePage} onThemeChange={setPreviewTheme} saving={saving} />
          )}
          {activeTab === 'links' && <LinksTab blocks={blocks} onRefresh={loadData} />}
          {activeTab === 'analytics' && <AnalyticsTab hasPage={!!page} />}
          {activeTab === 'share' && <ShareTab page={page} />}
        </div>

        <div className="hidden lg:block sticky top-20 self-start">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Live Preview</p>
          <BioPreview page={previewPage} blocks={blocks} />
        </div>
      </div>

      {/* Mobile preview sheet */}
      <AnimatePresence>
        {mobilePreviewOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden flex items-end"
            onClick={() => setMobilePreviewOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="w-full max-h-[85vh] rounded-t-2xl p-4 overflow-y-auto"
              style={{ background: 'var(--surface-0)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-gray-900 dark:text-gray-100">Preview</span>
                <button onClick={() => setMobilePreviewOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <BioPreview page={previewPage} blocks={blocks} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
