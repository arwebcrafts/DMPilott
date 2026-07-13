'use client'

import { useState, useEffect } from 'react'
import type { BioPage, BioBlock } from '@/lib/bio/types'
import {
  Copy, Check, ExternalLink, Eye, MousePointerClick, Users,
  Link2, Palette, BarChart3, Share2, Loader2, Sparkles,
} from 'lucide-react'
import { motion } from 'framer-motion'

import type { BioTab } from '@/components/dashboard/LinkInBioSidebarNav'

interface OverviewTabProps {
  page: BioPage
  blocks: BioBlock[]
  onUpdate: (updates: Partial<BioPage>) => Promise<void>
  saving: boolean
  onNavigate: (tab: BioTab) => void
}

export function OverviewTab({ page, blocks, onUpdate, saving, onNavigate }: OverviewTabProps) {
  const [copied, setCopied] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished] = useState(page.is_published)
  const [stats, setStats] = useState({ views: 0, clicks: 0, signups: 0 })

  const publicUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/${page.slug}`
  const activeBlocks = blocks.filter((b) => b.is_active).length

  useEffect(() => {
    setPublished(page.is_published)
  }, [page.is_published])

  useEffect(() => {
    fetch('/api/bio-pages/analytics?days=7')
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (json?.analytics) {
          setStats({
            views: json.analytics.periodViews ?? 0,
            clicks: json.analytics.totalClicks ?? 0,
            signups: json.analytics.subscriberCount ?? 0,
          })
        }
      })
      .catch(() => {})
  }, [])

  function copyUrl() {
    navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function togglePublish() {
    if (publishing || saving) return
    const next = !published
    setPublishing(true)
    setPublished(next)
    try {
      await onUpdate({ is_published: next })
    } catch {
      setPublished(!next)
    } finally {
      setPublishing(false)
    }
  }

  const quickLinks = [
    { id: 'links' as const, label: 'Add Links', icon: Link2, desc: `${activeBlocks} active blocks` },
    { id: 'design' as const, label: 'Customize Look', icon: Palette, desc: 'Themes & profile' },
    { id: 'analytics' as const, label: 'View Insights', icon: BarChart3, desc: 'Clicks & views' },
    { id: 'share' as const, label: 'Share Page', icon: Share2, desc: 'QR & Instagram bio' },
  ]

  return (
    <div className="space-y-5">
      {/* Status card */}
      <div
        className="rounded-2xl border p-6 relative overflow-hidden"
        style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-[#DD2A7B]/10 to-transparent rounded-bl-full pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-[#DD2A7B]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Your Link Page</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{page.display_name || page.slug}</h2>
            <p className="text-sm text-gray-500 mt-1 font-mono truncate max-w-md">{publicUrl}</p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full ${
                published
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
              }`}
            >
              {published ? 'Live' : 'Draft'}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={published}
              onClick={togglePublish}
              disabled={publishing || saving}
              className={`relative inline-flex w-14 h-8 rounded-full transition-colors flex-shrink-0 ${
                published ? 'bg-[#DD2A7B]' : 'bg-gray-300 dark:bg-gray-600'
              } disabled:opacity-50`}
            >
              <span
                className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-200 ${
                  published ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-5">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={copyUrl}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF]"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy Link'}
          </motion.button>
          {published && (
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              style={{ borderColor: 'var(--surface-3)' }}
            >
              <ExternalLink className="w-4 h-4" />
              Open Page
            </a>
          )}
        </div>

        {!published && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-3">
            Turn on publish to make your page visible at {publicUrl}
          </p>
        )}
        {(publishing || saving) && (
          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" /> Saving...
          </p>
        )}
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Views (7d)', value: stats.views, icon: Eye },
          { label: 'Link Clicks', value: stats.clicks, icon: MousePointerClick },
          { label: 'Email Signups', value: stats.signups, icon: Users },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-2xl border p-5"
            style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}
          >
            <Icon className="w-5 h-5 text-[#DD2A7B] mb-3" />
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</div>
            <div className="text-sm text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Quick navigation */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Manage Your Page</h3>
        <div className="grid grid-cols-2 gap-3">
          {quickLinks.map(({ id, label, icon: Icon, desc }) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className="rounded-xl border p-4 text-left hover:border-[#DD2A7B]/40 hover:bg-[#DD2A7B]/5 transition-all group"
              style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}
            >
              <Icon className="w-5 h-5 text-[#DD2A7B] mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
