'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { Loader2, User as UserIcon, Mail, LogOut, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(profile)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  async function handleDeleteAccount() {
    setDeleting(true)
    setDeleteError(null)
    try {
      const res = await fetch('/api/account', { method: 'DELETE' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Could not delete your account. Please contact support.')
      }
      await supabase.auth.signOut()
      window.location.href = '/?deleted=1'
    } catch (err: any) {
      setDeleteError(err.message)
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400 dark:text-gray-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="text-gray-600 dark:text-gray-300 text-sm">Manage your account settings</p>
      </div>

      {/* Account Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border p-6 shadow-sm"
        style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Account Information</h2>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-lg" style={{ background: 'var(--surface-1)' }}>
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900 dark:text-gray-100">
                {profile?.full_name || 'User'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                {user?.email}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-600 dark:text-gray-300 mb-1">User ID</div>
              <div className="font-mono text-gray-900 dark:text-gray-100 p-2 rounded" style={{ background: 'var(--surface-1)' }}>
                {user?.id}
              </div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-300 mb-1">Plan</div>
              <div className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                {profile?.plan || 'free'}
              </div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-300 mb-1">Email Confirmed</div>
              <div className="text-gray-900 dark:text-gray-100">
                {user?.email_confirmed_at ? 'Yes' : 'No'}
              </div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-300 mb-1">Created At</div>
              <div className="text-gray-900 dark:text-gray-100">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Sign Out */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border p-6 shadow-sm"
        style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Session</h2>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-2 border text-[#FA3E3E] rounded-lg font-medium text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          style={{ borderColor: 'var(--surface-3)' }}
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </motion.button>
      </motion.div>

      {/* Delete Account — required by Meta's data deletion policy and linked
          from the public /data-deletion page. */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border p-6 shadow-sm"
        style={{ background: 'var(--surface-0)', borderColor: '#FA3E3E40' }}
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Delete Account</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Permanently erases your profile, all connected Instagram and Facebook accounts and their
          access tokens, every automation, all message history, and your Link-in-Bio page.
          This cannot be undone.
        </p>

        {deleteError && (
          <p className="text-sm text-[#FA3E3E] mb-3">{deleteError}</p>
        )}

        {!confirmingDelete ? (
          <button
            onClick={() => setConfirmingDelete(true)}
            className="flex items-center gap-2 px-4 py-2 border text-[#FA3E3E] rounded-lg font-medium text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            style={{ borderColor: '#FA3E3E' }}
          >
            <Trash2 className="w-4 h-4" />
            Delete My Account
          </button>
        ) : (
          <div className="space-y-3">
            <label className="block text-sm text-gray-700 dark:text-gray-200">
              Type <strong>DELETE</strong> to confirm:
              <input
                value={deleteConfirmText}
                onChange={e => setDeleteConfirmText(e.target.value)}
                className="mt-1 block w-full max-w-xs px-3 py-2 rounded-lg border text-sm bg-transparent"
                style={{ borderColor: 'var(--surface-3)' }}
                placeholder="DELETE"
                autoFocus
              />
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || deleting}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm text-white bg-[#FA3E3E] disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                {deleting
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Trash2 className="w-4 h-4" />}
                {deleting ? 'Deleting…' : 'Permanently delete'}
              </button>
              <button
                onClick={() => { setConfirmingDelete(false); setDeleteConfirmText(''); setDeleteError(null) }}
                disabled={deleting}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:underline disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
