'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { Loader2, User as UserIcon, Mail, LogOut } from 'lucide-react'
import { motion } from 'framer-motion'

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-[#8a8a9a]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-[#8a8a9a] text-sm">Manage your account settings</p>
      </div>

      {/* Account Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-xl border border-white/10 p-6"
      >
        <h2 className="text-lg font-semibold text-white mb-4">Account Information</h2>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-[#1a1a2e] rounded-lg">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-white">
                {profile?.full_name || 'User'}
              </div>
              <div className="text-sm text-[#8a8a9a] flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                {user?.email}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-[#8a8a9a] mb-1">User ID</div>
              <div className="font-mono text-white bg-[#1a1a2e] p-2 rounded">
                {user?.id}
              </div>
            </div>
            <div>
              <div className="text-[#8a8a9a] mb-1">Plan</div>
              <div className="font-medium text-white capitalize">
                {profile?.plan || 'free'}
              </div>
            </div>
            <div>
              <div className="text-[#8a8a9a] mb-1">Email Confirmed</div>
              <div className="text-white">
                {user?.email_confirmed_at ? 'Yes' : 'No'}
              </div>
            </div>
            <div>
              <div className="text-[#8a8a9a] mb-1">Created At</div>
              <div className="text-white">
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
        transition={{ delay: 0.1 }}
        className="glass-card rounded-xl border border-white/10 p-6"
      >
        <h2 className="text-lg font-semibold text-white mb-4">Session</h2>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-2 glass-card border border-[#FA3E3E]/30 text-[#FA3E3E] rounded-lg font-medium text-sm hover:bg-[#FA3E3E]/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </motion.button>
      </motion.div>
    </div>
  )
}
