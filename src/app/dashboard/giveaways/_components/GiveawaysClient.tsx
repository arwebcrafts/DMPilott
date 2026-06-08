'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Plus, Gift, Users, Clock, CheckCircle2, XCircle,
  Trophy, Calendar, Trash2, Edit2, Play, Pause,
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { InstagramIcon, FacebookIcon } from '@/components/ui/brand-icons'
import type { Giveaway } from './GiveawaysDataFetcher'

interface Props {
  plan: string
  maxGiveaways: number
  currentGiveaways: number
  giveaways: Giveaway[]
  accounts: Array<{ id: string; username: string; platform: string; profile_picture_url: string | null }>
}

export default function GiveawaysClient({
  plan,
  maxGiveaways,
  currentGiveaways,
  giveaways,
  accounts,
}: Props) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedGiveaway, setSelectedGiveaway] = useState<Giveaway | null>(null)

  const canCreateMore = maxGiveaways === Infinity || currentGiveaways < maxGiveaways

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Giveaways</h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm mt-0.5">
            Run comment-to-enter giveaways and pick winners automatically
          </p>
        </div>
        {canCreateMore && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
            style={{ background: 'var(--accent)' }}
          >
            <Plus className="w-4 h-4" />
            Create Giveaway
          </motion.button>
        )}
      </div>

      {/* Plan limit notice */}
      {!canCreateMore && (
        <div className="rounded-xl border p-4" style={{ background: '#F7B928/10', borderColor: '#F7B928/30' }}>
          <p className="text-sm text-[#F7B928]">
            You've reached your giveaway limit ({maxGiveaways}). Upgrade to Pro for unlimited giveaways.
          </p>
        </div>
      )}

      {/* Giveaways grid */}
      {giveaways.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {giveaways.map((giveaway, index) => (
            <GiveawayCard
              key={giveaway.id}
              giveaway={giveaway}
              index={index}
              onSelect={() => setSelectedGiveaway(giveaway)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border p-12 text-center shadow-sm" style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}>
          <Gift className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No giveaways yet</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
            Create your first giveaway to engage your audience
          </p>
          {canCreateMore && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
              style={{ background: 'var(--accent)' }}
            >
              <Plus className="w-4 h-4" />
              Create Giveaway
            </motion.button>
          )}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateGiveawayModal
          accounts={accounts}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Detail Modal */}
      {selectedGiveaway && (
        <GiveawayDetailModal
          giveaway={selectedGiveaway}
          onClose={() => setSelectedGiveaway(null)}
        />
      )}
    </div>
  )
}

function GiveawayCard({ giveaway, index, onSelect }: { giveaway: Giveaway; index: number; onSelect: () => void }) {
  const isActive = giveaway.status === 'active'
  const isEnded = giveaway.status === 'ended'
  const isWinnerPicked = giveaway.status === 'winner_picked'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onSelect}
      className="rounded-xl border p-5 cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors shadow-sm"
      style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${
              giveaway.platform === 'instagram'
                ? 'bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]'
                : 'bg-[#1877F2]'
            }`}
          >
            {giveaway.platform === 'instagram' ? <InstagramIcon className="w-4 h-4" /> : <FacebookIcon className="w-4 h-4" />}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{giveaway.name}</h3>
            <p className="text-xs text-gray-600 dark:text-gray-300">@{giveaway.account.username}</p>
          </div>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${
            isActive
              ? 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30'
              : isEnded
              ? 'bg-[#F7B928]/20 text-[#F7B928] border border-[#F7B928]/30'
              : 'bg-[#DD2A7B]/20 text-[#DD2A7B] border border-[#DD2A7B]/30'
          }`}
        >
          {isActive ? <><CheckCircle2 className="w-3 h-3 inline mr-1" /> Active</> : 
           isEnded ? <><Clock className="w-3 h-3 inline mr-1" /> Ended</> :
           <><Trophy className="w-3 h-3 inline mr-1" /> Winner Picked</>}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <Users className="w-4 h-4" />
          <span>{giveaway.entry_count} entries</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <Gift className="w-4 h-4" />
          <span>{giveaway.winner_count} winner{giveaway.winner_count !== 1 ? 's' : ''}</span>
        </div>
        {giveaway.ends_at && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <Calendar className="w-4 h-4" />
            <span>Ends {format(new Date(giveaway.ends_at), 'MMM d, yyyy')}</span>
          </div>
        )}
      </div>

      <div className="pt-3" style={{ borderTop: '1px solid var(--surface-3)' }}>
        <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
          Comment with: <span className="text-gray-900 dark:text-gray-100 font-medium">{giveaway.entry_keyword}</span>
        </p>
        <button className="text-xs text-[#1877F2] hover:underline">
          View details →
        </button>
      </div>
    </motion.div>
  )
}

function CreateGiveawayModal({ accounts, onClose }: { accounts: any[]; onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    account_id: '',
    entry_keyword: '',
    winner_count: 1,
    winner_dm_template: '',
    non_winner_dm_template: '',
    ends_at: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement creation logic
    console.log('Create giveaway:', formData)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl"
        style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Create Giveaway</h2>
          <button onClick={onClose} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Giveaway Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:outline-none"
              style={{ borderColor: 'var(--surface-3)' }}
              placeholder="e.g., Summer Giveaway"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Account</label>
            <select
              value={formData.account_id}
              onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:outline-none"
              style={{ borderColor: 'var(--surface-3)' }}
              required
            >
              <option value="">Select an account</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.platform === 'instagram' ? 'IG' : 'FB'} - @{acc.username}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Entry Keyword</label>
            <input
              type="text"
              value={formData.entry_keyword}
              onChange={(e) => setFormData({ ...formData, entry_keyword: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:outline-none"
              style={{ borderColor: 'var(--surface-3)' }}
              placeholder="e.g., giveaway"
              required
            />
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">Users must comment with this keyword to enter</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Number of Winners</label>
            <input
              type="number"
              min="1"
              max="100"
              value={formData.winner_count}
              onChange={(e) => setFormData({ ...formData, winner_count: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border rounded-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:outline-none"
              style={{ borderColor: 'var(--surface-3)' }}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">End Date (Optional)</label>
            <input
              type="datetime-local"
              value={formData.ends_at}
              onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:outline-none"
              style={{ borderColor: 'var(--surface-3)' }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Winner DM Template (Optional)</label>
            <textarea
              value={formData.winner_dm_template}
              onChange={(e) => setFormData({ ...formData, winner_dm_template: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:outline-none resize-none"
              style={{ borderColor: 'var(--surface-3)' }}
              rows={3}
              placeholder="Congratulations! You won our giveaway! 🎉"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Non-Winner DM Template (Optional)</label>
            <textarea
              value={formData.non_winner_dm_template}
              onChange={(e) => setFormData({ ...formData, non_winner_dm_template: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:outline-none resize-none"
              style={{ borderColor: 'var(--surface-3)' }}
              rows={3}
              placeholder="Thanks for participating! Stay tuned for future giveaways."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              style={{ borderColor: 'var(--surface-3)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg text-white font-medium"
              style={{ background: 'var(--accent)' }}
            >
              Create Giveaway
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

function GiveawayDetailModal({ giveaway, onClose }: { giveaway: Giveaway; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl"
        style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${
                giveaway.platform === 'instagram'
                  ? 'bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]'
                  : 'bg-[#1877F2]'
              }`}
            >
              {giveaway.platform === 'instagram' ? <InstagramIcon className="w-5 h-5" /> : <FacebookIcon className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{giveaway.name}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">@{giveaway.account.username}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="rounded-lg p-4 border" style={{ background: 'var(--surface-1)', borderColor: 'var(--surface-3)' }}>
            <Users className="w-5 h-5 text-[#DD2A7B] mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{giveaway.entry_count}</p>
            <p className="text-xs text-gray-600 dark:text-gray-300">Entries</p>
          </div>
          <div className="rounded-lg p-4 border" style={{ background: 'var(--surface-1)', borderColor: 'var(--surface-3)' }}>
            <Gift className="w-5 h-5 text-[#22c55e] mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{giveaway.winner_count}</p>
            <p className="text-xs text-gray-600 dark:text-gray-300">Winners</p>
          </div>
          <div className="rounded-lg p-4 border" style={{ background: 'var(--surface-1)', borderColor: 'var(--surface-3)' }}>
            <Calendar className="w-5 h-5 text-[#1877F2] mb-2" />
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {giveaway.ends_at ? format(new Date(giveaway.ends_at), 'MMM d') : 'No end date'}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-300">End Date</p>
          </div>
          <div className="rounded-lg p-4 border" style={{ background: 'var(--surface-1)', borderColor: 'var(--surface-3)' }}>
            <Clock className="w-5 h-5 text-[#F7B928] mb-2" />
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100 capitalize">{giveaway.status}</p>
            <p className="text-xs text-gray-600 dark:text-gray-300">Status</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Entry Keyword</h3>
            <p className="text-gray-600 dark:text-gray-300">{giveaway.entry_keyword}</p>
          </div>

          {giveaway.winner_dm_template && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Winner DM Template</h3>
              <p className="text-gray-600 dark:text-gray-300">{giveaway.winner_dm_template}</p>
            </div>
          )}

          {giveaway.non_winner_dm_template && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Non-Winner DM Template</h3>
              <p className="text-gray-600 dark:text-gray-300">{giveaway.non_winner_dm_template}</p>
            </div>
          )}

          <div className="pt-4" style={{ borderTop: '1px solid var(--surface-3)' }}>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Created {formatDistanceToNow(new Date(giveaway.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-6">
          {giveaway.status === 'active' && (
            <>
              <button className="flex-1 px-4 py-2 border rounded-lg text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2" style={{ borderColor: 'var(--surface-3)' }}>
                <Pause className="w-4 h-4" /> End Giveaway
              </button>
              <button className="flex-1 px-4 py-2 rounded-lg text-white font-medium flex items-center justify-center gap-2" style={{ background: 'var(--accent)' }}>
                <Trophy className="w-4 h-4" /> Pick Winners
              </button>
            </>
          )}
          {giveaway.status === 'ended' && (
            <button className="flex-1 px-4 py-2 rounded-lg text-white font-medium flex items-center justify-center gap-2" style={{ background: 'var(--accent)' }}>
              <Trophy className="w-4 h-4" /> Pick Winners
            </button>
          )}
          <button className="px-4 py-2 border rounded-lg text-[#FA3E3E] hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2" style={{ borderColor: '#FA3E3E/30' }}>
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </motion.div>
    </div>
  )
}
