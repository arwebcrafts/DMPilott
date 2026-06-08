'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/stores/userStore'
import { PLAN_LIMITS } from '@/lib/planGating'
import { Plus, Edit2, Trash2, MoreHorizontal, Zap, MessageSquare, ToggleLeft, ToggleRight } from 'lucide-react'
import { InstagramIcon, FacebookIcon } from '@/components/ui/brand-icons'
import { motion } from 'framer-motion'

interface Automation {
  id: string
  name: string
  platform: 'instagram' | 'facebook'
  trigger_type: string
  keywords: string[]
  dm_message: string
  dm_video_url?: string | null
  is_active: boolean
  total_dms_sent: number
  created_at: string
  connected_accounts?: { username: string }
}

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<Automation[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const { user } = useUserStore()
  const supabase = createClient()
  const [accounts, setAccounts] = useState<any[]>([])

  const planLimits = user ? PLAN_LIMITS[user.plan] : PLAN_LIMITS.free

  useEffect(() => {
    fetchAutomations()
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

  const igAccounts = accounts.filter(a => a.platform === 'instagram')
  const fbAccounts = accounts.filter(a => a.platform === 'facebook')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Automations</h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm">Manage your DM automations for Instagram & Facebook</p>
        </div>
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
              <a href="/dashboard/accounts" className="text-[#e85d3a] hover:underline">Connect an account</a> first
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
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
                  @{auto.connected_accounts?.username || 'account'}
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
                    <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
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
    </div>
  )
}

function CreateAutomationModal({
  igAccounts,
  fbAccounts,
  onClose,
  onCreated,
}: {
  igAccounts: any[]
  fbAccounts: any[]
  onClose: () => void
  onCreated: (a: Automation) => void
}) {
  const [platform, setPlatform] = useState<'instagram' | 'facebook'>(
    igAccounts.length > 0 ? 'instagram' : fbAccounts.length > 0 ? 'facebook' : 'instagram'
  )
  const [triggerType, setTriggerType] = useState('comment_keyword')
  const [keywords, setKeywords] = useState<string[]>([])
  const [keywordInput, setKeywordInput] = useState('')
  const [dmMessage, setDmMessage] = useState('')
  const [followFacebookUrl, setFollowFacebookUrl] = useState('')
  const [followInstagramUrl, setFollowInstagramUrl] = useState('')
  const [commentReplyEnabled, setCommentReplyEnabled] = useState(true)
  const [commentReplyText, setCommentReplyText] = useState('Check your DMs! 📩')
  const [loading, setLoading] = useState(false)
  const [accountId, setAccountId] = useState('')
  const supabase = createClient()

  const availableAccounts = platform === 'instagram' ? igAccounts : fbAccounts

  useEffect(() => {
    if (availableAccounts.length > 0 && !accountId) {
      setAccountId(availableAccounts[0].id)
    }
  }, [platform])

  function addKeyword() {
    const kw = keywordInput.trim().toUpperCase()
    if (kw && !keywords.includes(kw) && keywords.length < 10) {
      setKeywords([...keywords, kw])
      setKeywordInput('')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!accountId || !dmMessage) return
    if (triggerType === 'comment_keyword' && keywords.length === 0) return

    setLoading(true)

    const selectedAccount = availableAccounts.find(a => a.id === accountId)
    console.log('[Client] Creating automation for account:', {
      accountId,
      username: selectedAccount?.username,
      platform_account_id: selectedAccount?.platform_account_id,
      platform,
    })

    const res = await fetch('/api/automations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
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
      }),
    })

    const data = await res.json()

    if (res.ok) {
      console.log('[Client] ✓ Automation created successfully:', data.automation)
      onCreated(data.automation)
    } else {
      console.error('[Client] ❌ Failed to create automation:', data.error)
      alert(data.error || 'Failed to create automation')
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
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Create Automation</h2>
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
              ].map(opt => (
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
                {platform === 'instagram' ? (
                  <span className="text-xs text-[#ff6b6b]">Unavailable for Instagram</span>
                ) : (
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
                )}
              </div>
              {platform === 'facebook' && commentReplyEnabled && (
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
                  ? 'Instagram comment replies require additional Meta approval (currently pending)'
                  : 'Public reply posted on the comment after DM is sent'
                }
              </p>
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
              {loading ? 'Creating...' : 'Create Automation'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
