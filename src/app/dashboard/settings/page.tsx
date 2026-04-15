'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { Loader2, User as UserIcon, Mail, LogOut } from 'lucide-react'

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
        <Loader2 className="w-6 h-6 animate-spin text-[#65676B]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1C1E21]">Settings</h1>
        <p className="text-[#65676B] text-sm">Manage your account settings</p>
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-xl border border-[#E4E6EA] p-6">
        <h2 className="text-lg font-semibold text-[#1C1E21] mb-4">Account Information</h2>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-[#F0F2F5] rounded-lg">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-[#1C1E21]">
                {profile?.full_name || 'User'}
              </div>
              <div className="text-sm text-[#65676B] flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                {user?.email}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-[#65676B] mb-1">User ID</div>
              <div className="font-mono text-[#1C1E21] bg-[#F0F2F5] p-2 rounded">
                {user?.id}
              </div>
            </div>
            <div>
              <div className="text-[#65676B] mb-1">Plan</div>
              <div className="font-medium text-[#1C1E21] capitalize">
                {profile?.plan || 'free'}
              </div>
            </div>
            <div>
              <div className="text-[#65676B] mb-1">Email Confirmed</div>
              <div className="text-[#1C1E21]">
                {user?.email_confirmed_at ? 'Yes' : 'No'}
              </div>
            </div>
            <div>
              <div className="text-[#65676B] mb-1">Created At</div>
              <div className="text-[#1C1E21]">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sign Out */}
      <div className="bg-white rounded-xl border border-[#E4E6EA] p-6">
        <h2 className="text-lg font-semibold text-[#1C1E21] mb-4">Session</h2>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-2 bg-[#FDECEA] text-[#FA3E3E] rounded-lg font-medium text-sm hover:bg-[#fcd5ce] transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  )
}
