'use client'

import Link from 'next/link'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Link2,
  ChevronDown,
  LayoutDashboard,
  Palette,
  BarChart3,
  Share2,
} from 'lucide-react'

const BIO_TABS = [
  { tab: 'overview', label: 'Overview', icon: LayoutDashboard },
  { tab: 'links', label: 'Links', icon: Link2 },
  { tab: 'design', label: 'Design', icon: Palette },
  { tab: 'analytics', label: 'Insights', icon: BarChart3 },
  { tab: 'share', label: 'Share', icon: Share2 },
] as const

export { BIO_TABS }

export type BioTab = (typeof BIO_TABS)[number]['tab']

export function LinkInBioSidebarNav({ index }: { index: number }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const isOnBioPage = pathname.startsWith('/dashboard/link-in-bio')
  const currentTab = (searchParams.get('tab') as BioTab) || 'overview'
  const [expanded, setExpanded] = useState(isOnBioPage)

  useEffect(() => {
    if (isOnBioPage) setExpanded(true)
  }, [isOnBioPage])

  function handleMainClick() {
    if (isOnBioPage) {
      setExpanded((open) => !open)
    } else {
      router.push('/dashboard/link-in-bio?tab=overview')
    }
  }

  const isBioActive = isOnBioPage

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <button
        type="button"
        onClick={handleMainClick}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
          isBioActive
            ? 'bg-gradient-to-r from-[#F58529]/90 via-[#DD2A7B] to-[#8134AF] text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/80 hover:text-gray-900 dark:hover:text-gray-100'
        )}
      >
        <Link2 className="w-4 h-4 flex-shrink-0" />
        <span className="flex-1 text-left">Link in Bio</span>
        <ChevronDown
          className={cn(
            'w-4 h-4 flex-shrink-0 transition-transform duration-200',
            expanded && isOnBioPage ? 'rotate-180' : ''
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {expanded && isOnBioPage && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <nav className="mt-1 ml-3 pl-3 border-l-2 border-[#DD2A7B]/25 space-y-0.5 py-1">
              {BIO_TABS.map(({ tab, label, icon: Icon }) => {
                const active = currentTab === tab
                return (
                  <Link
                    key={tab}
                    href={`/dashboard/link-in-bio?tab=${tab}`}
                    onClick={() => setExpanded(true)}
                    className={cn(
                      'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors',
                      active
                        ? 'bg-[#DD2A7B]/10 text-[#DD2A7B] font-semibold'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/80 hover:text-gray-900 dark:hover:text-gray-100'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    {label}
                  </Link>
                )
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
