'use client'

import { useRouter } from 'next/navigation'
import { useUserStore } from '@/stores/userStore'
import { createClient } from '@/lib/supabase/client'
import { ChevronDown, LogOut, User, Settings, Zap } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function DashboardNavbar() {
  const { user, fetchUser } = useUserStore()
  const router = useRouter()
  const supabase = createClient()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

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

  return (
    <header
      className="h-16 border-b px-4 sm:px-6 flex items-center justify-between sticky top-0 z-50"
      style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}
    >
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/automations"
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          style={{ borderColor: 'var(--surface-3)' }}
        >
          <Zap className="w-4 h-4 text-[#DD2A7B]" />
          New Automation
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative" ref={dropdownRef}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl px-2 py-1.5 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center text-white text-sm font-medium">
              {user?.fullName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-tight">
                {user?.fullName || 'User'}
              </div>
              <div className="text-xs text-gray-500 capitalize">{user?.plan || 'free'} plan</div>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </motion.button>

          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-48 rounded-xl border shadow-lg py-1 z-50"
              style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}
            >
              <Link
                href="/dashboard/settings"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <Settings className="w-4 h-4" /> Settings
              </Link>
              <Link
                href="/dashboard/billing"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <User className="w-4 h-4" /> Billing
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
