/**
 * DMPilot DM Worker
 * Run separately: npx tsx src/workers/dmWorker.ts
 * Handles sending DMs asynchronously via BullMQ
 */

import { Worker } from 'bullmq'
import IORedis from 'ioredis'
import { createServiceClient } from '@/lib/supabase/server'
import { decryptToken } from '@/lib/encryption'
import axios from 'axios'

interface DMJob {
  automationId: string
  userId: string
  accountId: string
  platform: 'instagram' | 'facebook'
  postId: string
  commentId: string
  commenterPlatformId: string
  commenterUsername: string
  keywordMatched: string | null
  dmMessage: string
  sendDelaySeconds: number
}

const redis = new IORedis(process.env.REDIS_URL!, { maxRetriesPerRequest: null })

const worker = new Worker<DMJob>(
  'dm-jobs',
  async (job) => {
    const { automationId, accountId, platform, commenterPlatformId, commenterUsername, dmMessage } = job.data
    const supabase = createServiceClient()

    console.log(`[DM Worker] Processing job ${job.id} for @${commenterUsername} via ${platform}`)

    // Fetch account with decrypted token
    const { data: account } = await supabase
      .from('connected_accounts')
      .select('*')
      .eq('id', accountId)
      .single()

    if (!account || !account.is_active) {
      console.log(`[DM Worker] Account ${accountId} not active, skipping`)
      return
    }

    // Decrypt access token
    let accessToken: string
    try {
      accessToken = decryptToken(account.access_token_encrypted)
    } catch (err) {
      console.error(`[DM Worker] Failed to decrypt token for account ${accountId}:`, err)
      throw err
    }

    // Personalize message
    let personalizedMessage = dmMessage
      .replace(/{name}/g, commenterUsername || 'there')
      .replace(/{username}/g, `@${commenterUsername || 'user'}`)

    // Send DM via Meta API
    try {
      if (platform === 'instagram') {
        await axios.post(
          `https://graph.facebook.com/v21.0/me/messages`,
          {
            recipient: { id: commenterPlatformId },
            message: { text: personalizedMessage },
          },
          {
            params: { access_token: accessToken },
            headers: { 'Content-Type': 'application/json' },
          }
        )
      } else {
        // Facebook Messenger
        await axios.post(
          `https://graph.facebook.com/v21.0/me/messages`,
          {
            recipient: { id: commenterPlatformId },
            message: { text: personalizedMessage },
            messaging_type: 'RESPONSE',
          },
          {
            params: { access_token: accessToken },
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }

      // Update DM log to sent
      await supabase
        .from('dm_logs')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('automation_id', automationId)
        .eq('commenter_platform_id', commenterPlatformId)
        .eq('status', 'queued')

      // Increment counters
      try {
        await supabase.rpc('increment_dm_count', { p_user_id: job.data.userId })
      } catch {
        console.log('[DM Worker] RPC increment_dm_count not available, skipping')
      }

      // Increment automation total
      const { data: autoData } = await supabase
        .from('automations')
        .select('total_dms_sent')
        .eq('id', automationId)
        .single()

      if (autoData) {
        await supabase
          .from('automations')
          .update({ total_dms_sent: (autoData.total_dms_sent || 0) + 1 })
          .eq('id', automationId)
      }

      console.log(`[DM Worker] ✓ DM sent to @${commenterUsername}`)

    } catch (err: any) {
      const errorCode = err.response?.data?.error?.code
      const errorMessage = err.response?.data?.error?.message || err.message

      console.error(`[DM Worker] ✗ Failed to send DM to @${commenterUsername}: ${errorMessage}`)

      // Handle specific errors
      if (errorCode === 190) {
        // Token expired - disconnect account
        await supabase
          .from('connected_accounts')
          .update({ is_active: false })
          .eq('id', accountId)
        await supabase
          .from('automations')
          .update({ is_active: false })
          .eq('account_id', accountId)
      }

      if (errorCode === 368) {
        // Messaging limit - requeue
        throw new Error('Messaging limit reached')
      }

      // Update log to failed
      await supabase
        .from('dm_logs')
        .update({ status: 'failed', error_message: `${errorCode}: ${errorMessage}` })
        .eq('automation_id', automationId)
        .eq('commenter_platform_id', commenterPlatformId)
        .eq('status', 'queued')

      throw err
    }
  },
  {
    connection: redis,
    concurrency: 10,
    limiter: {
      max: 200,
      duration: 3600000, // 200 per hour per account
    },
  }
)

worker.on('completed', (job) => {
  console.log(`[DM Worker] Job ${job.id} completed`)
})

worker.on('failed', (job, err) => {
  console.error(`[DM Worker] Job ${job?.id} failed:`, err.message)
})

worker.on('error', (err) => {
  console.error('[DM Worker] Worker error:', err)
})

console.log('[DM Worker] Starting DM worker...')

process.on('SIGTERM', async () => {
  console.log('[DM Worker] Shutting down...')
  await worker.close()
  await redis.quit()
  process.exit(0)
})
