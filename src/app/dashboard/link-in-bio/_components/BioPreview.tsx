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
    <div className="mx-auto max-w-[320px]">
      <div
        className="rounded-[2.5rem] border-[6px] border-gray-900 dark:border-gray-700 overflow-hidden shadow-2xl bg-gray-900"
      >
        <div className="bg-gray-900 px-4 pt-3 pb-1 flex items-center justify-center">
          <div className="w-20 h-1 rounded-full bg-gray-700" />
        </div>
        <div className="bg-gray-900 px-3 pb-2 flex items-center justify-between">
          <span className="text-white/50 text-[10px] font-medium">9:41</span>
          <div className="flex gap-1">
            <div className="w-3 h-2 border border-white/40 rounded-sm" />
          </div>
        </div>
        <div className="max-h-[520px] overflow-y-auto bg-black">
          <BioPublicView page={page} blocks={blocks} preview />
        </div>
        <div className="h-6 bg-gray-900 flex items-center justify-center">
          <div className="w-28 h-1 rounded-full bg-gray-600" />
        </div>
      </div>
      <p className="text-center text-xs text-gray-400 mt-3">How it looks on mobile</p>
    </div>
  )
}
