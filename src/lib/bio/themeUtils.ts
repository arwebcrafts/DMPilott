import type { CSSProperties } from 'react'
import type { BioTheme, LinkStyle } from './types'
import { DEFAULT_LINK_STYLE, FONT_SIZE_MAP } from './types'

export function getPageBackgroundStyle(theme: BioTheme): CSSProperties {
  const type = theme.backgroundType || (theme.backgroundColor?.includes('gradient') ? 'gradient' : 'solid')

  if (type === 'image' && theme.backgroundImage) {
    return {
      backgroundImage: `url(${theme.backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundColor: theme.backgroundColor || '#000',
    }
  }

  if (type === 'gradient' || theme.backgroundColor?.includes('gradient')) {
    if (theme.gradientFrom && theme.gradientTo) {
      const angle = theme.gradientAngle ?? 135
      return {
        background: `linear-gradient(${angle}deg, ${theme.gradientFrom} 0%, ${theme.gradientTo} 100%)`,
      }
    }
    return { background: theme.backgroundColor || 'linear-gradient(135deg, #F58529, #8134AF)' }
  }

  return { backgroundColor: theme.backgroundColor || '#8134AF' }
}

export function mergeLinkStyle(theme: BioTheme, blockMetadata?: Record<string, unknown>): LinkStyle {
  const global = { ...DEFAULT_LINK_STYLE, ...theme.linkStyle }
  const blockStyle = (blockMetadata?.linkStyle as LinkStyle) || {}
  return { ...global, ...blockStyle }
}

export function getLinkButtonStyles(theme: BioTheme, blockMetadata?: Record<string, unknown>): CSSProperties {
  const style = mergeLinkStyle(theme, blockMetadata)
  const radius = style.borderRadius ?? 12
  const btnColor = style.buttonColor || theme.buttonColor || '#ffffff'
  const textColor = style.buttonTextColor || theme.buttonTextColor || '#111827'
  const borderColor = style.borderColor || 'rgba(255,255,255,0.3)'
  const borderWidth = style.borderWidth ?? 0
  const fontSize = FONT_SIZE_MAP[style.fontSize || 'md']

  const base: CSSProperties = {
    borderRadius: `${radius}px`,
    fontSize,
    transition: 'transform 0.15s ease',
  }

  switch (style.buttonStyle) {
    case 'outline':
      return {
        ...base,
        backgroundColor: 'transparent',
        color: textColor,
        border: `${Math.max(borderWidth, 2)}px solid ${borderColor || textColor}`,
      }
    case 'soft':
      return {
        ...base,
        backgroundColor: `${btnColor}cc`,
        color: textColor,
        border: borderWidth ? `${borderWidth}px solid ${borderColor}` : 'none',
        backdropFilter: 'blur(8px)',
      }
    case 'shadow':
      return {
        ...base,
        backgroundColor: btnColor,
        color: textColor,
        border: borderWidth ? `${borderWidth}px solid ${borderColor}` : 'none',
        boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
      }
    case 'filled':
    default:
      return {
        ...base,
        backgroundColor: btnColor,
        color: textColor,
        border: borderWidth ? `${borderWidth}px solid ${borderColor}` : 'none',
      }
  }
}

export function getProfileTextColor(theme: BioTheme): string {
  return theme.profileTextColor || '#ffffff'
}
