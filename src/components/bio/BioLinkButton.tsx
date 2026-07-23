'use client'

import type { BioBlock, BioTheme } from '@/lib/bio/types'
import { getLinkButtonStyles } from '@/lib/bio/themeUtils'

interface BioLinkButtonProps {
  block: BioBlock
  theme: BioTheme
  preview?: boolean
}

export function BioLinkButton({ block, theme, preview }: BioLinkButtonProps) {
  const href = preview ? '#' : `/api/bio/click/${block.id}`
  const styles = getLinkButtonStyles(theme, block.metadata)

  return (
    <a
      href={href}
      target={preview ? undefined : '_blank'}
      rel={preview ? undefined : 'noopener noreferrer'}
      onClick={preview ? (e) => e.preventDefault() : undefined}
      className="block w-full px-4 py-3.5 text-center font-semibold transition-transform hover:scale-[1.02] active:scale-[0.98]"
      style={styles}
    >
      {block.image_url && (
        <img
          src={block.image_url}
          alt=""
          className="w-8 h-8 rounded-full inline-block mr-2 align-middle object-cover"
        />
      )}
      <span className="truncate block overflow-hidden" style={{ wordBreak: 'break-word' }}>
        {(block.title || 'Untitled Link').length > 100
          ? (block.title || 'Untitled Link').slice(0, 100) + '…'
          : (block.title || 'Untitled Link')}
      </span>
    </a>
  )
}
