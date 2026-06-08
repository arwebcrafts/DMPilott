'use client'

import { useRouter } from 'next/navigation'
import { useUserStore } from '@/stores/userStore'
import { createClient } from '@/lib/supabase/client'
import { Bell, Search, ChevronDown, LogOut, User, Settings } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function DashboardNavbar() {
  const { user, fetchUser } = useUserStore()
  const router = useRouter()
  const supabase = createClient()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchUser()
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const planColors: Record<string, string> = {
    free: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300',
    creator: 'bg-gradient-to-r from-[#DD2A7B]/20 to-[#8134AF]/20 text-[#DD2A7B] border border-[#DD2A7B]/30',
    pro: 'text-white',
  }

  return (
    <header className="h-16 border-b px-6 flex items-center justify-between sticky top-0 z-50" style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}>
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search automations..."
            className="w-full pl-10 pr-4 py-2 rounded-full text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#DD2A7B]/50 bg-white dark:bg-gray-800 border"
            style={{ borderColor: 'var(--surface-3)' }}
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Bell */}
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FA3E3E] rounded-full" />
        </motion.button>

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg px-2 py-1.5 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center text-white text-sm font-medium">
              {user?.fullName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {user?.fullName || 'User'}
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${planColors[user?.plan || 'free']}`}>
                {user?.plan || 'Free'}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </motion.button>

          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 top-full mt-2 w-56 rounded-xl shadow-xl border py-1 z-50"
              style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}
            >
              <div className="px-4 py-2" style={{ borderBottom: '1px solid var(--surface-3)' }}>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.fullName}</div>
                <div className="text-xs text-gray-600 dark:text-gray-300">{user?.email}</div>
              </div>
              <a href="/dashboard/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Settings className="w-4 h-4" /> Settings
              </a>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#FA3E3E] hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </header>
  )
}
