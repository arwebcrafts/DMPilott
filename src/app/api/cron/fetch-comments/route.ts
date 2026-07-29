import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { decryptToken } from '@/lib/encryption'
import axios from 'axios'

import { assertCronRequest } from '@/lib/cronAuth'

// Called by Vercel Cron to fetch Instagram comments and queue DMs
export async function GET(request: Request) {
  const unauthorized = assertCronRequest(request)
  if (unauthorized) return unauthorized

  const supabase = createServiceClient()
  console.log('[Fetch Comments] Starting comment fetch...')

  // Get all active Instagram accounts
  const { data: accounts, error: accountsError } = await supabase
    .from('connected_accounts')
    .select('*')
    .eq('platform', 'instagram')
    .eq('is_active', true)

  if (accountsError) {
    console.error('[Fetch Comments] Error fetching accounts:', accountsError)
    return NextResponse.json({ error: accountsError.message }, { status: 500 })
  }

  if (!accounts || accounts.length === 0) {
    console.log('[Fetch Comments] No active Instagram accounts found')
    return NextResponse.json({ processed: 0, accounts: 0 })
  }

  console.log(`[Fetch Comments] Found ${accounts.length} active Instagram accounts`)

  let totalCommentsProcessed = 0

  for (const account of accounts) {
    try {
      console.log(`[Fetch Comments] Processing account: ${account.username || account.platform_account_id}`)

      const accessToken = decryptToken(account.access_token_encrypted)
      const platformAccountId = account.platform_account_id

      // Get active automations for this account
      const { data: automations } = await supabase
        .from('automations')
        .select('*')
        .eq('account_id', account.id)
        .eq('is_active', true)
        .eq('platform', 'instagram')

      if (!automations || automations.length === 0) {
        console.log(`[Fetch Comments] No active automations for account ${account.id}`)
        continue
      }

      // Get recent media (posts) for the account
      // Note: This endpoint might also be blocked, but we'll try
      try {
        const mediaRes = await axios.get(`https://graph.instagram.com/v21.0/${platformAccountId}/media`, {
          params: {
            fields: 'id,caption,media_type,timestamp',
            access_token: accessToken,
            limit: 25,
          },
        })

        const mediaItems = mediaRes.data.data || []
        console.log(`[Fetch Comments] Found ${mediaItems.length} media items`)

        for (const media of mediaItems) {
          // Get comments for each media
          try {
            const commentsRes = await axios.get(`https://graph.instagram.com/v21.0/${media.id}/comments`, {
              params: {
                fields: 'id,text,from,timestamp',
                access_token: accessToken,
                limit: 50,
              },
            })

            const comments = commentsRes.data.data || []
            console.log(`[Fetch Comments] Media ${media.id} has ${comments.length} comments`)

            for (const comment of comments) {
              const commenterId = comment.from?.id
              const commenterUsername = comment.from?.username
              const commentText = comment.text
              const commentId = comment.id
              const commentTimestamp = comment.timestamp

              // Check if this comment was already processed
              const { data: existingLog } = await supabase
                .from('dm_logs')
                .select('id')
                .eq('comment_id', commentId)
                .single()

              if (existingLog) {
                continue // Already processed
              }

              // Post-specific automations take priority over whole-account ones.
              const candidates = [...automations].sort((a: any, b: any) =>
                (a.media_id ? 0 : 1) - (b.media_id ? 0 : 1)
              )

              for (const automation of candidates) {
                // Per-post targeting: only run whole-account automations or ones
                // bound to exactly this media.
                if (automation.media_id && String(automation.media_id) !== String(media.id)) {
                  continue
                }

                let matchedKeyword: string | null = null

                if (automation.trigger_type === 'any_comment') {
                  matchedKeyword = null // matches, no specific keyword
                } else if (automation.trigger_type === 'comment_keyword') {
                  const keywords: string[] = automation.keywords || []
                  const commentLower = (commentText || '').toLowerCase().trim()
                  const found = keywords.find((kw: string) => {
                    try {
                      const escaped = kw.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                      return new RegExp(`\\b${escaped}\\b`, 'i').test(commentLower)
                    } catch {
                      return commentLower === kw.toLowerCase()
                    }
                  })
                  if (!found) continue
                  matchedKeyword = found
                } else {
                  continue
                }

                console.log(`[Fetch Comments] Comment matched automation "${automation.name}"`)

                const personalizedMessage = (automation.dm_message || '')
                  .replace(/{name}/g, commenterUsername || 'there')
                  .replace(/{username}/g, '@' + (commenterUsername || 'user'))

                // Queue DM for sending. Must include the NOT NULL user_id and use
                // only real dm_logs columns, or the insert fails silently.
                const { error: insertError } = await supabase
                  .from('dm_logs')
                  .insert({
                    automation_id: automation.id,
                    user_id: account.user_id,
                    account_id: account.id,
                    platform: 'instagram',
                    post_id: media.id,
                    commenter_platform_id: commenterId,
                    commenter_username: commenterUsername,
                    comment_id: commentId,
                    keyword_matched: matchedKeyword,
                    dm_message_sent: personalizedMessage,
                    status: 'queued',
                  })

                if (insertError) {
                  // Unique violation = already queued by the webhook; not an error.
                  if (insertError.code !== '23505') {
                    console.error('[Fetch Comments] Failed to queue DM:', insertError.message)
                  }
                  break
                }

                totalCommentsProcessed++
                console.log(`[Fetch Comments] Queued DM for commenter ${commenterUsername}`)
                break // Only queue once per comment
              }
            }
          } catch (commentErr: any) {
            console.error(`[Fetch Comments] Error fetching comments for media ${media.id}:`, commentErr.message)
          }
        }
      } catch (mediaErr: any) {
        console.error(`[Fetch Comments] Error fetching media for account ${account.id}:`, mediaErr.message)
        // If media fetch fails, we can't get comments
      }
    } catch (accountErr: any) {
      console.error(`[Fetch Comments] Error processing account ${account.id}:`, accountErr.message)
    }
  }

  console.log(`[Fetch Comments] Complete. Total comments processed: ${totalCommentsProcessed}`)
  return NextResponse.json({
    processed: totalCommentsProcessed,
    accounts: accounts.length,
  })
}
