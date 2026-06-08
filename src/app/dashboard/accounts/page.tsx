'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/stores/userStore'
import { PLAN_LIMITS } from '@/lib/planGating'
import { InstagramIcon, FacebookIcon } from '@/components/ui/brand-icons'
import { Plus, RefreshCw, Trash2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const { user } = useUserStore()
  const supabase = createClient()

  const planLimits = user ? PLAN_LIMITS[user.plan] : PLAN_LIMITS.free
  const connectError = searchParams.get('error')
  const connected = searchParams.get('connected')

  useEffect(() => {
    fetchAccounts()
  }, [])

  async function fetchAccounts() {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return

    const { data } = await supabase
      .from('connected_accounts')
      .select('*')
      .eq('user_id', authUser.id)
      .order('created_at', { ascending: false })

    setAccounts(data || [])
    setLoading(false)
  }

  async function disconnectAccount(id: string) {
    if (!confirm('Disconnect this account? Your automations will be paused.')) return

    const { error } = await supabase.from('connected_accounts').delete().eq('id', id)
    if (!error) {
      setAccounts(prev => prev.filter(a => a.id !== id))
    }
  }

  function connectAccount(platform: 'instagram' | 'facebook') {
    window.location.href = `/api/meta/connect?platform=${platform}`
  }

  const igCount = accounts.filter(a => a.platform === 'instagram').length
  const fbCount = accounts.filter(a => a.platform === 'facebook').length
  const canAddMore = true // Allow unlimited account connections

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Connected Accounts</h1>
          <p className="text-[#8a8a9a] text-sm">
            {igCount + fbCount} account{igCount + fbCount !== 1 ? 's' : ''} connected
          </p>
        </div>
      </div>

      {/* Alerts */}
      {connected && (
        <div className="flex items-center gap-2 p-4 bg-[#22c55e]/20 border border-[#22c55e]/30 rounded-lg text-sm text-[#22c55e]">
          <CheckCircle2 className="w-4 h-4" />
          Account connected successfully! You can now create automations.
        </div>
      )}
      {connectError && (
        <div className="flex items-center gap-2 p-4 bg-[#FA3E3E]/20 border border-[#FA3E3E]/30 rounded-lg text-sm text-[#FA3E3E]">
          <AlertCircle className="w-4 h-4" />
          {connectError === 'denied' ? 'Connection was cancelled.' :
           connectError === 'no_account' ? 'No Instagram Business or Facebook Page found. Make sure you have a Business/Creator account.' :
           connectError === 'invalid_request' ? 'Redirect URI mismatch. Please check your Meta app settings.' :
           connectError === 'app_not_installed' ? 'App was not authorized. Please try connecting again.' :
           `Connection failed: ${searchParams.get('message') || connectError}`}
        </div>
      )}

      {/* Progress bar - hidden since account limits are removed */}
      {false && planLimits.maxAccounts !== Infinity && (
        <div className="glass-card rounded-lg p-4 border border-white/10">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-[#8a8a9a]">Accounts used</span>
            <span className="font-medium text-white">{igCount + fbCount} / {planLimits.maxAccounts}</span>
          </div>
          <div className="h-2 bg-[#22223a] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((igCount + fbCount) / planLimits.maxAccounts) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          {igCount + fbCount >= planLimits.maxAccounts && (
            <p className="text-xs text-[#8a8a9a] mt-2">
              Upgrade to Pro for up to 20 accounts.{' '}
              <a href="/dashboard/billing" className="text-[#1877F2] hover:underline">Upgrade →</a>
            </p>
          )}
        </div>
      )}

      {/* Account cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {accounts.map((account, index) => (
          <motion.div
            key={account.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card rounded-xl border border-white/10 overflow-hidden"
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
                    <div className="font-semibold text-white">
                      {account.display_name || account.username || 'Account'}
                    </div>
                    <div className="text-sm text-[#8a8a9a]">@{account.username || 'unknown'}</div>
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
                <p className="text-sm text-[#8a8a9a] mb-3">
                  {account.follower_count.toLocaleString()} followers
                </p>
              )}

              <div className="flex gap-2">
                <a
                  href={`/api/meta/connect?platform=${account.platform}`}
                  className="flex items-center gap-1 px-3 py-1.5 glass-card border border-white/10 rounded-lg text-sm text-[#8a8a9a] hover:bg-white/10 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reconnect
                </a>
                <button
                  onClick={() => disconnectAccount(account.id)}
                  className="flex items-center gap-1 px-3 py-1.5 glass-card border border-[#FA3E3E]/30 rounded-lg text-sm text-[#FA3E3E] hover:bg-[#FA3E3E]/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Disconnect
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Add account cards */}
        {canAddMore && (
          <>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => connectAccount('instagram')}
              className="glass-card rounded-xl border-2 border-dashed border-white/20 p-6 hover:border-[#DD2A7B]/50 hover:bg-[#DD2A7B]/10 transition-colors text-left"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-white">Connect Instagram</div>
                  <div className="text-sm text-[#8a8a9a]">Business or Creator account</div>
                </div>
              </div>
              <p className="text-xs text-[#8a8a9a]">
                Powered by Meta&apos;s official API ✓ Secure OAuth connection
              </p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => connectAccount('facebook')}
              className="glass-card rounded-xl border-2 border-dashed border-white/20 p-6 hover:border-[#1877F2]/50 hover:bg-[#1877F2]/10 transition-colors text-left"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-[#1877F2] flex items-center justify-center">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-white">Connect Facebook</div>
                  <div className="text-sm text-[#8a8a9a]">Facebook Page</div>
                </div>
              </div>
              <p className="text-xs text-[#8a8a9a]">
                Requires a Facebook Page linked to your account
              </p>
            </motion.button>
          </>
        )}
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-[#8a8a9a]" />
        </div>
      )}

      {/* Help text */}
      {accounts.length === 0 && !loading && (
        <div className="text-center py-8 text-[#8a8a9a] text-sm">
          <p>Need help connecting? Make sure you have an Instagram Business/Creator account</p>
          <p>or a Facebook Page linked to your profile.</p>
        </div>
      )}
    </div>
  )
}
