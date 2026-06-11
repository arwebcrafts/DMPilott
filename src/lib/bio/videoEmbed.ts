export type VideoPlatform = 'youtube' | 'vimeo' | 'tiktok' | 'unknown'

export interface VideoEmbed {
  platform: VideoPlatform
  embedUrl: string
  videoId: string
}

export function parseVideoEmbed(url: string): VideoEmbed | null {
  if (!url) return null

  try {
    const parsed = new URL(url)

    // YouTube
    if (parsed.hostname.includes('youtube.com') || parsed.hostname.includes('youtu.be')) {
      let videoId = parsed.searchParams.get('v')
      if (!videoId && parsed.hostname.includes('youtu.be')) {
        videoId = parsed.pathname.slice(1).split('/')[0]
      }
      if (!videoId && parsed.pathname.startsWith('/embed/')) {
        videoId = parsed.pathname.split('/')[2]
      }
      if (!videoId && parsed.pathname.startsWith('/shorts/')) {
        videoId = parsed.pathname.split('/')[2]
      }
      if (videoId) {
        return {
          platform: 'youtube',
          videoId,
          embedUrl: `https://www.youtube.com/embed/${videoId}`,
        }
      }
    }

    // Vimeo
    if (parsed.hostname.includes('vimeo.com')) {
      const videoId = parsed.pathname.split('/').filter(Boolean).pop()
      if (videoId && /^\d+$/.test(videoId)) {
        return {
          platform: 'vimeo',
          videoId,
          embedUrl: `https://player.vimeo.com/video/${videoId}`,
        }
      }
    }

    // TikTok
    if (parsed.hostname.includes('tiktok.com')) {
      const match = url.match(/video\/(\d+)/)
      if (match) {
        return {
          platform: 'tiktok',
          videoId: match[1],
          embedUrl: `https://www.tiktok.com/embed/v2/${match[1]}`,
        }
      }
    }
  } catch {
    return null
  }

  return null
}

export function detectVideoPlatform(url: string): VideoPlatform {
  const embed = parseVideoEmbed(url)
  return embed?.platform || 'unknown'
}
