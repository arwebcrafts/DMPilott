'use client'

import { useRef, useState } from 'react'
import { Image as ImageIcon, Link2, Loader2, Upload } from 'lucide-react'

interface BioImageFieldProps {
  label: string
  value: string
  onChange: (url: string) => void
  hint?: string
}

export function BioImageField({ label, value, onChange, hint }: BioImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleUpload(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file (JPG, PNG, WebP)')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5 MB')
      return
    }

    setUploading(true)
    setError(null)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/bio/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Upload failed')
        return
      }
      onChange(data.url)
    } catch {
      setError('Upload failed. Try a URL instead.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <label className="text-xs text-gray-500 mb-2 block flex items-center gap-1">
        <ImageIcon className="w-3 h-3" /> {label}
      </label>

      {value && (
        <div className="mb-3 rounded-xl overflow-hidden border h-28" style={{ borderColor: 'var(--surface-3)' }}>
          <img src={value} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="flex gap-2 mb-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
          style={{ borderColor: 'var(--surface-3)' }}
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          Upload
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleUpload(file)
            e.target.value = ''
          }}
        />
      </div>

      <div className="flex items-center gap-2">
        <Link2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg border text-sm bg-white dark:bg-gray-900"
          style={{ borderColor: 'var(--surface-3)' }}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
