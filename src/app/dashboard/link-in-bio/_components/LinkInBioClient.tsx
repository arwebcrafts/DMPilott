'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUserStore } from '@/stores/userStore'
import type { BioPage, BioBlock } from '@/lib/bio/types'
import { Loader2, Link2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { DesignTab } from './DesignTab'
import { LinksTab } from './LinksTab'
import { AnalyticsTab } from './AnalyticsTab'
import { ShareTab } from './ShareTab'
import { BioPreview } from './BioPreview'

type Tab = 'design' | 'links' | 'analytics' | 'share'

const TABS: { id: Tab; label: string }[] = [
  { id: 'design', label: 'Design' },
  { id: 'links', label: 'Links' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'share', label: 'Share' },
]

export function LinkInBioClient() {
  const { user, accounts, fetchUser, fetchAccounts } = useUserStore()
  const [activeTab, setActiveTab] = useState<Tab>('design')
  const [page, setPage] = useState<BioPage | null>(null)
  const [blocks, setBlocks] = useState<BioBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [creating, setCreating] = useState(false)
  const [slugInput, setSlugInput] = useState('')
  const [previewTheme, setPreviewTheme] = useState<BioPage['theme'] | null>(null)

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
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save')
      }
      setPage(data.page)
      setPreviewTheme(null)
    } finally {
      setSaving(false)
    }
  }

  // Preview merges live theme edits from Design tab
  const previewPage = page
    ? { ...page, theme: previewTheme || page.theme }
    : null

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!page) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center mx-auto mb-6">
          <Link2 className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Create Your Link in Bio</h2>
        <p className="text-gray-500 text-sm mb-6">
          One link to share everything — just like Linktree, built into DMPilot.
        </p>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-gray-500">{typeof window !== 'undefined' ? window.location.origin : ''}/</span>
          <input
            value={slugInput}
            onChange={(e) => setSlugInput(e.target.value.toLowerCase())}
            className="flex-1 px-3 py-2 rounded-lg border text-sm"
            style={{ borderColor: 'var(--surface-3)' }}
            placeholder="yourname"
          />
        </div>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={createPage}
          disabled={creating || !slugInput.trim()}
          className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {creating && <Loader2 className="w-4 h-4 animate-spin" />}
          Get Started
        </motion.button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Link in Bio</h1>
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          Build and share your personal link page
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl bg-gray-100 dark:bg-gray-800 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Editor panel */}
        <div>
          {activeTab === 'design' && (
            <DesignTab
              page={page}
              onUpdate={updatePage}
              onThemeChange={setPreviewTheme}
              saving={saving}
            />
          )}
          {activeTab === 'links' && (
            <LinksTab blocks={blocks} onRefresh={loadData} />
          )}
          {activeTab === 'analytics' && (
            <AnalyticsTab hasPage={!!page} />
          )}
          {activeTab === 'share' && (
            <ShareTab page={page} />
          )}
        </div>

        {/* Live preview */}
        <div className="hidden xl:block sticky top-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Live Preview</p>
          <BioPreview page={previewPage} blocks={blocks} />
        </div>
      </div>
    </div>
  )
}
