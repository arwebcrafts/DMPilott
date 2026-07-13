'use client'

import type { BioPage, BioBlock } from '@/lib/bio/types'
import { BioPublicView } from '@/components/bio/BioPublicView'

interface BioPreviewProps {
  page: BioPage | null
  blocks: BioBlock[]
}

export function BioPreview({ page, blocks }: BioPreviewProps) {
  if (!page) {
    return (
      <div className="rounded-[2rem] border overflow-hidden shadow-xl" style={{ borderColor: 'var(--surface-3)' }}>
        <div className="bg-gray-100 dark:bg-gray-800 p-12 text-center text-sm text-gray-500">
          Create your bio page to see a preview
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[260px]">
      <div className="relative rounded-[2.25rem] border-[5px] border-gray-900 dark:border-gray-600 overflow-hidden shadow-2xl bg-gray-900">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-900 rounded-b-2xl z-10" />

        {/* Status bar */}
        <div className="relative z-0 bg-gray-900 px-5 pt-8 pb-2 flex items-center justify-between">
          <span className="text-white/60 text-[10px] font-semibold">9:41</span>
          <div className="flex items-center gap-1">
            <div className="w-3.5 h-2 border border-white/50 rounded-sm relative">
              <div className="absolute inset-0.5 bg-white/50 rounded-[1px]" />
            </div>
          </div>
        </div>

        {/* Screen */}
        <div className="max-h-[480px] overflow-y-auto overscroll-contain bg-black scrollbar-thin">
          <BioPublicView page={page} blocks={blocks} preview />
        </div>

        {/* Home indicator */}
        <div className="h-7 bg-gray-900 flex items-center justify-center">
          <div className="w-24 h-1 rounded-full bg-gray-500" />
        </div>
      </div>
      <p className="text-center text-xs text-gray-400 mt-3">Mobile preview</p>
    </div>
  )
}
