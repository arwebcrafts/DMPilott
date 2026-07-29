import { isReservedSlug } from './reservedSlugs'
import type { BioBlockType, BioTheme, LinkStyle, SocialLink, BackgroundType } from './types'
import { DEFAULT_BIO_THEME, DEFAULT_LINK_STYLE, SOCIAL_PLATFORMS } from './types'

const SLUG_REGEX = /^[a-z0-9_-]{3,30}$/

export function normalizeSlug(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, '-')
}

export function validateSlug(slug: string): { valid: boolean; error?: string } {
  const normalized = normalizeSlug(slug)
  if (!SLUG_REGEX.test(normalized)) {
    return { valid: false, error: 'Slug must be 3–30 characters (letters, numbers, _ or -)' }
  }
  if (isReservedSlug(normalized)) {
    return { valid: false, error: 'This slug is reserved' }
  }
  return { valid: true }
}

export function validateUrl(url: string | null | undefined, required = false): { valid: boolean; error?: string } {
  if (!url || url.trim() === '') {
    if (required) return { valid: false, error: 'URL is required' }
    return { valid: true }
  }
  try {
    const parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, error: 'URL must use http or https' }
    }
    return { valid: true }
  } catch {
    return { valid: false, error: 'Invalid URL' }
  }
}

/** Validate that a URL points to an image (checks file extension or known image hosting patterns) */
export function validateImageUrl(url: string | null | undefined): { valid: boolean; error?: string } {
  if (!url || url.trim() === '') {
    return { valid: true } // empty is OK, it's optional
  }

  // First check it's a valid URL
  const urlCheck = validateUrl(url, true)
  if (!urlCheck.valid) return urlCheck

  try {
    const parsed = new URL(url)
    const pathname = parsed.pathname.toLowerCase()
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico', '.avif']
    const hasImageExtension = imageExtensions.some(ext => pathname.endsWith(ext))
    
    // Known image hosting domains that serve images without extensions
    const imageHosts = [
      'imgur.com', 'i.imgur.com',
      'images.unsplash.com',
      'pbs.twimg.com',
      'avatars.githubusercontent.com',
      'lh3.googleusercontent.com',
      'cloudinary.com', 'res.cloudinary.com',
      'cdn.discordapp.com',
      'media.giphy.com',
    ]
    const isImageHost = imageHosts.some(host => parsed.hostname.includes(host))

    if (!hasImageExtension && !isImageHost) {
      return {
        valid: false,
        error: 'URL does not appear to be an image. Use a direct image URL (e.g., ending in .jpg, .png, .webp)',
      }
    }

    return { valid: true }
  } catch {
    return { valid: false, error: 'Invalid image URL' }
  }
}

/** Validate that a social link URL matches the expected platform domain */
export function validateSocialUrl(platform: string, url: string): { valid: boolean; error?: string } {
  if (!url || url.trim() === '') {
    return { valid: true } // empty means user removed the link
  }

  // First check it's a valid URL
  const urlCheck = validateUrl(url, true)
  if (!urlCheck.valid) return urlCheck

  const platformDomains: Record<string, string[]> = {
    instagram: ['instagram.com', 'www.instagram.com'],
    twitter: ['twitter.com', 'www.twitter.com', 'x.com', 'www.x.com'],
    tiktok: ['tiktok.com', 'www.tiktok.com', 'vm.tiktok.com'],
    youtube: ['youtube.com', 'www.youtube.com', 'youtu.be', 'm.youtube.com'],
    github: ['github.com', 'www.github.com'],
    linkedin: ['linkedin.com', 'www.linkedin.com'],
  }

  const expectedDomains = platformDomains[platform.toLowerCase()]
  if (!expectedDomains) {
    return { valid: true } // unknown platform, allow any URL
  }

  try {
    const parsed = new URL(url)
    const hostname = parsed.hostname.toLowerCase()
    if (!expectedDomains.some(domain => hostname === domain)) {
      return {
        valid: false,
        error: `This doesn't look like a ${platform} URL. Expected a URL from ${expectedDomains[0]}`,
      }
    }
    return { valid: true }
  } catch {
    return { valid: false, error: 'Invalid URL' }
  }
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

/** Strip HTML tags and trim to max length */
export function sanitizeText(text: string | null | undefined, maxLength: number): string | null {
  if (!text) return null
  // Strip HTML tags to prevent XSS
  const stripped = text.replace(/<[^>]*>/g, '')
  return stripped.trim().slice(0, maxLength)
}

export function validateSocialLinks(links: SocialLink[]): SocialLink[] {
  return links
    .filter((l) => SOCIAL_PLATFORMS.includes(l.platform as typeof SOCIAL_PLATFORMS[number]))
    // Enforce both a valid URL and that it matches the platform's domain, so a
    // direct API call can't store an unrelated URL in a platform field.
    .filter((l) => validateUrl(l.url, true).valid && validateSocialUrl(l.platform, l.url).valid)
    .slice(0, 6)
    .map((l) => ({ platform: l.platform, url: l.url.trim() }))
}

function validateLinkStyle(style?: LinkStyle): LinkStyle {
  if (!style) return DEFAULT_LINK_STYLE
  const buttonStyle = ['filled', 'outline', 'soft', 'shadow'].includes(style.buttonStyle || '')
    ? style.buttonStyle
    : 'filled'
  const fontSize = ['sm', 'md', 'lg'].includes(style.fontSize || '') ? style.fontSize : 'md'
  return {
    buttonStyle: buttonStyle as LinkStyle['buttonStyle'],
    borderRadius: Math.min(Math.max(style.borderRadius ?? 12, 0), 32),
    borderColor: style.borderColor?.slice(0, 50),
    borderWidth: Math.min(Math.max(style.borderWidth ?? 0, 0), 8),
    buttonColor: style.buttonColor?.slice(0, 50),
    buttonTextColor: style.buttonTextColor?.slice(0, 50),
    fontSize: fontSize as LinkStyle['fontSize'],
  }
}

export function validateTheme(theme: BioTheme): BioTheme {
  const preset = ['minimal', 'gradient', 'dark', 'instagram', 'custom'].includes(theme.preset)
    ? theme.preset
    : 'gradient'

  const backgroundType = (['preset', 'solid', 'gradient', 'image'] as BackgroundType[]).includes(
    theme.backgroundType as BackgroundType
  )
    ? theme.backgroundType
    : 'solid'

  return {
    preset: preset as BioTheme['preset'],
    backgroundType: backgroundType as BackgroundType,
    backgroundColor: theme.backgroundColor?.slice(0, 200),
    // Only keep the background image if it actually looks like an image URL.
    backgroundImage: validateImageUrl(theme.backgroundImage).valid ? theme.backgroundImage?.slice(0, 500) : undefined,
    gradientFrom: theme.gradientFrom?.slice(0, 50),
    gradientTo: theme.gradientTo?.slice(0, 50),
    gradientAngle: Math.min(Math.max(theme.gradientAngle ?? 135, 0), 360),
    buttonColor: theme.buttonColor?.slice(0, 50),
    buttonTextColor: theme.buttonTextColor?.slice(0, 50),
    fontFamily: theme.fontFamily?.slice(0, 100) || 'system-ui',
    linkStyle: validateLinkStyle(theme.linkStyle),
    profileTextColor: theme.profileTextColor?.slice(0, 50) || '#ffffff',
  }
}

export function validateBlockType(type: string): type is BioBlockType {
  return ['link', 'header', 'email_capture', 'product', 'video'].includes(type)
}

export function mergeThemeWithDefaults(theme?: BioTheme): BioTheme {
  return validateTheme({ ...DEFAULT_BIO_THEME, ...theme, linkStyle: { ...DEFAULT_LINK_STYLE, ...theme?.linkStyle } })
}

