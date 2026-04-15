'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUserStore } from '@/stores/userStore'
import { PLAN_LIMITS } from '@/lib/planGating'
import { cn } from '@/lib/utils'

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
    <aside className="w-60 bg-white border-r border-[#E4E6EA] min-h-[calc(100vh-60px)] hidden md:block">
      <div className="p-4">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 mb-6">
          <div className="bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] bg-clip-text">
            <span className="text-lg font-bold text-transparent">DMPilot</span>
          </div>
        </Link>

        {/* Nav */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[#FDE8F0] text-[#E1306C] border-l-3 border-[#E1306C]'
                    : 'text-[#65676B] hover:bg-[#F0F2F5]'
                )}
                style={isActive ? { borderLeft: '3px solid #E1306C' } : {}}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Plan card at bottom */}
      <div className="absolute bottom-4 left-0 w-60 p-4">
        <div className="bg-[#F0F2F5] rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#1C1E21] capitalize">
              {user?.plan || 'Free'} Plan
            </span>
            <Link
              href="/dashboard/billing"
              className="text-xs text-[#1877F2] hover:underline"
            >
              Upgrade
            </Link>
          </div>
          {dmsLimit !== Infinity ? (
            <>
              <div className="text-xs text-[#65676B] mb-1">
                {dmsUsed.toLocaleString()} / {dmsLimit.toLocaleString()} DMs
              </div>
              <div className="h-1.5 bg-[#CED0D4] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    dmsPercent > 95 ? 'bg-[#FA3E3E]' :
                    dmsPercent > 80 ? 'bg-[#F7B928]' :
                    'bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF]'
                  }`}
                  style={{ width: `${Math.min(dmsPercent, 100)}%` }}
                />
              </div>
            </>
          ) : (
            <div className="text-xs text-[#31A24C] font-medium">Unlimited DMs</div>
          )}
        </div>
      </div>
    </aside>
  )
}
