export type BioBlockType = 'link' | 'header' | 'email_capture' | 'product' | 'video'

export type BioThemePreset = 'minimal' | 'gradient' | 'dark' | 'instagram' | 'custom'

export type BackgroundType = 'preset' | 'solid' | 'gradient' | 'image'

export type LinkButtonStyle = 'filled' | 'outline' | 'soft' | 'shadow'

export interface LinkStyle {
  buttonStyle?: LinkButtonStyle
  borderRadius?: number
  borderColor?: string
  borderWidth?: number
  buttonColor?: string
  buttonTextColor?: string
  fontSize?: 'sm' | 'md' | 'lg'
}

export interface BioTheme {
  preset: BioThemePreset
  backgroundType?: BackgroundType
  backgroundColor?: string
  backgroundImage?: string
  gradientFrom?: string
  gradientTo?: string
  gradientAngle?: number
  buttonColor?: string
  buttonTextColor?: string
  fontFamily?: string
  linkStyle?: LinkStyle
  profileTextColor?: string
}

export interface SocialLink {
  platform: string
  url: string
}

export interface BioPage {
  id: string
  user_id: string
  slug: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  theme: BioTheme
  social_links: SocialLink[]
  is_published: boolean
  view_count: number
  created_at: string
  updated_at: string
}

export interface BioBlock {
  id: string
  bio_page_id: string
  type: BioBlockType
  title: string | null
  url: string | null
  description: string | null
  image_url: string | null
  price: string | null
  metadata: Record<string, unknown>
  sort_order: number
  is_active: boolean
  click_count: number
  created_at: string
  updated_at: string
}

export const DEFAULT_LINK_STYLE: LinkStyle = {
  buttonStyle: 'filled',
  borderRadius: 12,
  borderWidth: 0,
  fontSize: 'md',
}

export const DEFAULT_BIO_THEME: BioTheme = {
  preset: 'gradient',
  backgroundType: 'preset',
  backgroundColor: '#8134AF',
  buttonColor: '#ffffff',
  buttonTextColor: '#1a1a1a',
  fontFamily: 'system-ui',
  linkStyle: DEFAULT_LINK_STYLE,
  profileTextColor: '#ffffff',
}

export const THEME_PRESETS: Record<Exclude<BioThemePreset, 'custom'>, BioTheme> = {
  minimal: {
    preset: 'minimal',
    backgroundType: 'solid',
    backgroundColor: '#f5f5f5',
    buttonColor: '#ffffff',
    buttonTextColor: '#111827',
    fontFamily: 'system-ui',
    linkStyle: { ...DEFAULT_LINK_STYLE, buttonStyle: 'shadow' },
    profileTextColor: '#111827',
  },
  gradient: {
    preset: 'gradient',
    backgroundType: 'gradient',
    backgroundColor: 'linear-gradient(135deg, #F58529 0%, #DD2A7B 50%, #8134AF 100%)',
    gradientFrom: '#F58529',
    gradientTo: '#8134AF',
    gradientAngle: 135,
    buttonColor: '#ffffff',
    buttonTextColor: '#111827',
    fontFamily: 'system-ui',
    linkStyle: DEFAULT_LINK_STYLE,
    profileTextColor: '#ffffff',
  },
  dark: {
    preset: 'dark',
    backgroundType: 'solid',
    backgroundColor: '#0f0f0f',
    buttonColor: '#262626',
    buttonTextColor: '#ffffff',
    fontFamily: 'system-ui',
    linkStyle: { ...DEFAULT_LINK_STYLE, buttonStyle: 'outline', borderColor: '#404040', borderWidth: 1 },
    profileTextColor: '#ffffff',
  },
  instagram: {
    preset: 'instagram',
    backgroundType: 'gradient',
    backgroundColor: 'linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #FCAF45 100%)',
    gradientFrom: '#833AB4',
    gradientTo: '#FCAF45',
    gradientAngle: 135,
    buttonColor: '#ffffff',
    buttonTextColor: '#111827',
    fontFamily: 'system-ui',
    linkStyle: DEFAULT_LINK_STYLE,
    profileTextColor: '#ffffff',
  },
}

export const SOCIAL_PLATFORMS = [
  'instagram',
  'tiktok',
  'youtube',
  'x',
  'facebook',
  'website',
] as const

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number]

export const LINK_BUTTON_STYLES: { value: LinkButtonStyle; label: string }[] = [
  { value: 'filled', label: 'Filled' },
  { value: 'outline', label: 'Outline' },
  { value: 'soft', label: 'Soft' },
  { value: 'shadow', label: 'Shadow' },
]

export const FONT_SIZE_MAP = { sm: '0.875rem', md: '1rem', lg: '1.125rem' }
