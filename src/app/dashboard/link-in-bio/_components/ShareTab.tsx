'use client'

import { useState, useEffect } from 'react'
import type { BioPage } from '@/lib/bio/types'
import { Copy, Check, Download, QrCode } from 'lucide-react'
import { InstagramIcon } from '@/components/ui/brand-icons'
import { motion } from 'framer-motion'

interface ShareTabProps {
  page: BioPage | null
}

export function ShareTab({ page }: ShareTabProps) {
  const [copied, setCopied] = useState(false)
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [qrLoading, setQrLoading] = useState(false)

  useEffect(() => {
    if (page) loadQr()
  }, [page?.slug])

  if (!page) {
    return (
      <div className="rounded-xl border p-8 text-center text-gray-500 text-sm" style={{ borderColor: 'var(--surface-3)' }}>
        Create your bio page first to get your share link
      </div>
    )
  }

  const publicUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/${page.slug}`

  function copyUrl() {
    navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function loadQr() {
    setQrLoading(true)
    try {
      const res = await fetch('/api/bio/qr?format=svg')
      if (res.ok) {
        const svg = await res.text()
        const blob = new Blob([svg], { type: 'image/svg+xml' })
        setQrUrl(URL.createObjectURL(blob))
      }
    } finally {
      setQrLoading(false)
    }
  }

  async function downloadQr() {
    if (!page) return
    const res = await fetch('/api/bio/qr?format=svg')
    if (!res.ok) return
    const svg = await res.text()
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dmpilot-${page.slug}-qr.svg`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border p-5" style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}>
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Your Link in Bio URL</h3>
        <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border" style={{ borderColor: 'var(--surface-3)' }}>
          <span className="flex-1 text-sm font-mono text-gray-700 dark:text-gray-300 truncate">{publicUrl}</span>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={copyUrl}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#DD2A7B] text-white text-sm font-medium"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </motion.button>
        </div>
        {!page.is_published && (
          <p className="text-xs text-amber-600 mt-2">Page is not published yet. Visitors will see a 404 until you turn on publish.</p>
        )}
      </div>

      <div className="rounded-xl border p-5" style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}>
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Premium QR Code</h3>
        <p className="text-sm text-gray-500 mb-5">
          Branded QR with your username. Great for business cards, posters, or events.
        </p>

        <div className="flex flex-col items-center gap-5">
          <div className="rounded-2xl overflow-hidden shadow-xl">
            {qrUrl ? (
              <img src={qrUrl} alt={`QR code for @${page.slug}`} className="w-80 h-[400px]" />
            ) : (
              <div className="w-80 h-[400px] bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center">
                {qrLoading ? (
                  <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <QrCode className="w-16 h-16 text-white/40" />
                )}
              </div>
            )}
          </div>

          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            @{page.slug}
          </p>

          <button
            onClick={downloadQr}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF]"
          >
            <Download className="w-4 h-4" />
            Download QR (SVG)
          </button>
        </div>
      </div>

      <div className="rounded-xl border p-5" style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center flex-shrink-0">
            <InstagramIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Add to Instagram Bio</h3>
            <ol className="text-sm text-gray-500 mt-2 space-y-1 list-decimal list-inside">
              <li>Copy your link above</li>
              <li>Open Instagram → Edit Profile</li>
              <li>Paste your DMPilot link in the Website field</li>
              <li>Save. All your links are now one tap away.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
