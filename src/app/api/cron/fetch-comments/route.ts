import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { decryptToken } from '@/lib/encryption'
import axios from 'axios'

// Called by Vercel Cron to fetch Instagram comments and queue DMs
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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

              // Check if comment matches any automation keywords
              for (const automation of automations) {
                if (automation.trigger_type !== 'comment_keyword') {
                  continue
                }

                const keywords = automation.keywords || []
                const commentUpper = commentText.toUpperCase()

                const matchedKeyword = keywords.find((kw: string) =>
                  commentUpper.includes(kw.toUpperCase())
                )

                if (matchedKeyword) {
                  console.log(`[Fetch Comments] Comment matched keyword "${matchedKeyword}"`)

                  // Queue DM for sending
                  await supabase
                    .from('dm_logs')
                    .insert({
                      automation_id: automation.id,
                      account_id: account.id,
                      platform: 'instagram',
                      commenter_platform_id: commenterId,
                      commenter_username: commenterUsername,
                      comment_id: commentId,
                      comment_text: commentText,
                      keyword_matched: matchedKeyword,
                      dm_message_sent: automation.dm_message,
                      status: 'queued',
                      created_at: new Date().toISOString(),
                    })

                  totalCommentsProcessed++
                  console.log(`[Fetch Comments] Queued DM for commenter ${commenterUsername}`)
                  break // Only queue once per comment
                }
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
