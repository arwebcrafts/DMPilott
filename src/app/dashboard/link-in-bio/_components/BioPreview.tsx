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
      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--surface-3)' }}>
        <div className="bg-gray-100 dark:bg-gray-800 p-8 text-center text-sm text-gray-500">
          Create your bio page to see a preview
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border overflow-hidden shadow-lg" style={{ borderColor: 'var(--surface-3)' }}>
      <div className="bg-gray-900 px-3 py-2 flex items-center gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
        <span className="text-white/60 text-xs ml-2">Preview</span>
      </div>
      <div className="max-h-[600px] overflow-y-auto">
        <BioPublicView page={page} blocks={blocks} preview />
      </div>
    </div>
  )
}
