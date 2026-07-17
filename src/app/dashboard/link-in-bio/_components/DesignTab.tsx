'use client'

import { useState, useEffect } from 'react'
import type { BioPage, BioTheme, SocialLink, BackgroundType, LinkStyle } from '@/lib/bio/types'
import { THEME_PRESETS, SOCIAL_PLATFORMS, LINK_BUTTON_STYLES, DEFAULT_LINK_STYLE } from '@/lib/bio/types'
import { validateUrl } from '@/lib/bio/validation'
import { useUserStore } from '@/stores/userStore'
import { PLAN_LIMITS } from '@/lib/planGating'
import { Loader2, Palette } from 'lucide-react'
import { motion } from 'framer-motion'
import { BioColorField } from './BioColorField'
import { BioImageField } from './BioImageField'

interface DesignTabProps {
  page: BioPage
  onUpdate: (updates: Partial<BioPage>) => Promise<void>
  onThemeChange?: (theme: BioTheme) => void
  saving: boolean
}

const BG_TYPES: { value: BackgroundType; label: string }[] = [
  { value: 'preset', label: 'Presets' },
  { value: 'solid', label: 'Solid' },
  { value: 'gradient', label: 'Gradient' },
  { value: 'image', label: 'Image' },
]

export function DesignTab({ page, onUpdate, onThemeChange, saving }: DesignTabProps) {
  const { user } = useUserStore()
  const plan = user?.plan || 'free'
  const limits = PLAN_LIMITS[plan]

  const [displayName, setDisplayName] = useState(page.display_name || '')
  const [bio, setBio] = useState(page.bio || '')
  const [avatarUrl, setAvatarUrl] = useState(page.avatar_url || '')
  const [theme, setTheme] = useState<BioTheme>(page.theme)
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(page.social_links || [])
  const [error, setError] = useState<string | null>(null)

  const allowedPresets = (['minimal', 'gradient', 'dark', 'instagram'] as const).slice(0, limits.bioThemePresets)
  const linkStyle = { ...DEFAULT_LINK_STYLE, ...theme.linkStyle }
  const bgType = theme.backgroundType || 'preset'

  useEffect(() => {
    onThemeChange?.(theme)
  }, [theme, onThemeChange])

  function updateTheme(partial: Partial<BioTheme>) {
    setTheme((prev) => {
      const next = { ...prev, ...partial }
      if (partial.preset === undefined && prev.preset !== 'custom') {
        next.preset = prev.preset
      }
      return next
    })
  }

  function updateLinkStyle(partial: Partial<LinkStyle>) {
    setTheme((prev) => ({
      ...prev,
      preset: 'custom',
      backgroundType: prev.backgroundType || 'solid',
      linkStyle: { ...DEFAULT_LINK_STYLE, ...prev.linkStyle, ...partial },
    }))
  }

  function applyPreset(preset: keyof typeof THEME_PRESETS) {
    setTheme(THEME_PRESETS[preset])
  }

  function updateSocialLink(platform: string, url: string) {
    setSocialLinks((prev) => {
      const filtered = prev.filter((l) => l.platform !== platform)
      if (url.trim()) return [...filtered, { platform, url: url.trim() }]
      return filtered
    })
  }

  function getSocialUrl(platform: string): string {
    return socialLinks.find((l) => l.platform === platform)?.url || ''
  }

  async function handleSave() {
    setError(null)

    // BUG-029: Validate avatar URL
    if (avatarUrl.trim()) {
      const avatarCheck = validateUrl(avatarUrl)
      if (!avatarCheck.valid) {
        setError('Invalid avatar URL: ' + (avatarCheck.error || 'Invalid URL'))
        return
      }
    }

    // BUG-030: Validate social links
    for (const link of socialLinks) {
      if (link.url.trim()) {
        const socialCheck = validateUrl(link.url, true)
        if (!socialCheck.valid) {
          setError(`Invalid ${link.platform} URL: ${socialCheck.error || 'Invalid URL'}`)
          return
        }
      }
    }

    // BUG-031: Validate background image URL
    if (bgType === 'image' && theme.backgroundImage?.trim()) {
      const bgCheck = validateUrl(theme.backgroundImage)
      if (!bgCheck.valid) {
        setError('Invalid background image URL: ' + (bgCheck.error || 'Invalid URL'))
        return
      }
    }

    try {
      await onUpdate({
        display_name: displayName,
        bio,
        avatar_url: avatarUrl,
        theme: { ...theme, preset: theme.preset === 'custom' ? 'custom' : theme.preset },
        social_links: socialLinks.slice(0, limits.maxBioSocialLinks),
      } as Partial<BioPage>)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border p-5 space-y-4" style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}>
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Profile</h3>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Display Name</label>
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)}
            maxLength={100}
            className="w-full px-3 py-2 rounded-lg border text-sm bg-white dark:bg-gray-900" style={{ borderColor: 'var(--surface-3)' }} />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Bio</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
            maxLength={500}
            className="w-full px-3 py-2 rounded-lg border text-sm bg-white dark:bg-gray-900 resize-none" style={{ borderColor: 'var(--surface-3)' }} />
        </div>
        <BioImageField label="Avatar" value={avatarUrl} onChange={setAvatarUrl} hint="Upload or paste an image URL" />
        <BioColorField
          label="Profile Text Color"
          value={theme.profileTextColor || '#ffffff'}
          onChange={(c) => updateTheme({ profileTextColor: c, preset: 'custom' })}
        />
      </div>

      <div className="rounded-xl border p-5 space-y-3" style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Social Links</h3>
          <span className="text-xs text-gray-500">Max {limits.maxBioSocialLinks}</span>
        </div>
        {SOCIAL_PLATFORMS.map((platform) => (
          <div key={platform} className="flex items-center gap-2">
            <span className="text-xs w-20 capitalize text-gray-500">{platform}</span>
            <input value={getSocialUrl(platform)} onChange={(e) => updateSocialLink(platform, e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border text-sm bg-white dark:bg-gray-900" style={{ borderColor: 'var(--surface-3)' }}
              placeholder={`https://${platform}.com/...`} />
          </div>
        ))}
      </div>

      <div className="rounded-xl border p-5 space-y-4" style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}>
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Palette className="w-4 h-4" /> Background
        </h3>

        <div className="flex flex-wrap gap-2">
          {BG_TYPES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => updateTheme({ backgroundType: value, preset: 'custom' })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                bgType === value ? 'bg-[#DD2A7B] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {bgType === 'preset' && (
          <div className="grid grid-cols-2 gap-3">
            {allowedPresets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => applyPreset(preset)}
                className={`rounded-xl p-3 border-2 text-sm font-medium capitalize transition-all h-16 ${
                  theme.preset === preset ? 'border-[#DD2A7B] ring-2 ring-[#DD2A7B]/20' : 'border-transparent'
                }`}
                style={{ background: THEME_PRESETS[preset].backgroundColor }}
              >
                <span className="text-white drop-shadow">{preset}</span>
              </button>
            ))}
          </div>
        )}

        {bgType === 'solid' && (
          <BioColorField
            label="Background Color"
            value={theme.backgroundColor?.startsWith('#') ? theme.backgroundColor : '#8134AF'}
            onChange={(c) => updateTheme({ backgroundColor: c, preset: 'custom', backgroundType: 'solid' })}
            presets={['#8134AF', '#DD2A7B', '#111827', '#ffffff', '#1a1a2e', '#0f172a']}
          />
        )}

        {bgType === 'gradient' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <BioColorField
                label="Gradient Start"
                value={theme.gradientFrom || '#F58529'}
                onChange={(c) => updateTheme({ gradientFrom: c, preset: 'custom', backgroundType: 'gradient' })}
                presets={['#F58529', '#DD2A7B', '#8134AF', '#3B82F6', '#10B981']}
              />
              <BioColorField
                label="Gradient End"
                value={theme.gradientTo || '#8134AF'}
                onChange={(c) => updateTheme({ gradientTo: c, preset: 'custom', backgroundType: 'gradient' })}
                presets={['#8134AF', '#DD2A7B', '#111827', '#6366F1', '#EC4899']}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Angle ({theme.gradientAngle ?? 135}°)</label>
              <input type="range" min={0} max={360} value={theme.gradientAngle ?? 135}
                onChange={(e) => updateTheme({ gradientAngle: Number(e.target.value), preset: 'custom', backgroundType: 'gradient' })}
                className="w-full" />
            </div>
            <div
              className="h-16 rounded-xl"
              style={{
                background: `linear-gradient(${theme.gradientAngle ?? 135}deg, ${theme.gradientFrom || '#F58529'}, ${theme.gradientTo || '#8134AF'})`,
              }}
            />
          </div>
        )}

        {bgType === 'image' && (
          <BioImageField
            label="Background Image"
            value={theme.backgroundImage || ''}
            onChange={(url) => updateTheme({ backgroundImage: url, preset: 'custom', backgroundType: 'image' })}
            hint="Upload your own image or paste a URL. Use a high-quality photo."
          />
        )}
      </div>

      <div className="rounded-xl border p-5 space-y-4" style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}>
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Link Buttons</h3>

        <div>
          <label className="text-xs text-gray-500 mb-2 block">Button Style</label>
          <div className="grid grid-cols-2 gap-2">
            {LINK_BUTTON_STYLES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => updateLinkStyle({ buttonStyle: value })}
                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                  linkStyle.buttonStyle === value
                    ? 'border-[#DD2A7B] bg-[#DD2A7B]/10 text-[#DD2A7B]'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BioColorField
            label="Button Color"
            value={linkStyle.buttonColor || theme.buttonColor || '#ffffff'}
            onChange={(c) => updateLinkStyle({ buttonColor: c })}
            presets={['#ffffff', '#111827', '#DD2A7B', '#8134AF', '#F58529', 'transparent']}
          />
          <BioColorField
            label="Text Color"
            value={linkStyle.buttonTextColor || theme.buttonTextColor || '#111827'}
            onChange={(c) => updateLinkStyle({ buttonTextColor: c })}
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">Corner Radius ({linkStyle.borderRadius ?? 12}px)</label>
          <input type="range" min={0} max={32} value={linkStyle.borderRadius ?? 12}
            onChange={(e) => updateLinkStyle({ borderRadius: Number(e.target.value) })}
            className="w-full" />
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">Font Size</label>
          <div className="flex gap-2">
            {(['sm', 'md', 'lg'] as const).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => updateLinkStyle({ fontSize: size })}
                className={`flex-1 py-2 rounded-lg text-xs font-medium uppercase ${
                  linkStyle.fontSize === size ? 'bg-[#DD2A7B] text-white' : 'bg-gray-100 dark:bg-gray-800'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <motion.button whileTap={{ scale: 0.98 }} onClick={handleSave} disabled={saving}
        className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] disabled:opacity-50 flex items-center justify-center gap-2">
        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
        Save Changes
      </motion.button>
    </div>
  )
}
