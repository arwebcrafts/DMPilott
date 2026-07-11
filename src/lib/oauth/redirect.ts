import { NextResponse } from 'next/server'

type OAuthState = {
  popup?: boolean
  platform?: string
}

export function buildAccountsRedirect(
  params: Record<string, string | undefined>,
  stateData?: OAuthState
) {
  const base = process.env.NEXT_PUBLIC_APP_URL!
  const query = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value) query.set(key, value)
  }

  const qs = query.toString()

  if (stateData?.popup) {
    const platform = stateData.platform || params.platform
    if (platform) query.set('platform', platform)
    return NextResponse.redirect(
      `${base}/dashboard/accounts/oauth-complete?${query.toString()}`
    )
  }

  return NextResponse.redirect(`${base}/dashboard/accounts${qs ? `?${qs}` : ''}`)
}
