'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/stores/userStore'
import { PLAN_LIMITS } from '@/lib/planGating'
import { Plus, Edit2, Trash2, MoreHorizontal, Zap, MessageSquare, ToggleLeft, ToggleRight } from 'lucide-react'
import { InstagramIcon, FacebookIcon } from '@/components/ui/brand-icons'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface Automation {
  id: string
  name: string
  account_id?: string
  platform: 'instagram' | 'facebook'
  trigger_type: string
  keywords: string[]
  dm_message: string
  dm_video_url?: string | null
  media_id?: string | null
  media_caption?: string | null
  follow_facebook_url?: string | null
  follow_instagram_url?: string | null
  comment_reply_enabled?: boolean
  comment_reply_text?: string | null
  ai_replies_enabled?: boolean
  flow_steps?: { text: string }[] | null
  is_active: boolean
  total_dms_sent: number
  created_at: string
  connected_accounts?: { username: string }
}

interface PageConfiguration {
  id: string
  page_name: string
  page_url: string
  facebook_page_id: string
  gift_link_url: string
  gift_link_title: string | null
  created_at: string
}

interface InstagramGiftOffer {
  id: string
  account_username: string
  gift_link_url: string
  gift_link_title: string | null
  created_at: string
}

function FacebookPageConfigModal({
  onClose,
  onSaved,
  fbAccounts,
}: {
  onClose: () => void
  onSaved: () => void
  fbAccounts: any[]
}) {
  const [selectedAccountId, setSelectedAccountId] = useState('')
  const [pageUrl, setPageUrl] = useState('')
  const [giftLinkUrl, setGiftLinkUrl] = useState('')
  const [giftLinkTitle, setGiftLinkTitle] = useState('')
  const [loading, setLoading] = useState(false)

  function facebookPageUrl(account: { username?: string | null; platform_account_id?: string }) {
    if (account.username) {
      return `https://www.facebook.com/${account.username.replace(/^@/, '')}/`
    }
    return `https://www.facebook.com/${account.platform_account_id}`
  }

  // Auto-select first Facebook account and set page URL
  useEffect(() => {
    if (fbAccounts.length > 0 && !selectedAccountId) {
      const firstAccount = fbAccounts[0]
      setSelectedAccountId(firstAccount.id)
      setPageUrl(facebookPageUrl(firstAccount))
    }
  }, [fbAccounts, selectedAccountId])

  // Update page URL when account changes
  function handleAccountChange(accountId: string) {
    setSelectedAccountId(accountId)
    const account = fbAccounts.find(a => a.id === accountId)
    if (account) {
      setPageUrl(facebookPageUrl(account))
    }
  }

  // Get page ID from selected account
  function getPageId(): string {
    const account = fbAccounts.find(a => a.id === selectedAccountId)
    return account?.platform_account_id || ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!pageUrl || !giftLinkUrl) {
      alert('Please fill in all required fields')
      return
    }

    const facebookPageId = getPageId()
    if (!facebookPageId) {
      alert('Could not get page ID from selected account.')
      return
    }

    setLoading(true)

    const res = await fetch('/api/page-configurations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page_name: 'FB Gift Offer',
        page_url: pageUrl,
        page_id: facebookPageId,
        gift_link_url: giftLinkUrl,
        gift_link_title: giftLinkTitle,
        gift_link_description: '',
      }),
    })

    const data = await res.json()

    if (res.ok) {
      alert('FB Gift Offer saved successfully!')
      onSaved()
      onClose()
    } else {
      alert(data.error || 'Failed to save FB Gift Offer')
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto border shadow-xl"
        style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}
      >
        <div className="p-6 border-b" style={{ borderColor: 'var(--surface-3)' }}>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">FB Gift Offer</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Account Selection */}
          {fbAccounts.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Facebook Account
              </label>
              <select
                value={selectedAccountId}
                onChange={e => handleAccountChange(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#1877F2]/50 bg-white dark:bg-gray-800"
                style={{ borderColor: 'var(--surface-3)' }}
              >
                {fbAccounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    @{acc.username} (ID: {acc.platform_account_id})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Page URL */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Page URL <span className="text-[#FA3E3E]">*</span>
            </label>
            <input
              type="url"
              value={pageUrl}
              onChange={e => setPageUrl(e.target.value)}
              placeholder="https://www.facebook.com/your-page-name"
              className="w-full px-3 py-2 border rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#1877F2]/50 bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500"
              style={{ borderColor: 'var(--surface-3)' }}
            />
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">Page ID will be automatically set from your selected Facebook account</p>
          </div>

          {/* Gift Link URL */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Gift Link URL <span className="text-[#FA3E3E]">*</span>
            </label>
            <input
              type="url"
              value={giftLinkUrl}
              onChange={e => setGiftLinkUrl(e.target.value)}
              placeholder="https://your-gift-link.com"
              className="w-full px-3 py-2 border rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#1877F2]/50 bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500"
              style={{ borderColor: 'var(--surface-3)' }}
            />
          </div>

          {/* Gift Link Title */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Gift Link Title
            </label>
            <input
              type="text"
              value={giftLinkTitle}
              onChange={e => setGiftLinkTitle(e.target.value)}
              placeholder="e.g. Get Your Free Gift"
              className="w-full px-3 py-2 border rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#1877F2]/50 bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500"
              style={{ borderColor: 'var(--surface-3)' }}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              style={{ borderColor: 'var(--surface-3)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-50 bg-[#1877F2]"
            >
              {loading ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

function InstagramGiftOfferModal({
  onClose,
  onSaved,
  igAccounts,
}: {
  onClose: () => void
  onSaved: () => void
  igAccounts: any[]
}) {
  const [selectedAccountId, setSelectedAccountId] = useState('')
  const [giftLinkUrl, setGiftLinkUrl] = useState('')
  const [giftLinkTitle, setGiftLinkTitle] = useState('')
  const [loading, setLoading] = useState(false)

  // Auto-select first Instagram account
  useEffect(() => {
    if (igAccounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(igAccounts[0].id)
    }
  }, [igAccounts, selectedAccountId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!giftLinkUrl) {
      alert('Please fill in all required fields')
      return
    }

    const selectedAccount = igAccounts.find(a => a.id === selectedAccountId)
    if (!selectedAccount) {
      alert('Please select an Instagram account')
      return
    }

    setLoading(true)

    const res = await fetch('/api/instagram-gift-offers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        account_username: selectedAccount.username,
        gift_link_url: giftLinkUrl,
        gift_link_title: giftLinkTitle,
      }),
    })

    const data = await res.json()

    if (res.ok) {
      alert('Instagram Gift Offer saved successfully!')
      onSaved()
      onClose()
    } else {
      alert(data.error || 'Failed to save Instagram Gift Offer')
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto border shadow-xl"
        style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}
      >
        <div className="p-6 border-b" style={{ borderColor: 'var(--surface-3)' }}>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Instagram Gift Offer</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Account Selection */}
          {igAccounts.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Instagram Account
              </label>
              <select
                value={selectedAccountId}
                onChange={e => setSelectedAccountId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#DD2A7B]/50 bg-white dark:bg-gray-800"
                style={{ borderColor: 'var(--surface-3)' }}
              >
                {igAccounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    @{acc.username}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Gift Link URL */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Gift Link URL <span className="text-[#FA3E3E]">*</span>
            </label>
            <input
              type="url"
              value={giftLinkUrl}
              onChange={e => setGiftLinkUrl(e.target.value)}
              placeholder="https://your-gift-link.com"
              className="w-full px-3 py-2 border rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#DD2A7B]/50 bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500"
              style={{ borderColor: 'var(--surface-3)' }}
            />
          </div>

          {/* Gift Link Title */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Gift Link Title
            </label>
            <input
              type="text"
              value={giftLinkTitle}
              onChange={e => setGiftLinkTitle(e.target.value)}
              placeholder="e.g. Get Your Free Gift"
              className="w-full px-3 py-2 border rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#DD2A7B]/50 bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500"
              style={{ borderColor: 'var(--surface-3)' }}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              style={{ borderColor: 'var(--surface-3)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-50 bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF]"
            >
              {loading ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<Automation[]>([])
  const [pageConfigs, setPageConfigs] = useState<PageConfiguration[]>([])
  const [instagramGiftOffers, setInstagramGiftOffers] = useState<InstagramGiftOffer[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showPageConfig, setShowPageConfig] = useState(false)
  const [showInstagramGift, setShowInstagramGift] = useState(false)
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null)
  const { user } = useUserStore()
  const supabase = createClient()
  const [accounts, setAccounts] = useState<any[]>([])

  const planLimits = user ? PLAN_LIMITS[user.plan] : PLAN_LIMITS.free

  useEffect(() => {
    fetchAutomations()
    fetchPageConfigs()
    fetchInstagramGiftOffers()
    fetchAccounts()
  }, [])

  async function fetchAccounts() {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return

    const { data } = await supabase
      .from('connected_accounts')
      .select('*')
      .eq('user_id', authUser.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    setAccounts(data || [])
  }

  async function fetchAutomations() {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return

    const { data } = await supabase
      .from('automations')
      .select('*, connected_accounts(username)')
      .eq('user_id', authUser.id)
      .order('created_at', { ascending: false })

    setAutomations(data || [])
  }

  async function fetchPageConfigs() {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return

    const { data } = await supabase
      .from('page_configurations')
      .select('*')
      .order('created_at', { ascending: false })

    setPageConfigs(data || [])
  }

  async function fetchInstagramGiftOffers() {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return

    const { data } = await supabase
      .from('instagram_gift_offers')
      .select('*')
      .order('created_at', { ascending: false })

    setInstagramGiftOffers(data || [])
    setLoading(false)
  }

  async function toggleAutomation(id: string, currentState: boolean) {
    const res = await fetch(`/api/automations/${id}/toggle`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !currentState }),
    })

    if (res.ok) {
      setAutomations(prev =>
        prev.map(a => a.id === id ? { ...a, is_active: !currentState } : a)
      )
    }
  }

  async function deleteAutomation(id: string) {
    if (!confirm('Delete this automation?')) return
    await supabase.from('automations').delete().eq('id', id)
    setAutomations(prev => prev.filter(a => a.id !== id))
  }

  async function deletePageConfig(id: string) {
    if (!confirm('Delete this FB Gift Offer?')) return
    await supabase.from('page_configurations').delete().eq('id', id)
    setPageConfigs(prev => prev.filter(c => c.id !== id))
  }

  async function deleteInstagramGiftOffer(id: string) {
    if (!confirm('Delete this Instagram Gift Offer?')) return
    await supabase.from('instagram_gift_offers').delete().eq('id', id)
    setInstagramGiftOffers(prev => prev.filter(o => o.id !== id))
  }

  const igAccounts = accounts.filter(a => a.platform === 'instagram')
  const fbAccounts = accounts.filter(a => a.platform === 'facebook')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Automations</h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm">Manage your DM automations for Instagram & Facebook</p>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowPageConfig(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm text-white border-2 border-[#1877F2] bg-[#1877F2]/20 text-[#1877F2]"
          >
            <FacebookIcon className="w-4 h-4" /> FB Gift Offer
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowInstagramGift(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm text-white border-2 border-[#DD2A7B] bg-[#DD2A7B]/20 text-[#DD2A7B]"
          >
            <InstagramIcon className="w-4 h-4" /> Insta Gift Offer
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm text-white"
            style={{ background: 'var(--accent)' }}
          >
            <Plus className="w-4 h-4" /> New Automation
          </motion.button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-600 dark:text-gray-300">Loading...</div>
      ) : automations.length === 0 ? (
        <div className="rounded-xl border p-12 text-center shadow-sm" style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}>
          <div className="text-5xl mb-4">⚡</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No automations yet</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
            Create your first automation to start sending automatic DMs
          </p>
          {accounts.length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <Link href="/dashboard/accounts" className="text-[#e85d3a] hover:underline">Connect an account</Link> first
            </p>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreate(true)}
              className="px-4 py-2 rounded-lg font-medium text-sm text-white"
              style={{ background: 'var(--accent)' }}
            >
              Create Automation
            </motion.button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {automations.map((auto, index) => (
            <motion.div
              key={auto.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-xl border overflow-hidden shadow-sm ${
                auto.is_active ? '' : 'opacity-75'
              }`}
              style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}
            >
              {/* Header strip */}
              <div className={`h-1 ${auto.platform === 'instagram'
                ? 'bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF]'
                : 'bg-[#1877F2]'
              }`} />

              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {auto.platform === 'instagram'
                      ? <InstagramIcon className="w-4 h-4 text-[#E1306C]" />
                      : <FacebookIcon className="w-4 h-4 text-[#1877F2]" />
                    }
                    <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={{ background: 'var(--surface-1)', color: 'var(--text-muted)' }}>
                      {auto.trigger_type.replace('_', ' ')}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleAutomation(auto.id, auto.is_active)}
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    {auto.is_active
                      ? <ToggleRight className="w-6 h-6 text-[#22c55e]" />
                      : <ToggleLeft className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                    }
                  </button>
                </div>

                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{auto.name}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                  @{auto.connected_accounts?.username || 'account'}
                </p>
                <p className="text-xs mb-3">
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
                    style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)' }}
                  >
                    {auto.media_id
                      ? `🎯 ${auto.media_caption ? auto.media_caption.slice(0, 28) : 'Specific post'}`
                      : '🌐 Whole account'}
                  </span>
                </p>

                {/* Keywords */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {auto.keywords.slice(0, 5).map((kw, i) => (
                    <span key={i} className="text-xs bg-[#DD2A7B]/20 text-[#DD2A7B] border border-[#DD2A7B]/30 px-2 py-0.5 rounded-full">
                      {kw}
                    </span>
                  ))}
                  {auto.keywords.length > 5 && (
                    <span className="text-xs text-gray-600 dark:text-gray-300">+{auto.keywords.length - 5} more</span>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">
                    <MessageSquare className="w-3.5 h-3.5 inline mr-1" />
                    {auto.total_dms_sent} DMs sent
                  </span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setEditingAutomation(auto)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                    >
                      <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    </button>
                    <button
                      onClick={() => deleteAutomation(auto.id)}
                      className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-[#FA3E3E]" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* FB Gift Offers */}
      {pageConfigs.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">FB Gift Offers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pageConfigs.map((config, index) => (
              <motion.div
                key={config.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-xl border overflow-hidden shadow-sm"
                style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}
              >
                <div className="h-1 bg-[#1877F2]" />
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FacebookIcon className="w-4 h-4 text-[#1877F2]" />
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--surface-1)', color: 'var(--text-muted)' }}>
                        Gift Offer
                      </span>
                    </div>
                    <button
                      onClick={() => deletePageConfig(config.id)}
                      className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-[#FA3E3E]" />
                    </button>
                  </div>

                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{config.page_name}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
                    Page ID: {config.facebook_page_id}
                  </p>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300 truncate flex-1 mr-2">
                      {config.gift_link_title || config.gift_link_url}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Instagram Gift Offers */}
      {instagramGiftOffers.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Instagram Gift Offers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {instagramGiftOffers.map((offer, index) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-xl border overflow-hidden shadow-sm"
                style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}
              >
                <div className="h-1 bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF]" />
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <InstagramIcon className="w-4 h-4 text-[#E1306C]" />
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--surface-1)', color: 'var(--text-muted)' }}>
                        Gift Offer
                      </span>
                    </div>
                    <button
                      onClick={() => deleteInstagramGiftOffer(offer.id)}
                      className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-[#FA3E3E]" />
                    </button>
                  </div>

                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">@{offer.account_username}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
                    Instagram Gift Offer
                  </p>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300 truncate flex-1 mr-2">
                      {offer.gift_link_title || offer.gift_link_url}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Create Automation Modal */}
      {showCreate && (
        <CreateAutomationModal
          igAccounts={igAccounts}
          fbAccounts={fbAccounts}
          onClose={() => setShowCreate(false)}
          onCreated={(newAuto) => {
            setAutomations(prev => [newAuto, ...prev])
            setShowCreate(false)
          }}
        />
      )}

      {/* Edit Automation Modal */}
      {editingAutomation && (
        <CreateAutomationModal
          igAccounts={igAccounts}
          fbAccounts={fbAccounts}
          onClose={() => setEditingAutomation(null)}
          onCreated={(updatedAuto) => {
            setAutomations(prev => prev.map(a => a.id === updatedAuto.id ? updatedAuto : a))
            setEditingAutomation(null)
          }}
          editData={editingAutomation}
        />
      )}

      {/* Facebook Page Configuration Modal */}
      {showPageConfig && (
        <FacebookPageConfigModal
          onClose={() => setShowPageConfig(false)}
          onSaved={() => fetchPageConfigs()}
          fbAccounts={fbAccounts}
        />
      )}

      {/* Instagram Gift Offer Modal */}
      {showInstagramGift && (
        <InstagramGiftOfferModal
          onClose={() => setShowInstagramGift(false)}
          onSaved={() => fetchInstagramGiftOffers()}
          igAccounts={igAccounts}
        />
      )}
    </div>
  )
}

function CreateAutomationModal({
  igAccounts,
  fbAccounts,
  onClose,
  onCreated,
  editData,
}: {
  igAccounts: any[]
  fbAccounts: any[]
  onClose: () => void
  onCreated: (a: Automation) => void
  editData?: Automation
}) {
  const [platform, setPlatform] = useState<'instagram' | 'facebook'>(
    editData?.platform || (igAccounts.length > 0 ? 'instagram' : fbAccounts.length > 0 ? 'facebook' : 'instagram')
  )
  const [triggerType, setTriggerType] = useState(editData?.trigger_type || 'comment_keyword')
  const [keywords, setKeywords] = useState<string[]>(editData?.keywords || [])
  const [keywordInput, setKeywordInput] = useState('')
  const [dmMessage, setDmMessage] = useState(editData?.dm_message || '')
  // Extra flow steps (messages 2..N). Step 1 is the DM Message above.
  const [flowSteps, setFlowSteps] = useState<string[]>(
    Array.isArray(editData?.flow_steps) && (editData!.flow_steps as any[]).length > 1
      ? (editData!.flow_steps as any[]).slice(1).map((s: any) => (typeof s === 'string' ? s : s?.text || ''))
      : []
  )
  const MAX_EXTRA_STEPS = 2 // 3 messages total
  const [followFacebookUrl, setFollowFacebookUrl] = useState(editData?.follow_facebook_url || '')
  const [followInstagramUrl, setFollowInstagramUrl] = useState(editData?.follow_instagram_url || '')
  const [commentReplyEnabled, setCommentReplyEnabled] = useState(
    editData ? editData.comment_reply_enabled ?? false : true
  )
  const [commentReplyText, setCommentReplyText] = useState(
    editData?.comment_reply_text || 'Check your DMs! 📩'
  )
  const [aiRepliesEnabled, setAiRepliesEnabled] = useState(editData?.ai_replies_enabled ?? false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // When editing, keep the automation pointed at the account it already uses.
  const [accountId, setAccountId] = useState(editData?.account_id || '')
  // Per-post targeting. '' means "whole account".
  const [mediaId, setMediaId] = useState<string>(editData?.media_id || '')
  const [mediaOptions, setMediaOptions] = useState<Array<{ id: string; caption: string; mediaType?: string }>>([])
  const [mediaLoading, setMediaLoading] = useState(false)

  const availableAccounts = platform === 'instagram' ? igAccounts : fbAccounts
  const isCommentTrigger = triggerType === 'comment_keyword' || triggerType === 'any_comment'

  // Pick a sensible account whenever the current selection is not valid for the
  // chosen platform (first render, or after switching Instagram <-> Facebook).
  useEffect(() => {
    if (availableAccounts.length === 0) return
    if (!availableAccounts.some(a => a.id === accountId)) {
      setAccountId(availableAccounts[0].id)
    }
  }, [platform, availableAccounts, accountId])

  // Load the account's recent posts so the user can target one specific post.
  useEffect(() => {
    if (!accountId || !isCommentTrigger) {
      setMediaOptions([])
      return
    }
    let cancelled = false
    setMediaLoading(true)
    fetch(`/api/accounts/${accountId}/media`)
      .then(res => res.json())
      .then(data => {
        if (cancelled) return
        setMediaOptions(Array.isArray(data.media) ? data.media : [])
      })
      .catch(() => { if (!cancelled) setMediaOptions([]) })
      .finally(() => { if (!cancelled) setMediaLoading(false) })
    return () => { cancelled = true }
  }, [accountId, isCommentTrigger])

  function addKeyword() {
    const kw = keywordInput.trim().toUpperCase()
    if (kw && !keywords.includes(kw) && keywords.length < 10) {
      setKeywords([...keywords, kw])
      setKeywordInput('')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!accountId) {
      setError('Select the account this automation should run on.')
      return
    }
    if (!dmMessage.trim()) {
      setError('Write the DM message you want to send.')
      return
    }
    if (triggerType === 'comment_keyword' && keywords.length === 0) {
      setError('Add at least one keyword for a keyword trigger.')
      return
    }

    setLoading(true)

    const selectedAccount = availableAccounts.find(a => a.id === accountId)
    const payload = {
      accountId,
      name: triggerType === 'dm_received'
        ? 'DM auto-reply'
        : `${triggerType.replace('_', ' ')} - ${keywords[0] || 'auto'}`,
      platform,
      triggerType,
      keywords: triggerType === 'comment_keyword' ? keywords : [],
      dmMessage,
      followFacebookUrl: followFacebookUrl.trim() || null,
      followInstagramUrl: followInstagramUrl.trim() || null,
      commentReplyEnabled,
      commentReplyText: commentReplyEnabled ? commentReplyText : null,
      aiRepliesEnabled,
      // Multi-step flow: step 1 is the DM message, plus any follow-up steps.
      flowSteps: flowSteps.some(s => s.trim())
        ? [dmMessage, ...flowSteps.filter(s => s.trim())].map(text => ({ text }))
        : null,
      // Per-post targeting only applies to comment triggers; '' => whole account.
      mediaId: isCommentTrigger ? (mediaId || null) : null,
      mediaCaption: isCommentTrigger && mediaId
        ? (mediaOptions.find(m => m.id === mediaId)?.caption?.slice(0, 140) || null)
        : null,
    }

    console.log('[Client]', editData ? 'Updating' : 'Creating', 'automation for account:', {
      accountId,
      username: selectedAccount?.username,
      platform_account_id: selectedAccount?.platform_account_id,
      platform,
    })

    try {
      const res = await fetch(editData ? `/api/automations/${editData.id}` : '/api/automations', {
        method: editData ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      // The API can return an HTML error page (gateway timeout, crash), so
      // never assume the body parses as JSON.
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(data.error || `Failed to ${editData ? 'update' : 'create'} automation`)
      }

      onCreated(data.automation)
    } catch (err: any) {
      console.error('[Client] Automation save failed:', err)
      setError(err?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto border shadow-xl"
        style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}
      >
        <div className="p-6 border-b" style={{ borderColor: 'var(--surface-3)' }}>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{editData ? 'Edit Automation' : 'Create Automation'}</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Platform */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Platform</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setPlatform('instagram'); setAccountId('') }}
                className={`flex-1 py-3 rounded-lg border-2 font-medium text-sm transition-colors ${
                  platform === 'instagram'
                    ? 'border-[#E1306C] bg-[#DD2A7B]/20 text-[#DD2A7B]'
                    : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                <InstagramIcon className="w-4 h-4 inline mr-2" /> Instagram
              </button>
              <button
                type="button"
                onClick={() => { setPlatform('facebook'); setAccountId('') }}
                className={`flex-1 py-3 rounded-lg border-2 font-medium text-sm transition-colors ${
                  platform === 'facebook'
                    ? 'border-[#1877F2] bg-[#1877F2]/20 text-[#1877F2]'
                    : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                <FacebookIcon className="w-4 h-4 inline mr-2" /> Facebook
              </button>
            </div>
          </div>

          {/* Account */}
          {availableAccounts.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Account</label>
              <select
                value={accountId}
                onChange={e => setAccountId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#DD2A7B]/50 bg-white dark:bg-gray-800"
                style={{ borderColor: 'var(--surface-3)' }}
              >
                {availableAccounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    @{acc.username} (ID: {acc.platform_account_id})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Trigger Type */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Trigger Type</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'comment_keyword', label: 'Keyword', icon: '💬' },
                { value: 'any_comment', label: 'Any Comment', icon: '✉️' },
                { value: 'dm_received', label: 'DM Reply', icon: '📩' },
                { value: 'story_reply', label: 'Story Reply', icon: '📖' },
                { value: 'story_mention', label: 'Story Mention', icon: '🏷️' },
              ].filter(opt => platform === 'instagram' || (opt.value !== 'story_reply' && opt.value !== 'story_mention')).map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTriggerType(opt.value)}
                  className={`py-3 rounded-lg border-2 text-center text-sm transition-colors ${
                    triggerType === opt.value
                      ? 'border-[#1877F2] bg-[#1877F2]/20 text-[#1877F2]'
                      : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="text-lg mb-1">{opt.icon}</div>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Apply to: whole account or one specific post (comment triggers only) */}
          {isCommentTrigger && (
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Apply to</label>
              <select
                value={mediaId}
                onChange={e => setMediaId(e.target.value)}
                disabled={mediaLoading}
                className="w-full px-3 py-2 border rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#DD2A7B]/50 bg-white dark:bg-gray-800 disabled:opacity-60"
                style={{ borderColor: 'var(--surface-3)' }}
              >
                <option value="">All posts (whole account)</option>
                {editData?.media_id && !mediaOptions.some(m => m.id === editData.media_id) && (
                  <option value={editData.media_id}>
                    {editData.media_caption ? `${editData.media_caption.slice(0, 60)}…` : `Post ${editData.media_id}`}
                  </option>
                )}
                {mediaOptions.map(m => (
                  <option key={m.id} value={m.id}>
                    {(m.caption?.trim()?.slice(0, 60) || `Untitled ${m.mediaType || 'post'}`)}
                    {m.caption && m.caption.length > 60 ? '…' : ''}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                {mediaLoading
                  ? 'Loading your recent posts…'
                  : 'Choose a specific post to run this automation only on that post, or keep "All posts" for the whole account.'}
              </p>
            </div>
          )}

          {/* Keywords (only for comment_keyword) */}
          {triggerType === 'comment_keyword' && (
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Keywords</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={e => setKeywordInput(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                  placeholder="e.g. LINK, INFO, FREE"
                  className="flex-1 px-3 py-2 border rounded-lg text-sm text-gray-900 dark:text-gray-100 uppercase focus:ring-2 focus:ring-[#DD2A7B]/50 bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500"
                  style={{ borderColor: 'var(--surface-3)' }}
                />
                <button type="button" onClick={addKeyword} className="px-3 py-2 border rounded-lg text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800" style={{ borderColor: 'var(--surface-3)' }}>
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {keywords.map((kw, i) => (
                  <span key={i} className="text-xs bg-[#DD2A7B]/20 text-[#DD2A7B] border border-[#DD2A7B]/30 px-2 py-1 rounded-full flex items-center gap-1">
                    {kw}
                    <button type="button" onClick={() => setKeywords(prev => prev.filter((_, j) => j !== i))}>×</button>
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">Followers type these keywords in comments to trigger your DM</p>
            </div>
          )}

          {/* DM Message */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              DM Message <span className="text-[#FA3E3E]">*</span>
            </label>
            <textarea
              value={dmMessage}
              onChange={e => setDmMessage(e.target.value)}
              placeholder={triggerType === 'dm_received' ? 'Thanks for reaching out! Here is more info...' : "Hey {name}! 👋 Here's the link you asked for: ..."}
              rows={4}
              maxLength={1000}
              className="w-full px-3 py-2 border rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#DD2A7B]/50 resize-none bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500"
              style={{ borderColor: 'var(--surface-3)' }}
            />
            <div className="flex justify-between mt-1">
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Use {'{name}'} for their name, {'{username}'} for @handle. Links work in DMs.
              </p>
              <span className="text-xs text-gray-600 dark:text-gray-300">{dmMessage.length}/1000</span>
            </div>
          </div>

          {/* Multi-step flow: follow-up messages */}
          <div>
            {flowSteps.map((step, i) => (
              <div key={i} className="mb-2">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                  Follow-up message {i + 1}
                </label>
                <div className="flex gap-2">
                  <textarea
                    value={step}
                    onChange={e => setFlowSteps(prev => prev.map((s, j) => (j === i ? e.target.value : s)))}
                    rows={2}
                    maxLength={1000}
                    placeholder="Sent right after the message above…"
                    className="flex-1 px-3 py-2 border rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#DD2A7B]/50 resize-none bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500"
                    style={{ borderColor: 'var(--surface-3)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setFlowSteps(prev => prev.filter((_, j) => j !== i))}
                    className="self-start px-2 py-2 text-gray-400 hover:text-red-500"
                    aria-label="Remove step"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {flowSteps.length < MAX_EXTRA_STEPS && (
              <button
                type="button"
                onClick={() => setFlowSteps(prev => [...prev, ''])}
                className="text-xs font-medium text-[#e85d3a] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add a follow-up message (build a flow)
              </button>
            )}
            {flowSteps.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">Messages are sent in order. Multi-step flows require a paid plan.</p>
            )}
          </div>

          {/* AI replies (DM auto-reply only) */}
          {triggerType === 'dm_received' && (
            <div className="rounded-lg border p-3" style={{ borderColor: 'var(--surface-3)' }}>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  AI replies <span className="text-xs font-normal text-gray-500">(beta)</span>
                </label>
                <button
                  type="button"
                  role="switch"
                  aria-checked={aiRepliesEnabled}
                  onClick={() => setAiRepliesEnabled(v => !v)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${aiRepliesEnabled ? 'bg-[#22c55e]' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${aiRepliesEnabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                Let AI write a personalized reply based on the incoming message, using your DM message above as the brand voice. Requires an AI API key to be configured; otherwise your DM message is sent as-is.
              </p>
            </div>
          )}

          {/* Follow Links */}
          {triggerType === 'dm_received' && (
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Ask user to follow (optional)
              </label>
              <div className="space-y-2">
                <input
                  type="url"
                  value={followFacebookUrl}
                  onChange={e => setFollowFacebookUrl(e.target.value)}
                  placeholder="Facebook page URL (e.g., https://facebook.com/yourpage)"
                  className="w-full px-3 py-2 border rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#DD2A7B]/50 bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500"
                  style={{ borderColor: 'var(--surface-3)' }}
                />
                <input
                  type="url"
                  value={followInstagramUrl}
                  onChange={e => setFollowInstagramUrl(e.target.value)}
                  placeholder="Instagram account URL (e.g., https://instagram.com/youraccount)"
                  className="w-full px-3 py-2 border rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#DD2A7B]/50 bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500"
                  style={{ borderColor: 'var(--surface-3)' }}
                />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                Add follow links to your DM message
              </p>
            </div>
          )}

          {/* Auto-reply on comment */}
          {triggerType !== 'dm_received' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                  Auto-reply on comment
                </label>
                <button
                  type="button"
                  onClick={() => setCommentReplyEnabled(prev => !prev)}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                >
                  {commentReplyEnabled
                    ? <ToggleRight className="w-6 h-6 text-[#22c55e]" />
                    : <ToggleLeft className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                  }
                </button>
              </div>
              {commentReplyEnabled && (
                <input
                  type="text"
                  value={commentReplyText}
                  onChange={e => setCommentReplyText(e.target.value)}
                  placeholder="Check your DMs! 📩"
                  maxLength={200}
                  className="w-full px-3 py-2 border rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#DD2A7B]/50 bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500"
                  style={{ borderColor: 'var(--surface-3)' }}
                />
              )}
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                {platform === 'instagram'
                  ? 'Posts a public reply under the comment after the DM is sent (e.g. "Check your DMs!")'
                  : 'Posts a public reply under the comment after the DM is sent'
                }
              </p>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 px-3 py-2 text-sm text-red-700 dark:text-red-300"
            >
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              style={{ borderColor: 'var(--surface-3)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !dmMessage || (triggerType === 'comment_keyword' && keywords.length === 0)}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-50"
              style={{ background: 'var(--accent)' }}
            >
              {loading ? (editData ? 'Updating…' : 'Creating…') : (editData ? 'Update Automation' : 'Create Automation')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
