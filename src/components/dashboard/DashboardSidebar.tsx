'use client'

import Link from 'next/link'
import { Suspense } from 'react'
import { usePathname } from 'next/navigation'
import { useUserStore } from '@/stores/userStore'
import { PLAN_LIMITS } from '@/lib/planGating'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { LinkInBioSidebarNav } from './LinkInBioSidebarNav'
import {
  LayoutDashboard,
  Zap,
  BarChart3,
  Users,
  CreditCard,
  Settings,
  Gift,
} from 'lucide-react'

const mainNav = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/automations', label: 'Automations', icon: Zap },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/accounts', label: 'Accounts', icon: Users },
]

const toolsNav = [
  { href: '/dashboard/giveaways', label: 'Giveaways', icon: Gift, badge: 'Soon' },
]

const bottomNav = [
  { href: '/dashboard/billing', label: 'Billing', icon: CreditCard },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

function NavLink({
  href,
  label,
  icon: Icon,
  badge,
  isActive,
  index,
}: {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  isActive: boolean
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Link
        href={href}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
          isActive
            ? 'bg-gradient-to-r from-[#F58529]/90 via-[#DD2A7B] to-[#8134AF] text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/80 hover:text-gray-900 dark:hover:text-gray-100'
        )}
      >
        <Icon className="w-4 h-4 flex-shrink-0" />
        <span className="flex-1">{label}</span>
        {badge && (
          <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400">
            {badge}
          </span>
        )}
      </Link>
    </motion.div>
  )
}

export default function DashboardSidebar() {
  const pathname = usePathname()
  const { user } = useUserStore()

  const planLimits = user ? PLAN_LIMITS[user.plan] : PLAN_LIMITS.free
  const dmsUsed = user?.dmsUsedThisMonth || 0
  const dmsLimit = planLimits.dmsPerMonth
  const dmsPercent = dmsLimit === Infinity ? 0 : (dmsUsed / dmsLimit) * 100

  function isActive(href: string) {
    return pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
  }

  let navIndex = 0

  return (
    <aside
      className="w-64 border-r min-h-[calc(100vh-64px)] hidden md:flex flex-col"
      style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}
    >
      <div className="p-4 flex-1">
        <Link href="/dashboard" className="flex items-center gap-2.5 mb-8 px-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center">
            <span className="text-white text-sm font-bold">D</span>
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">DMPilot</span>
        </Link>

        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 px-3 mb-2">Automation</p>
        <nav className="space-y-1 mb-6">
          {mainNav.map((item) => (
            <NavLink key={item.href} {...item} isActive={isActive(item.href)} index={navIndex++} />
          ))}
        </nav>

        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 px-3 mb-2">Tools</p>
        <nav className="space-y-1 mb-6">
          <Suspense fallback={
            <div className="px-3 py-2.5 rounded-xl text-sm text-gray-400">Link in Bio...</div>
          }>
            <LinkInBioSidebarNav index={navIndex++} />
          </Suspense>
          {toolsNav.map((item) => (
            <NavLink key={item.href} {...item} isActive={isActive(item.href)} index={navIndex++} />
          ))}
        </nav>

        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 px-3 mb-2">Account</p>
        <nav className="space-y-1">
          {bottomNav.map((item) => (
            <NavLink key={item.href} {...item} isActive={isActive(item.href)} index={navIndex++} />
          ))}
        </nav>
      </div>

      <div className="p-4 border-t" style={{ borderColor: 'var(--surface-3)' }}>
        <div className="rounded-xl p-4 border" style={{ background: 'var(--surface-1)', borderColor: 'var(--surface-3)' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 capitalize">
              {user?.plan || 'Free'} Plan
            </span>
            <Link href="/dashboard/billing" className="text-xs text-[#DD2A7B] hover:underline font-medium">
              Upgrade
            </Link>
          </div>
          {dmsLimit !== Infinity ? (
            <>
              <div className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                {dmsUsed.toLocaleString()} / {dmsLimit.toLocaleString()} DMs
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-3)' }}>
                <motion.div
                  className={`h-full rounded-full ${
                    dmsPercent > 95 ? 'bg-red-500' : dmsPercent > 80 ? 'bg-amber-500' : 'bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF]'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(dmsPercent, 100)}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </>
          ) : (
            <div className="text-xs text-emerald-500 font-medium">Unlimited DMs</div>
          )}
        </div>
      </div>
    </aside>
  )
}
