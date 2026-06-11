'use client'

import type { BioBlock } from '@/lib/bio/types'
import { parseVideoEmbed } from '@/lib/bio/videoEmbed'
import { Play } from 'lucide-react'

interface BioVideoEmbedProps {
  block: BioBlock
  preview?: boolean
}

export function BioVideoEmbed({ block, preview }: BioVideoEmbedProps) {
  const embed = block.url ? parseVideoEmbed(block.url) : null

  if (!embed) {
    return (
      <div className="rounded-xl bg-black/20 p-4 text-center text-white/80 text-sm">
        {block.title || 'Video'} — invalid or unsupported URL
      </div>
    )
  }

  return (
    <div className="rounded-xl overflow-hidden shadow-lg bg-black/20">
      {block.title && (
        <div className="px-3 py-2 flex items-center gap-2 text-white text-sm font-medium">
          <Play className="w-4 h-4" />
          {block.title}
        </div>
      )}
      <div className="relative w-full aspect-video">
        <iframe
          src={embed.embedUrl}
          title={block.title || 'Video'}
          className="absolute inset-0 w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
      {block.description && (
        <p className="px-3 py-2 text-white/80 text-xs">{block.description}</p>
      )}
      {!preview && block.url && (
        <a
          href={block.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block px-3 py-2 text-center text-xs text-white/70 hover:text-white border-t border-white/10"
        >
          Open on {embed.platform === 'youtube' ? 'YouTube' : embed.platform === 'vimeo' ? 'Vimeo' : 'TikTok'}
        </a>
      )}
    </div>
  )
}
