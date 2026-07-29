import { NextResponse } from 'next/server'

/**
 * Guards the Vercel Cron endpoints.
 *
 * These routes send DMs and rotate access tokens, so they must never be
 * callable by the public. Checking `if (CRON_SECRET && ...)` is not enough —
 * a missing env var silently disables the check and leaves the endpoints open.
 * In production a missing secret is a misconfiguration, and the endpoint fails
 * closed.
 *
 * Returns a response to send back when the request is not authorised, or
 * `null` when the caller may proceed.
 */
export function assertCronRequest(request: Request): NextResponse | null {
  const secret = process.env.CRON_SECRET

  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[Cron] CRON_SECRET is not set — refusing to run cron job')
      return NextResponse.json({ error: 'Cron is not configured' }, { status: 503 })
    }
    // Outside production, allow local invocation for testing.
    return null
  }

  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return null
}
