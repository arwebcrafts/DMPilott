'use client'

import type { BioPage, BioBlock, BioTheme } from '@/lib/bio/types'
import { BioLinkButton } from './BioLinkButton'
import { BioProductCard } from './BioProductCard'
import { BioEmailForm } from './BioEmailForm'
import { BioSocialRow } from './BioSocialRow'
import { BioVideoEmbed } from './BioVideoEmbed'
import { BioCategoryHeader } from './BioCategoryHeader'
import { getPageBackgroundStyle, getProfileTextColor } from '@/lib/bio/themeUtils'

interface BioPublicViewProps {
  page: BioPage
  blocks: BioBlock[]
  preview?: boolean
}

export function BioPublicView({ page, blocks, preview = false }: BioPublicViewProps) {
  const theme = page.theme
  const activeBlocks = blocks.filter((b) => b.is_active)
  const profileColor = getProfileTextColor(theme)

  return (
    <div
      className="min-h-screen flex flex-col items-center px-4 py-10"
      style={{
        ...getPageBackgroundStyle(theme),
        fontFamily: theme.fontFamily || 'system-ui',
      }}
    >
      <div className="w-full max-w-md space-y-4">
        {/* Profile */}
        <div className="text-center mb-6">
          {page.avatar_url ? (
            <img
              src={page.avatar_url}
              alt={page.display_name || page.slug}
              className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-white/30 shadow-lg"
            />
          ) : (
            <div
              className="w-24 h-24 rounded-full mx-auto mb-4 bg-white/20 flex items-center justify-center text-3xl font-bold border-4 border-white/30"
              style={{ color: profileColor }}
            >
              {(page.display_name || page.slug).charAt(0).toUpperCase()}
            </div>
          )}
          <h1 className="text-xl font-bold drop-shadow-sm" style={{ color: profileColor }}>
            {page.display_name || page.slug}
          </h1>
          {page.bio && (
            <p className="text-sm mt-2 leading-relaxed opacity-90" style={{ color: profileColor }}>
              {page.bio}
            </p>
          )}
        </div>

        {page.social_links?.length > 0 && (
          <BioSocialRow links={page.social_links} />
        )}

        {/* Blocks */}
        <div className="space-y-3">
          {activeBlocks.map((block) => {
            if (block.type === 'header') {
              return <BioCategoryHeader key={block.id} block={block} theme={theme} />
            }

            if (block.type === 'link') {
              return (
                <BioLinkButton
                  key={block.id}
                  block={block}
                  theme={theme}
                  preview={preview}
                />
              )
            }

            if (block.type === 'video') {
              return (
                <BioVideoEmbed
                  key={block.id}
                  block={block}
                  preview={preview}
                />
              )
            }

            if (block.type === 'product') {
              return (
                <BioProductCard
                  key={block.id}
                  block={block}
                  theme={theme}
                  preview={preview}
                />
              )
            }

            if (block.type === 'email_capture') {
              return (
                <BioEmailForm
                  key={block.id}
                  block={block}
                  slug={page.slug}
                  theme={theme}
                  preview={preview}
                />
              )
            }

            return null
          })}
        </div>

        {!preview && (
          <p className="text-center text-xs pt-8 opacity-50" style={{ color: profileColor }}>
            Powered by DMPilot
          </p>
        )}
      </div>
    </div>
  )
}
