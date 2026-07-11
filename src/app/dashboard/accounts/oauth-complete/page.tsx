'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { OAUTH_MESSAGE_TYPE } from '@/lib/oauth/popup'

export default function OAuthCompletePage() {
  const searchParams = useSearchParams()
  const [closing, setClosing] = useState(true)

  useEffect(() => {
    const payload = {
      type: OAUTH_MESSAGE_TYPE,
      connected: searchParams.get('connected') === 'true',
      platform: searchParams.get('platform') || undefined,
      error: searchParams.get('error'),
      message: searchParams.get('message'),
    }

    const qs = searchParams.toString()
    const accountsUrl = `/dashboard/accounts${qs ? `?${qs}` : ''}`

    if (window.opener && !window.opener.closed) {
      window.opener.postMessage(payload, window.location.origin)
      window.close()
      setTimeout(() => {
        if (!window.closed) {
          window.location.replace(accountsUrl)
        }
      }, 800)
      return
    }

    setClosing(false)
    window.location.replace(accountsUrl)
  }, [searchParams])

  const connected = searchParams.get('connected') === 'true'
  const error = searchParams.get('error')

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-3 px-6 text-center"
      style={{ background: 'var(--background)', color: 'var(--text-primary)' }}
    >
      {connected ? (
        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
      ) : error ? (
        <AlertCircle className="w-10 h-10 text-red-500" />
      ) : (
        <Loader2 className="w-10 h-10 animate-spin text-[#DD2A7B]" />
      )}
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        {closing
          ? connected
            ? 'Account connected. Closing this window...'
            : error
              ? 'Connection failed. Closing this window...'
              : 'Finishing connection...'
          : 'Redirecting to accounts...'}
      </p>
    </div>
  )
}
