'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, RefreshCw, AlertTriangle } from 'lucide-react'

interface Check { label: string; ok: boolean; hint?: string }
interface WebhookEvent {
  id: string
  received_at: string
  event_kind: string | null
  outcome: string
  detail: string | null
  help: string | null
}
interface DmLog {
  id: string
  status: string
  error_message: string | null
  commenter_username: string | null
  keyword_matched: string | null
  created_at: string
}

const OUTCOME_COLORS: Record<string, string> = {
  sent: 'text-green-600',
  queued: 'text-amber-500',
  duplicate: 'text-gray-400',
  rejected_signature: 'text-red-500',
  no_account: 'text-red-500',
  no_automation: 'text-red-500',
  no_keyword_match: 'text-amber-500',
  send_failed: 'text-red-500',
  limit_reached: 'text-amber-500',
}

export default function DiagnosticsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/diagnostics')
      setData(await res.json())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Diagnostics</h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Why a DM did or didn&apos;t go out. Comment on your post, then refresh this page.
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="px-4 py-2 rounded-xl text-sm font-medium text-white flex items-center gap-2 disabled:opacity-60"
          style={{ background: 'var(--accent)' }}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Setup checks */}
      <div className="rounded-xl border p-5" style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}>
        <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Setup</h2>
        <div className="space-y-3">
          {(data?.checks || []).map((c: Check) => (
            <div key={c.label} className="flex items-start gap-3">
              {c.ok
                ? <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                : <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />}
              <div>
                <p className="text-sm text-gray-900 dark:text-gray-100">{c.label}</p>
                {!c.ok && c.hint && (
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">{c.hint}</p>
                )}
              </div>
            </div>
          ))}
          {!loading && !data?.checks?.length && (
            <p className="text-sm text-gray-500">No data.</p>
          )}
        </div>
      </div>

      {/* Webhook deliveries */}
      <div className="rounded-xl border p-5" style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}>
        <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Recent webhook deliveries</h2>
        <p className="text-xs text-gray-600 dark:text-gray-300 mb-4">
          Every event Meta sent and what DMPilot did with it.
        </p>
        {(data?.events || []).length === 0 ? (
          <div className="flex items-start gap-3 rounded-lg p-3" style={{ background: 'var(--surface-1)' }}>
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700 dark:text-gray-200">
              No events received yet. If you just commented and nothing shows here, Meta is not
              delivering webhooks — check the callback URL and that the <strong>comments</strong> and{' '}
              <strong>messages</strong> fields are subscribed in the Meta dashboard.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {(data.events as WebhookEvent[]).map(e => (
              <div key={e.id} className="border-b pb-3 last:border-0" style={{ borderColor: 'var(--surface-2)' }}>
                <div className="flex items-center justify-between gap-3">
                  <span className={`text-sm font-semibold ${OUTCOME_COLORS[e.outcome] || 'text-gray-600'}`}>
                    {e.outcome.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(e.received_at).toLocaleString()}
                  </span>
                </div>
                {e.detail && <p className="text-sm text-gray-700 dark:text-gray-200 mt-1">{e.detail}</p>}
                {e.help && e.outcome !== 'sent' && e.outcome !== 'queued' && (
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{e.help}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent DM attempts */}
      <div className="rounded-xl border p-5" style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}>
        <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent DM attempts</h2>
        {(data?.recentDms || []).length === 0 ? (
          <p className="text-sm text-gray-500">No DM attempts yet.</p>
        ) : (
          <div className="space-y-2">
            {(data.recentDms as DmLog[]).map(d => (
              <div key={d.id} className="flex items-start justify-between gap-3 text-sm">
                <div>
                  <span className="text-gray-900 dark:text-gray-100">
                    @{d.commenter_username || 'user'}
                  </span>
                  {d.keyword_matched && (
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-[#DD2A7B]/15 text-[#DD2A7B]">
                      {d.keyword_matched}
                    </span>
                  )}
                  {d.error_message && (
                    <p className="text-xs text-red-500 mt-0.5">{d.error_message}</p>
                  )}
                </div>
                <span className={`text-xs font-medium ${d.status === 'sent' ? 'text-green-600' : d.status === 'failed' ? 'text-red-500' : 'text-amber-500'}`}>
                  {d.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
