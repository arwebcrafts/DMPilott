'use client'

import { useState } from 'react'
import type { BioBlock, BioTheme } from '@/lib/bio/types'
import { Loader2, CheckCircle2 } from 'lucide-react'

interface BioEmailFormProps {
  block: BioBlock
  slug: string
  theme: BioTheme
  preview?: boolean
}

export function BioEmailForm({ block, slug, theme, preview }: BioEmailFormProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const successMessage =
    (block.metadata?.successMessage as string) || 'Thanks for subscribing!'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (preview) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/bio/${slug}/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, blockId: block.id }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Something went wrong')
        return
      }
      setSuccess(true)
      setEmail('')
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div
        className="rounded-xl p-4 text-center shadow-md"
        style={{
          backgroundColor: theme.buttonColor || '#ffffff',
          color: theme.buttonTextColor || '#111827',
        }}
      >
        <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-green-500" />
        <p className="text-sm font-medium">{successMessage}</p>
      </div>
    )
  }

  return (
    <div
      className="rounded-xl p-4 shadow-md"
      style={{
        backgroundColor: theme.buttonColor || '#ffffff',
        color: theme.buttonTextColor || '#111827',
      }}
    >
      {block.title && (
        <p className="font-semibold text-sm mb-1">{block.title}</p>
      )}
      {block.description && (
        <p className="text-xs opacity-70 mb-3">{block.description}</p>
      )}
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          disabled={preview}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#DD2A7B]"
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading || preview}
          className="w-full py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Subscribe'}
        </button>
      </form>
    </div>
  )
}
