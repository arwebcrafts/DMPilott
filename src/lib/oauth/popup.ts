export const OAUTH_MESSAGE_TYPE = 'dmpilot-oauth' as const

export type OAuthMessage = {
  type: typeof OAUTH_MESSAGE_TYPE
  connected: boolean
  platform?: string
  error?: string | null
  message?: string | null
}

export function openOAuthConnect(platform: 'instagram' | 'facebook'): boolean {
  const url = `/api/meta/connect?platform=${platform}&popup=1`
  const popup = window.open(
    url,
    `dmpilot-oauth-${platform}`,
    'noopener,noreferrer,width=520,height=720,scrollbars=yes'
  )

  if (!popup) {
    window.open(url, '_blank')
    return false
  }

  popup.focus()
  return true
}

export function isOAuthMessage(data: unknown): data is OAuthMessage {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data as OAuthMessage).type === OAUTH_MESSAGE_TYPE
  )
}
