'use client'

import { useRouter } from 'next/navigation'
import { useUserStore } from '@/stores/userStore'
import { createClient } from '@/lib/supabase/client'
import { Bell, Search, ChevronDown, LogOut, User, Settings } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

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
    free: 'bg-[#F0F2F5] text-[#65676B]',
    creator: 'bg-gradient-to-r from-[#FDE8F0] to-[#F5E8F0] text-[#DD2A7B]',
    pro: 'bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white',
  }

  return (
    <header className="h-15 bg-white border-b border-[#E4E6EA] px-6 flex items-center justify-between sticky top-0 z-50">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#65676B]" />
          <input
            type="text"
            placeholder="Search automations..."
            className="w-full pl-10 pr-4 py-2 bg-[#F0F2F5] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#1877F2]"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Bell */}
        <button className="relative p-2 hover:bg-[#F0F2F5] rounded-lg transition-colors">
          <Bell className="w-5 h-5 text-[#65676B]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FA3E3E] rounded-full" />
        </button>

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 hover:bg-[#F0F2F5] rounded-lg px-2 py-1.5 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center text-white text-sm font-medium">
              {user?.fullName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-sm font-medium text-[#1C1E21]">
                {user?.fullName || 'User'}
              </div>
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${planColors[user?.plan || 'free']}`}>
                {user?.plan || 'Free'}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-[#65676B]" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border border-[#CED0D4] py-1 z-50">
              <div className="px-4 py-2 border-b border-[#F0F2F5]">
                <div className="text-sm font-medium text-[#1C1E21]">{user?.fullName}</div>
                <div className="text-xs text-[#65676B]">{user?.email}</div>
              </div>
              <a href="/dashboard/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-[#1C1E21] hover:bg-[#F0F2F5]">
                <Settings className="w-4 h-4" /> Settings
              </a>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#FA3E3E] hover:bg-[#FDECEA]"
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
