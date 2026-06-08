'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUserStore } from '@/stores/userStore'
import { PLAN_LIMITS } from '@/lib/planGating'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: '🏠' },
  { href: '/dashboard/automations', label: 'Automations', icon: '⚡' },
  { href: '/dashboard/analytics', label: 'Analytics', icon: '📊' },
  { href: '/dashboard/giveaways', label: 'Giveaways', icon: '🎁' },
  { href: '/dashboard/accounts', label: 'Accounts', icon: '👥' },
  { href: '/dashboard/billing', label: 'Billing', icon: '💳' },
  { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
]

export default function DashboardSidebar() {
  const pathname = usePathname()
  const { user, accounts } = useUserStore()

  const planLimits = user ? PLAN_LIMITS[user.plan] : PLAN_LIMITS.free
  const dmsUsed = user?.dmsUsedThisMonth || 0
  const dmsLimit = planLimits.dmsPerMonth
  const dmsPercent = dmsLimit === Infinity ? 0 : (dmsUsed / dmsLimit) * 100

  return (
    <aside className="w-60 border-r min-h-[calc(100vh-64px)] hidden md:block relative" style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}>
      <div className="p-4">
        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 mb-6"
        >
          <Link href="/dashboard" className="text-xl font-bold text-gray-900 dark:text-gray-100">
            DMPilot
          </Link>
        </motion.div>

        {/* Nav */}
        <nav className="space-y-1">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href))

            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                    isActive
                      ? 'bg-[#DD2A7B] text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                  )}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              </motion.div>
            )
          })}
        </nav>
      </div>

      {/* Plan card at bottom */}
      <div className="absolute bottom-4 left-0 w-60 px-4">
        <div className="rounded-xl p-4 border shadow-sm" style={{ background: 'var(--surface-1)', borderColor: 'var(--surface-3)' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 capitalize">
              {user?.plan || 'Free'} Plan
            </span>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/dashboard/billing"
                className="text-xs text-[#1877F2] hover:text-[#1877F2]/80 transition-colors"
              >
                Upgrade
              </Link>
            </motion.div>
          </div>
          {dmsLimit !== Infinity ? (
            <>
              <div className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                {dmsUsed.toLocaleString()} / {dmsLimit.toLocaleString()} DMs
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-3)' }}>
                <motion.div
                  className={`h-full rounded-full transition-all ${
                    dmsPercent > 95 ? 'bg-[#FA3E3E]' :
                    dmsPercent > 80 ? 'bg-[#F7B928]' :
                    'bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF]'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(dmsPercent, 100)}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </>
          ) : (
            <div className="text-xs text-[#22c55e] font-medium">Unlimited DMs</div>
          )}
        </div>
      </div>
    </aside>
  )
}
