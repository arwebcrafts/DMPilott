'use client'

import type { SocialLink } from '@/lib/bio/types'

const PLATFORM_ICONS: Record<string, string> = {
  instagram: '📸',
  tiktok: '🎵',
  youtube: '▶️',
  x: '𝕏',
  facebook: '👤',
  website: '🌐',
}

interface BioSocialRowProps {
  links: SocialLink[]
}

export function BioSocialRow({ links }: BioSocialRowProps) {
  return (
    <div className="flex justify-center gap-3 flex-wrap mb-2">
      {links.map((link) => (
        <a
          key={link.platform}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          title={link.platform}
          className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-lg hover:bg-white/30 transition-colors"
        >
          {PLATFORM_ICONS[link.platform] || '🔗'}
        </a>
      ))}
    </div>
  )
}
