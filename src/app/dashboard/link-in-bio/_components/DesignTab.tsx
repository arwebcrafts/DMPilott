'use client'

import { useState, useEffect } from 'react'
import type { BioPage, BioTheme, SocialLink, BackgroundType, LinkStyle } from '@/lib/bio/types'
import { THEME_PRESETS, SOCIAL_PLATFORMS, LINK_BUTTON_STYLES, DEFAULT_LINK_STYLE } from '@/lib/bio/types'
import { useUserStore } from '@/stores/userStore'
import { PLAN_LIMITS } from '@/lib/planGating'
import { Loader2, Image, Palette } from 'lucide-react'
import { motion } from 'framer-motion'

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

  const [slug, setSlug] = useState(page.slug)
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
    setTheme((prev) => ({ ...prev, ...partial, preset: partial.preset ?? prev.preset === 'custom' ? 'custom' : prev.preset }))
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
    try {
      await onUpdate({
        slug,
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
      {/* Profile */}
      <div className="rounded-xl border p-5 space-y-4" style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}>
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Profile</h3>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Display Name</label>
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border text-sm bg-white dark:bg-gray-900" style={{ borderColor: 'var(--surface-3)' }} />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Bio</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
            className="w-full px-3 py-2 rounded-lg border text-sm bg-white dark:bg-gray-900 resize-none" style={{ borderColor: 'var(--surface-3)' }} />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Avatar URL</label>
          <input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border text-sm bg-white dark:bg-gray-900" style={{ borderColor: 'var(--surface-3)' }} placeholder="https://..." />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Profile Text Color</label>
          <input type="color" value={theme.profileTextColor || '#ffffff'}
            onChange={(e) => updateTheme({ profileTextColor: e.target.value, preset: 'custom' })}
            className="w-full h-10 rounded cursor-pointer" />
        </div>
      </div>

      {/* Social Links */}
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

      {/* Background */}
      <div className="rounded-xl border p-5 space-y-4" style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}>
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Palette className="w-4 h-4" /> Background
        </h3>

        <div className="flex flex-wrap gap-2">
          {BG_TYPES.map(({ value, label }) => (
            <button
              key={value}
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
                onClick={() => applyPreset(preset)}
                className={`rounded-xl p-3 border-2 text-sm font-medium capitalize transition-all h-16 ${
                  theme.preset === preset ? 'border-[#DD2A7B] ring-2 ring-[#DD2A7B]/20' : 'border-transparent'
                }`}
                style={{
                  background: THEME_PRESETS[preset].backgroundColor?.includes('gradient')
                    ? THEME_PRESETS[preset].backgroundColor
                    : THEME_PRESETS[preset].backgroundColor,
                }}
              >
                <span className="text-white drop-shadow">{preset}</span>
              </button>
            ))}
          </div>
        )}

        {bgType === 'solid' && (
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Solid Color</label>
            <input type="color" value={theme.backgroundColor?.startsWith('#') ? theme.backgroundColor : '#8134AF'}
              onChange={(e) => updateTheme({ backgroundColor: e.target.value, preset: 'custom', backgroundType: 'solid' })}
              className="w-full h-12 rounded cursor-pointer" />
          </div>
        )}

        {bgType === 'gradient' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">From</label>
                <input type="color" value={theme.gradientFrom || '#F58529'}
                  onChange={(e) => updateTheme({ gradientFrom: e.target.value, preset: 'custom', backgroundType: 'gradient' })}
                  className="w-full h-10 rounded cursor-pointer" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">To</label>
                <input type="color" value={theme.gradientTo || '#8134AF'}
                  onChange={(e) => updateTheme({ gradientTo: e.target.value, preset: 'custom', backgroundType: 'gradient' })}
                  className="w-full h-10 rounded cursor-pointer" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Angle ({theme.gradientAngle ?? 135}°)</label>
              <input type="range" min={0} max={360} value={theme.gradientAngle ?? 135}
                onChange={(e) => updateTheme({ gradientAngle: Number(e.target.value), preset: 'custom', backgroundType: 'gradient' })}
                className="w-full" />
            </div>
          </div>
        )}

        {bgType === 'image' && (
          <div>
            <label className="text-xs text-gray-500 mb-1 block flex items-center gap-1">
              <Image className="w-3 h-3" /> Background Image URL
            </label>
            <input value={theme.backgroundImage || ''}
              onChange={(e) => updateTheme({ backgroundImage: e.target.value, preset: 'custom', backgroundType: 'image' })}
              className="w-full px-3 py-2 rounded-lg border text-sm bg-white dark:bg-gray-900" style={{ borderColor: 'var(--surface-3)' }}
              placeholder="https://example.com/background.jpg" />
            <p className="text-xs text-gray-400 mt-1">Use a high-quality portrait or brand image</p>
          </div>
        )}
      </div>

      {/* Link button style */}
      <div className="rounded-xl border p-5 space-y-4" style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}>
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Link Button Style</h3>

        <div>
          <label className="text-xs text-gray-500 mb-2 block">Style</label>
          <div className="grid grid-cols-2 gap-2">
            {LINK_BUTTON_STYLES.map(({ value, label }) => (
              <button
                key={value}
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

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Button Color</label>
            <input type="color" value={linkStyle.buttonColor || theme.buttonColor || '#ffffff'}
              onChange={(e) => updateLinkStyle({ buttonColor: e.target.value })}
              className="w-full h-10 rounded cursor-pointer" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Text Color</label>
            <input type="color" value={linkStyle.buttonTextColor || theme.buttonTextColor || '#111827'}
              onChange={(e) => updateLinkStyle({ buttonTextColor: e.target.value })}
              className="w-full h-10 rounded cursor-pointer" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Border Color</label>
            <input type="color" value={linkStyle.borderColor || '#ffffff'}
              onChange={(e) => updateLinkStyle({ borderColor: e.target.value })}
              className="w-full h-10 rounded cursor-pointer" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Corner Radius ({linkStyle.borderRadius ?? 12}px)</label>
            <input type="range" min={0} max={32} value={linkStyle.borderRadius ?? 12}
              onChange={(e) => updateLinkStyle({ borderRadius: Number(e.target.value) })}
              className="w-full mt-3" />
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">Font Size</label>
          <div className="flex gap-2">
            {(['sm', 'md', 'lg'] as const).map((size) => (
              <button
                key={size}
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
