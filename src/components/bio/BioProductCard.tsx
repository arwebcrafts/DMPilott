'use client'

import type { BioBlock, BioTheme } from '@/lib/bio/types'
import { getLinkButtonStyles } from '@/lib/bio/themeUtils'

interface BioProductCardProps {
  block: BioBlock
  theme: BioTheme
  preview?: boolean
}

export function BioProductCard({ block, theme, preview }: BioProductCardProps) {
  const href = preview ? '#' : `/api/bio/click/${block.id}`
  const styles = getLinkButtonStyles(theme, block.metadata)

  return (
    <a
      href={href}
      target={preview ? undefined : '_blank'}
      rel={preview ? undefined : 'noopener noreferrer'}
      onClick={preview ? (e) => e.preventDefault() : undefined}
      className="block w-full overflow-hidden transition-transform hover:scale-[1.02] active:scale-[0.98]"
      style={styles}
    >
      <div className="flex items-center gap-3 p-3">
        {block.image_url ? (
          <img
            src={block.image_url}
            alt={block.title || 'Product'}
            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-gray-200 flex-shrink-0 flex items-center justify-center text-2xl">
            🛍️
          </div>
        )}
        <div className="flex-1 min-w-0 text-left">
          <div className="font-semibold text-sm truncate">{block.title || 'Product'}</div>
          {block.description && (
            <div className="text-xs opacity-70 truncate mt-0.5">{block.description}</div>
          )}
          {block.price && (
            <div className="text-sm font-bold mt-1">{block.price}</div>
          )}
        </div>
      </div>
    </a>
  )
}
