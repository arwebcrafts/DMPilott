'use client'

import { useState } from 'react'
import type { BioBlock, BioBlockType, LinkStyle } from '@/lib/bio/types'
import { LINK_BUTTON_STYLES, DEFAULT_LINK_STYLE } from '@/lib/bio/types'
import { detectVideoPlatform } from '@/lib/bio/videoEmbed'
import { useUserStore } from '@/stores/userStore'
import { PLAN_LIMITS } from '@/lib/planGating'
import {
  Plus,
  GripVertical,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Link as LinkIcon,
  FolderOpen,
  Mail,
  ShoppingBag,
  Loader2,
  Video,
} from 'lucide-react'
import { motion } from 'framer-motion'

interface LinksTabProps {
  blocks: BioBlock[]
  onRefresh: () => Promise<void>
}

const BLOCK_TYPES: { type: BioBlockType; label: string; icon: React.ReactNode }[] = [
  { type: 'link', label: 'Link', icon: <LinkIcon className="w-4 h-4" /> },
  { type: 'header', label: 'Category', icon: <FolderOpen className="w-4 h-4" /> },
  { type: 'video', label: 'Video', icon: <Video className="w-4 h-4" /> },
  { type: 'email_capture', label: 'Email', icon: <Mail className="w-4 h-4" /> },
  { type: 'product', label: 'Product', icon: <ShoppingBag className="w-4 h-4" /> },
]

export function LinksTab({ blocks, onRefresh }: LinksTabProps) {
  const { user } = useUserStore()
  const plan = user?.plan || 'free'
  const limits = PLAN_LIMITS[plan]

  const [showAddMenu, setShowAddMenu] = useState(false)
  const [editingBlock, setEditingBlock] = useState<BioBlock | null>(null)
  const [loading, setLoading] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)
  const [form, setForm] = useState({
    title: '',
    url: '',
    description: '',
    image_url: '',
    price: '',
    successMessage: '',
    categoryAlignment: 'center',
    categoryShowLine: true,
    categoryTextColor: '#ffffff',
    linkStyle: { ...DEFAULT_LINK_STYLE } as LinkStyle,
    useCustomLinkStyle: false,
  })

  function openEdit(block: BioBlock) {
    const blockLinkStyle = (block.metadata?.linkStyle as LinkStyle) || {}
    setEditingBlock(block)
    setForm({
      title: block.title || '',
      url: block.url || '',
      description: block.description || '',
      image_url: block.image_url || '',
      price: block.price || '',
      successMessage: (block.metadata?.successMessage as string) || '',
      categoryAlignment: (block.metadata?.alignment as string) || 'center',
      categoryShowLine: block.metadata?.showLine !== false,
      categoryTextColor: (block.metadata?.textColor as string) || '#ffffff',
      linkStyle: { ...DEFAULT_LINK_STYLE, ...blockLinkStyle },
      useCustomLinkStyle: Boolean(block.metadata?.linkStyle),
    })
  }

  function resetForm() {
    setEditingBlock(null)
    setForm({
      title: '', url: '', description: '', image_url: '', price: '', successMessage: '',
      categoryAlignment: 'center', categoryShowLine: true, categoryTextColor: '#ffffff',
      linkStyle: { ...DEFAULT_LINK_STYLE }, useCustomLinkStyle: false,
    })
  }

  async function addBlock(type: BioBlockType) {
    setLoading(true)
    setShowAddMenu(false)
    try {
      const defaults: Record<string, unknown> = {
        link: { title: 'My Link' },
        header: { title: 'My Category', metadata: { alignment: 'center', showLine: true } },
        video: { title: 'Featured Video' },
        product: { title: 'My Product' },
        email_capture: { title: 'Subscribe', metadata: { successMessage: 'Thanks for subscribing!' } },
      }

      const d = defaults[type] as { title: string; url?: string; metadata?: Record<string, unknown> }

      const res = await fetch('/api/bio-blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, title: d.title, url: d.url, metadata: d.metadata || {} }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Failed to add block')
        return
      }
      await onRefresh()
      openEdit(data.block)
    } finally {
      setLoading(false)
    }
  }

  async function saveBlock() {
    if (!editingBlock) return
    setLoading(true)
    try {
      let metadata: Record<string, unknown> = { ...editingBlock.metadata }

      if (editingBlock.type === 'email_capture') {
        metadata.successMessage = form.successMessage
      }
      if (editingBlock.type === 'header') {
        metadata = {
          alignment: form.categoryAlignment,
          showLine: form.categoryShowLine,
          textColor: form.categoryTextColor,
        }
      }
      if (editingBlock.type === 'link' || editingBlock.type === 'product') {
        if (form.useCustomLinkStyle) {
          metadata.linkStyle = form.linkStyle
        } else {
          delete metadata.linkStyle
        }
      }

      const res = await fetch('/api/bio-blocks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingBlock.id,
          title: form.title,
          url: form.url,
          description: form.description,
          image_url: form.image_url,
          price: form.price,
          metadata,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Failed to save')
        return
      }
      resetForm()
      await onRefresh()
    } finally {
      setLoading(false)
    }
  }

  async function toggleBlock(block: BioBlock) {
    await fetch('/api/bio-blocks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: block.id, is_active: !block.is_active }),
    })
    await onRefresh()
  }

  async function deleteBlock(id: string) {
    if (!confirm('Delete this block?')) return
    await fetch(`/api/bio-blocks?id=${id}`, { method: 'DELETE' })
    if (editingBlock?.id === id) resetForm()
    await onRefresh()
  }

  async function handleReorder(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return
    const reordered = [...blocks]
    const [moved] = reordered.splice(fromIndex, 1)
    reordered.splice(toIndex, 0, moved)
    await fetch('/api/bio-blocks/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blockIds: reordered.map((b) => b.id) }),
    })
    await onRefresh()
  }

  const blockTypeLabel = (type: BioBlockType) => {
    if (type === 'header') return 'category'
    return type.replace('_', ' ')
  }

  return (
    <div className="space-y-4">
      {blocks.length === 0 ? (
        <div className="rounded-xl border p-8 text-center" style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}>
          <p className="text-gray-500 text-sm">No links yet. Add links, categories, or videos to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {blocks.map((block, index) => (
            <div
              key={block.id}
              draggable
              onDragStart={() => {
                setDragIndex(index)
                setOverIndex(index)
              }}
              onDragEnter={() => setOverIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDragEnd={async () => {
                if (dragIndex !== null && overIndex !== null && dragIndex !== overIndex) {
                  await handleReorder(dragIndex, overIndex)
                }
                setDragIndex(null)
                setOverIndex(null)
              }}
              className={`rounded-xl border p-3 flex items-center gap-3 cursor-grab active:cursor-grabbing transition-shadow ${
                !block.is_active ? 'opacity-50' : ''
              } ${overIndex === index && dragIndex !== null ? 'ring-2 ring-[#DD2A7B]/30' : ''}`}
              style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}
            >
              <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {block.type === 'header' ? `📁 ${block.title || 'Category'}` : block.title || 'Untitled'}
                </div>
                <div className="text-xs text-gray-500 capitalize">{blockTypeLabel(block.type)}</div>
              </div>
              <button onClick={() => openEdit(block)} className="text-xs text-[#DD2A7B] hover:underline">Edit</button>
              <button onClick={() => toggleBlock(block)} className="text-gray-400 hover:text-gray-600">
                {block.is_active ? <ToggleRight className="w-5 h-5 text-[#DD2A7B]" /> : <ToggleLeft className="w-5 h-5" />}
              </button>
              <button onClick={() => deleteBlock(block.id)} className="text-gray-400 hover:text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="relative">
        <motion.button whileTap={{ scale: 0.98 }} onClick={() => setShowAddMenu(!showAddMenu)} disabled={loading}
          className="w-full py-3 rounded-xl border-2 border-dashed text-sm font-medium text-gray-600 dark:text-gray-300 hover:border-[#DD2A7B] hover:text-[#DD2A7B] transition-colors flex items-center justify-center gap-2"
          style={{ borderColor: showAddMenu ? '#DD2A7B' : 'var(--surface-3)' }}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Add Block
        </motion.button>

        {showAddMenu && (
          <div className="absolute bottom-full mb-2 left-0 right-0 rounded-xl border shadow-lg p-2 grid grid-cols-2 gap-2 z-10"
            style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}>
            {BLOCK_TYPES.map(({ type, label, icon }) => {
              const disabled =
                (type === 'email_capture' && !limits.hasBioEmailCapture) ||
                (type === 'product' && limits.maxBioProducts === 0)
              return (
                <button key={type} onClick={() => !disabled && addBlock(type)} disabled={disabled}
                  className="flex items-center gap-2 p-3 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40">
                  {icon}{label}
                  {disabled && <span className="text-xs text-gray-400">(Pro)</span>}
                </button>
              )
            })}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500">
        Tip: Add a <strong>Category</strong> block to group links (e.g. &quot;Shop&quot;, &quot;Socials&quot;, &quot;Videos&quot;)
      </p>

      {editingBlock && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="rounded-xl border p-6 w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto"
            style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}>
            <h3 className="font-semibold capitalize">
              Edit {editingBlock.type === 'header' ? 'Category' : editingBlock.type.replace('_', ' ')}
            </h3>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Title</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--surface-3)' }} />
            </div>

            {editingBlock.type === 'video' && (
              <>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Video URL (YouTube, Vimeo, TikTok)</label>
                  <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--surface-3)' }}
                    placeholder="https://youtube.com/watch?v=..." />
                  {form.url && (
                    <p className="text-xs mt-1 text-gray-400">
                      Platform: {detectVideoPlatform(form.url)}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Description (optional)</label>
                  <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--surface-3)' }} />
                </div>
              </>
            )}

            {editingBlock.type === 'header' && (
              <>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Subtitle (optional)</label>
                  <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--surface-3)' }} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Alignment</label>
                  <div className="flex gap-2">
                    {['left', 'center', 'right'].map((a) => (
                      <button key={a} onClick={() => setForm({ ...form, categoryAlignment: a })}
                        className={`flex-1 py-2 rounded-lg text-xs capitalize ${form.categoryAlignment === a ? 'bg-[#DD2A7B] text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Text Color</label>
                  <input type="color" value={form.categoryTextColor}
                    onChange={(e) => setForm({ ...form, categoryTextColor: e.target.value })}
                    className="w-full h-10 rounded cursor-pointer" />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.categoryShowLine}
                    onChange={(e) => setForm({ ...form, categoryShowLine: e.target.checked })} />
                  Show divider line above category
                </label>
              </>
            )}

            {(editingBlock.type === 'link' || editingBlock.type === 'product') && (
              <>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">URL</label>
                  <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--surface-3)' }} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Thumbnail URL (optional)</label>
                  <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--surface-3)' }} />
                </div>
                {editingBlock.type === 'product' && (
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Price</label>
                    <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border text-sm" placeholder="$29.99" style={{ borderColor: 'var(--surface-3)' }} />
                  </div>
                )}

                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.useCustomLinkStyle}
                    onChange={(e) => setForm({ ...form, useCustomLinkStyle: e.target.checked })} />
                  Custom style for this link
                </label>

                {form.useCustomLinkStyle && (
                  <div className="space-y-3 pl-2 border-l-2 border-[#DD2A7B]/30">
                    <div className="grid grid-cols-2 gap-2">
                      {LINK_BUTTON_STYLES.map(({ value, label }) => (
                        <button key={value}
                          onClick={() => setForm({ ...form, linkStyle: { ...form.linkStyle, buttonStyle: value } })}
                          className={`py-1.5 rounded text-xs ${form.linkStyle.buttonStyle === value ? 'bg-[#DD2A7B] text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>
                          {label}
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="color" value={form.linkStyle.buttonColor || '#ffffff'}
                        onChange={(e) => setForm({ ...form, linkStyle: { ...form.linkStyle, buttonColor: e.target.value } })}
                        className="h-8 rounded cursor-pointer" title="Button color" />
                      <input type="color" value={form.linkStyle.buttonTextColor || '#111827'}
                        onChange={(e) => setForm({ ...form, linkStyle: { ...form.linkStyle, buttonTextColor: e.target.value } })}
                        className="h-8 rounded cursor-pointer" title="Text color" />
                    </div>
                  </div>
                )}
              </>
            )}

            {editingBlock.type === 'email_capture' && (
              <>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Description</label>
                  <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--surface-3)' }} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Success Message</label>
                  <input value={form.successMessage} onChange={(e) => setForm({ ...form, successMessage: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--surface-3)' }} />
                </div>
              </>
            )}

            <div className="flex gap-2 pt-2">
              <button onClick={resetForm} className="flex-1 py-2 rounded-lg border text-sm" style={{ borderColor: 'var(--surface-3)' }}>Cancel</button>
              <button onClick={saveBlock} disabled={loading} className="flex-1 py-2 rounded-lg text-sm font-semibold text-white bg-[#DD2A7B] disabled:opacity-50">
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
