'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/stores/userStore'
import { PLAN_LIMITS } from '@/lib/planGating'
import { InstagramIcon, FacebookIcon } from '@/components/ui/brand-icons'
import { Plus, RefreshCw, Trash2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { openOAuthConnect, isOAuthMessage } from '@/lib/oauth/popup'

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState<'instagram' | 'facebook' | null>(null)
  const [subscribing, setSubscribing] = useState<string | null>(null)
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const searchParams = useSearchParams()
  const { user } = useUserStore()
  const supabase = createClient()

  const planLimits = user ? PLAN_LIMITS[user.plan] : PLAN_LIMITS.free
  const connectError = searchParams.get('error')
  const connected = searchParams.get('connected')

  const fetchAccounts = useCallback(async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return

    const { data } = await supabase
      .from('connected_accounts')
      .select('*')
      .eq('user_id', authUser.id)
      .order('created_at', { ascending: false })

    setAccounts(data || [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || !isOAuthMessage(event.data)) return

      setConnecting(null)

      if (event.data.connected) {
        const label = event.data.platform === 'facebook' ? 'Facebook Page' : 'Instagram'
        setBanner({ type: 'success', text: `${label} connected successfully.` })
        fetchAccounts()
        return
      }

      const msg = event.data.message || event.data.error || 'Connection failed'
      setBanner({ type: 'error', text: msg })
    }

    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [fetchAccounts])

  async function disconnectAccount(id: string) {
    if (!confirm('Disconnect this account? Your automations will be paused.')) return

    const { error } = await supabase.from('connected_accounts').delete().eq('id', id)
    if (!error) {
      setAccounts(prev => prev.filter(a => a.id !== id))
    }
  }

  function connectAccount(platform: 'instagram' | 'facebook') {
    setConnecting(platform)
    setBanner(null)
    openOAuthConnect(platform)
  }

  function reconnectAccount(platform: 'instagram' | 'facebook') {
    connectAccount(platform)
  }

  async function retrySubscription(accountId: string) {
    setSubscribing(accountId)
    setBanner(null)
    try {
      const res = await fetch(`/api/accounts/${accountId}/subscribe`, { method: 'POST' })
      const body = await res.json()
      setBanner(res.ok && body.success
        ? { type: 'success', text: body.message }
        : { type: 'error', text: body.error || body.message || 'Meta rejected the subscription.' })
      await fetchAccounts()
    } catch (err: any) {
      setBanner({ type: 'error', text: err?.message || 'Could not reach the server.' })
    } finally {
      setSubscribing(null)
    }
  }

  const igAccounts = accounts.filter(a => a.platform === 'instagram')
  const fbAccounts = accounts.filter(a => a.platform === 'facebook')
  const igCount = igAccounts.length
  const fbCount = fbAccounts.length
  const totalCount = igCount + fbCount
  const canAddMore = planLimits.maxAccounts === Infinity || totalCount < planLimits.maxAccounts
  const showInstagramConnect = canAddMore && igCount === 0
  const showFacebookConnect = canAddMore && fbCount === 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Connected Accounts</h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            {totalCount} account{totalCount !== 1 ? 's' : ''} connected
          </p>
        </div>
      </div>

      {banner && (
        <div className={`flex items-center gap-2 p-4 rounded-lg text-sm border ${
          banner.type === 'success'
            ? 'bg-[#22c55e]/20 border-[#22c55e]/30 text-[#22c55e]'
            : 'bg-[#FA3E3E]/20 border-[#FA3E3E]/30 text-[#FA3E3E]'
        }`}>
          {banner.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {banner.text}
        </div>
      )}

      {connected && !banner && (
        <div className="flex items-center gap-2 p-4 bg-[#22c55e]/20 border border-[#22c55e]/30 rounded-lg text-sm text-[#22c55e]">
          <CheckCircle2 className="w-4 h-4" />
          Account connected successfully! You can now create automations.
        </div>
      )}
      {connectError && !banner && (
        <div className="flex items-center gap-2 p-4 bg-[#FA3E3E]/20 border border-[#FA3E3E]/30 rounded-lg text-sm text-[#FA3E3E]">
          <AlertCircle className="w-4 h-4" />
          {connectError === 'denied' ? 'Connection was cancelled.' :
           connectError === 'no_account' ? 'No Instagram Business or Facebook Page found. Make sure you have a Business/Creator account.' :
           connectError === 'invalid_request' ? 'Redirect URI mismatch. Please check your Meta app settings.' :
           connectError === 'app_not_installed' ? 'App was not authorized. Please try connecting again.' :
           connectError === 'invalid_platform' ? 'Wrong connect flow. Use the Instagram button for Instagram and Facebook button for Facebook Pages.' :
           `Connection failed: ${searchParams.get('message') || connectError}`}
        </div>
      )}

      {planLimits.maxAccounts !== Infinity && (
        <div className="rounded-lg p-4 border shadow-sm" style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600 dark:text-gray-300">Accounts used</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">{totalCount} / {planLimits.maxAccounts}</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-3)' }}>
            <motion.div
              className="h-full bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(totalCount / planLimits.maxAccounts) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {accounts.map((account, index) => (
          <motion.div
            key={account.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="rounded-xl border overflow-hidden shadow-sm"
            style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}
          >
            <div className={`h-1 ${account.platform === 'instagram'
              ? 'bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF]'
              : 'bg-[#1877F2]'
            }`} />
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {account.profile_picture_url ? (
                    <img src={account.profile_picture_url} className="w-12 h-12 rounded-full" alt="" />
                  ) : (
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                      account.platform === 'instagram' ? 'bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF]' : 'bg-[#1877F2]'
                    }`}>
                      {account.platform === 'instagram' ? <InstagramIcon className="w-6 h-6" /> : <FacebookIcon className="w-6 h-6" />}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                      {account.display_name || account.username || 'Account'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {account.platform === 'instagram' ? '@' : ''}{account.username || 'unknown'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 capitalize">{account.platform}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {account.webhook_subscribed ? (
                    <span className="text-xs bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30 px-2 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Active
                    </span>
                  ) : (
                    <span className="text-xs bg-[#F7B928]/20 text-[#F7B928] border border-[#F7B928]/30 px-2 py-1 rounded-full flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Setup needed
                    </span>
                  )}
                </div>
              </div>

              {account.follower_count > 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  {account.follower_count.toLocaleString()} followers
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => reconnectAccount(account.platform)}
                  className="flex items-center gap-1 px-3 py-1.5 border rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  style={{ borderColor: 'var(--surface-3)' }}
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reconnect
                </button>
                {account.platform === 'facebook' && !account.webhook_subscribed && (
                  <button
                    type="button"
                    onClick={() => retrySubscription(account.id)}
                    disabled={subscribing === account.id}
                    className="flex items-center gap-1 px-3 py-1.5 border rounded-lg text-sm text-[#F7B928] hover:bg-[#F7B928]/10 transition-colors disabled:opacity-60"
                    style={{ borderColor: '#F7B928' }}
                  >
                    {subscribing === account.id
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <AlertCircle className="w-3.5 h-3.5" />}
                    Fix setup
                  </button>
                )}
                <button
                  onClick={() => disconnectAccount(account.id)}
                  className="flex items-center gap-1 px-3 py-1.5 border rounded-lg text-sm text-[#FA3E3E] hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  style={{ borderColor: 'var(--surface-3)' }}
                >
                  <Trash2 className="w-3.5 h-3.5" /> Disconnect
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {showInstagramConnect && (
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => connectAccount('instagram')}
            disabled={connecting === 'instagram'}
            className="rounded-xl border-2 border-dashed p-6 hover:border-[#DD2A7B]/50 hover:bg-[#DD2A7B]/10 transition-colors text-left disabled:opacity-60"
            style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center">
                {connecting === 'instagram' ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Plus className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">Connect Instagram</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Business or Creator account</div>
              </div>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Opens Meta login in a new tab · Official Instagram API
            </p>
          </motion.button>
        )}

        {showFacebookConnect && (
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => connectAccount('facebook')}
            disabled={connecting === 'facebook'}
            className="rounded-xl border-2 border-dashed p-6 hover:border-[#1877F2]/50 hover:bg-[#1877F2]/10 transition-colors text-left disabled:opacity-60"
            style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-[#1877F2] flex items-center justify-center">
                {connecting === 'facebook' ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Plus className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">Connect Facebook</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Facebook Page only</div>
              </div>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Opens Meta login in a new tab · Requires a Facebook Page
            </p>
          </motion.button>
        )}
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400 dark:text-gray-500" />
        </div>
      )}

      {accounts.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-600 dark:text-gray-300 text-sm">
          <p>Instagram connect uses Instagram Business Login.</p>
          <p>Facebook connect links a Facebook Page for Page comment automation.</p>
        </div>
      )}
    </div>
  )
}
