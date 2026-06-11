'use client'

import type { BioBlock, BioTheme } from '@/lib/bio/types'
import { getProfileTextColor } from '@/lib/bio/themeUtils'

interface BioCategoryHeaderProps {
  block: BioBlock
  theme: BioTheme
}

export function BioCategoryHeader({ block, theme }: BioCategoryHeaderProps) {
  const textColor = (block.metadata?.textColor as string) || getProfileTextColor(theme)
  const showLine = block.metadata?.showLine !== false
  const alignment = (block.metadata?.alignment as string) || 'center'

  const alignClass =
    alignment === 'left' ? 'text-left' : alignment === 'right' ? 'text-right' : 'text-center'

  return (
    <div className={`pt-4 pb-1 ${alignClass}`}>
      {showLine && (
        <div
          className="h-px w-full mb-3 opacity-30"
          style={{ backgroundColor: textColor }}
        />
      )}
      <p
        className="text-xs font-bold uppercase tracking-widest"
        style={{ color: textColor }}
      >
        {block.title || 'Category'}
      </p>
      {block.description && (
        <p className="text-xs mt-1 opacity-70" style={{ color: textColor }}>
          {block.description}
        </p>
      )}
    </div>
  )
}
