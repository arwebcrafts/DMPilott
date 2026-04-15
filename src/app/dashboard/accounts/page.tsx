'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/stores/userStore'
import { PLAN_LIMITS } from '@/lib/planGating'
import { InstagramIcon, FacebookIcon } from '@/components/ui/brand-icons'
import { Plus, RefreshCw, Trash2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

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
  const canAddMore = igCount + fbCount < planLimits.maxAccounts

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1E21]">Connected Accounts</h1>
          <p className="text-[#65676B] text-sm">
            {igCount + fbCount} of {planLimits.maxAccounts === Infinity ? 'unlimited' : planLimits.maxAccounts} accounts connected
          </p>
        </div>
      </div>

      {/* Alerts */}
      {connected && (
        <div className="flex items-center gap-2 p-4 bg-[#E8F5E9] border border-[#31A24C] rounded-lg text-sm text-[#31A24C]">
          <CheckCircle2 className="w-4 h-4" />
          Account connected successfully! You can now create automations.
        </div>
      )}
      {connectError && (
        <div className="flex items-center gap-2 p-4 bg-[#FDECEA] border border-[#FA3E3E] rounded-lg text-sm text-[#FA3E3E]">
          <AlertCircle className="w-4 h-4" />
          {connectError === 'denied' ? 'Connection was cancelled.' :
           connectError === 'no_account' ? 'No Instagram Business or Facebook Page found. Make sure you have a Business/Creator account.' :
           connectError === 'invalid_request' ? 'Redirect URI mismatch. Please check your Meta app settings.' :
           connectError === 'app_not_installed' ? 'App was not authorized. Please try connecting again.' :
           `Connection failed: ${searchParams.get('message') || connectError}`}
        </div>
      )}

      {/* Progress bar */}
      {planLimits.maxAccounts !== Infinity && (
        <div className="bg-white rounded-lg p-4 border border-[#E4E6EA]">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-[#65676B]">Accounts used</span>
            <span className="font-medium text-[#1C1E21]">{igCount + fbCount} / {planLimits.maxAccounts}</span>
          </div>
          <div className="h-2 bg-[#F0F2F5] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] rounded-full"
              style={{ width: `${((igCount + fbCount) / planLimits.maxAccounts) * 100}%` }}
            />
          </div>
          {igCount + fbCount >= planLimits.maxAccounts && (
            <p className="text-xs text-[#65676B] mt-2">
              Upgrade to Pro for up to 20 accounts.{' '}
              <a href="/dashboard/billing" className="text-[#1877F2] hover:underline">Upgrade →</a>
            </p>
          )}
        </div>
      )}

      {/* Account cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {accounts.map((account) => (
          <div key={account.id} className="bg-white rounded-xl border border-[#E4E6EA] overflow-hidden">
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
                    <div className="font-semibold text-[#1C1E21]">
                      {account.display_name || account.username || 'Account'}
                    </div>
                    <div className="text-sm text-[#65676B]">@{account.username || 'unknown'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {account.webhook_subscribed ? (
                    <span className="text-xs bg-[#E8F5E9] text-[#31A24C] px-2 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Active
                    </span>
                  ) : (
                    <span className="text-xs bg-[#FEF9E7] text-[#F7B928] px-2 py-1 rounded-full flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Setup needed
                    </span>
                  )}
                </div>
              </div>

              {account.follower_count > 0 && (
                <p className="text-sm text-[#65676B] mb-3">
                  {account.follower_count.toLocaleString()} followers
                </p>
              )}

              <div className="flex gap-2">
                <a
                  href={`/api/meta/connect?platform=${account.platform}`}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#F0F2F5] rounded-lg text-sm text-[#65676B] hover:bg-[#E4E6EA] transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reconnect
                </a>
                <button
                  onClick={() => disconnectAccount(account.id)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#FDECEA] rounded-lg text-sm text-[#FA3E3E] hover:bg-[#fcd5ce] transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Disconnect
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Add account cards */}
        {canAddMore && (
          <>
            <button
              onClick={() => connectAccount('instagram')}
              className="bg-white rounded-xl border-2 border-dashed border-[#CED0D4] p-6 hover:border-[#E1306C] hover:bg-[#FDE8F0] transition-colors text-left"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-[#1C1E21]">Connect Instagram</div>
                  <div className="text-sm text-[#65676B]">Business or Creator account</div>
                </div>
              </div>
              <p className="text-xs text-[#65676B]">
                Powered by Meta&apos;s official API ✓ Secure OAuth connection
              </p>
            </button>

            <button
              onClick={() => connectAccount('facebook')}
              className="bg-white rounded-xl border-2 border-dashed border-[#CED0D4] p-6 hover:border-[#1877F2] hover:bg-[#E7F0FD] transition-colors text-left"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-[#1877F2] flex items-center justify-center">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-[#1C1E21]">Connect Facebook</div>
                  <div className="text-sm text-[#65676B]">Facebook Page</div>
                </div>
              </div>
              <p className="text-xs text-[#65676B]">
                Requires a Facebook Page linked to your account
              </p>
            </button>
          </>
        )}
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-[#65676B]" />
        </div>
      )}

      {/* Help text */}
      {accounts.length === 0 && !loading && (
        <div className="text-center py-8 text-[#65676B] text-sm">
          <p>Need help connecting? Make sure you have an Instagram Business/Creator account</p>
          <p>or a Facebook Page linked to your profile.</p>
        </div>
      )}
    </div>
  )
}
