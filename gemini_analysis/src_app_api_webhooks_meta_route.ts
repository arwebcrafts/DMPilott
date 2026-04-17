import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createServiceClient } from '@/lib/supabase/server'
import { decryptToken } from '@/lib/encryption'
import axios from 'axios'

// Verify Meta webhook signature
function verifySignature(body: string, signature: string): boolean {
  const expected = crypto
    .createHmac('sha256', process.env.META_APP_SECRET!)
    .update(body)
    .digest('hex')
  return `sha256=${expected}` === signature
}

// GET = webhook verification
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 })
  }

  return new NextResponse('Forbidden', { status: 403 })
}

// POST = webhook events
export async function POST(request: Request) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-hub-signature-256') || ''

  console.log('[Webhook] === NEW WEBHOOK EVENT ===')
  console.log('[Webhook] Signature header:', signature)
  console.log('[Webhook] Body length:', rawBody.length)
  console.log('[Webhook] Body FULL:', rawBody)
  console.log('[Webhook] META_APP_SECRET set:', !!process.env.META_APP_SECRET)
  console.log('[Webhook] META_APP_SECRET value:', process.env.META_APP_SECRET)
  console.log('[Webhook] META_APP_SECRET length:', process.env.META_APP_SECRET?.length)

  // Compute expected signature for debugging
  if (process.env.META_APP_SECRET) {
    const expected = crypto
      .createHmac('sha256', process.env.META_APP_SECRET)
      .update(rawBody)
      .digest('hex')
    const expectedWithPrefix = `sha256=${expected}`
    console.log('[Webhook] Expected signature:', expectedWithPrefix)
    console.log('[Webhook] Signatures match:', expectedWithPrefix === signature)
  }

  if (!verifySignature(rawBody, signature)) {
    console.log('[Webhook] ❌ Signature verification FAILED')
    return new NextResponse('Invalid signature', { status: 403 })
  }

  console.log('[Webhook] ✓ Signature verified')
  const payload = JSON.parse(rawBody)
  console.log('[Webhook] Payload object:', payload.object)
  console.log('[Webhook] Entry IDs:', payload.entry?.map((e: any) => e.id))
  console.log('[Webhook] Entry changes fields:', payload.entry?.map((e: any) => e.changes?.map((c: any) => c.field)))

  const supabase = createServiceClient()

  // Process Instagram events
  if (payload.object === 'instagram') {
    for (const entry of payload.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field === 'comments') {
          const value = change.value
          const pageId = entry.id
          
          console.log('[Webhook] IG Comment received from:', value.from?.username, 'text:', value.text)
          console.log('[Webhook] Webhook Page ID:', pageId)

          // For Instagram, entry.id is the PAGE ID, but we stored IG Business Account ID
          // We need to find the IG account connected to this page
          let account = null
          
          // First try: direct match on platform_account_id (if user connected with Page ID)
          const { data: directMatch } = await supabase
            .from('connected_accounts')
            .select('*')
            .eq('platform_account_id', pageId)
            .eq('is_active', true)
            .eq('platform', 'instagram')
            .single()
          
          if (directMatch) {
            account = directMatch
            console.log('[Webhook] Found account by direct Page ID match:', account.username)
          } else {
            // Need to query Facebook API to get IG Account ID from Page ID
            // Get the access token for this page
            const { data: accounts } = await supabase
              .from('connected_accounts')
              .select('*')
              .eq('is_active', true)
              .eq('platform', 'instagram')
            
            console.log('[Webhook] No direct match. Searching', accounts?.length || 0, 'IG accounts...')
            
            for (const acc of accounts || []) {
              try {
                const accessToken = decryptToken(acc.access_token_encrypted)
                // Get page info to check if this IG account's page matches our webhook pageId
                const pageRes = await axios.get(`https://graph.facebook.com/v21.0/me`, {
                  params: { 
                    fields: 'instagram_business_account',
                    access_token: accessToken 
                  }
                })
                
                if (pageRes.data.instagram_business_account?.id) {
                  const igAccountId = pageRes.data.instagram_business_account.id
                  console.log('[Webhook] Checking IG Account:', igAccountId)
                  
                  // Get the page ID for this IG account
                  const pagesRes = await axios.get(`https://graph.facebook.com/v21.0/${igAccountId}`, {
                    params: { 
                      fields: 'instagram_business_account,page_id',
                      access_token: accessToken 
                    }
                  })
                  
                  if (pagesRes.data.page_id == pageId) {
                    account = acc
                    console.log('[Webhook] Found account by page ID match:', account.username)
                    break
                  }
                }
              } catch (err) {
                console.log('[Webhook] Error checking account:', err instanceof Error ? err.message : String(err))
              }
            }
          }
          
          if (!account) {
            console.log('[Webhook] No matching IG account found for Page ID:', pageId)
            continue
          }

          // Find matching automation
          const { data: automations } = await supabase
            .from('automations')
            .select('*')
            .eq('account_id', account.id)
            .eq('is_active', true)
            .eq('platform', 'instagram')

          let matchedAutomation = null
          let matchedKeyword: string | null = null

          for (const auto of automations || []) {
            if (auto.trigger_type === 'any_comment') {
              matchedAutomation = auto
              break
            }
            if (auto.trigger_type === 'comment_keyword') {
              const keywords: string[] = auto.keywords || []
              const commentText = (value.text || '').toLowerCase().trim()
              const found = keywords.find(kw => commentText.includes(kw.toLowerCase()))
              if (found) {
                matchedAutomation = auto
                matchedKeyword = found
                break
              }
            }
          }

          if (!matchedAutomation) {
            console.log('[Webhook] No matching automation found')
            continue
          }

          console.log('[Webhook] Matched automation:', matchedAutomation.name)

          // Check duplicate
          const { data: existingLog } = await supabase
            .from('dm_logs')
            .select('id')
            .eq('automation_id', matchedAutomation.id)
            .eq('post_id', value.media?.id)
            .eq('commenter_platform_id', value.from?.id)
            .eq('status', 'sent')
            .single()

          if (existingLog) {
            console.log('[Webhook] Duplicate - already sent DM to this comment')
            continue
          }

          // Send DM directly (bypassing Redis/BullMQ for testing)
          console.log('[Webhook] Sending DM directly to', value.from?.username)
          
          try {
            const accessToken = decryptToken(account.access_token_encrypted)
            const personalizedMessage = matchedAutomation.dm_message
              .replace(/{name}/g, value.from?.username || 'there')
              .replace(/{username}/g, `@${value.from?.username || 'user'}`)

            await axios.post(
              `https://graph.facebook.com/v21.0/me/messages`,
              {
                recipient: { id: value.from?.id },
                message: { text: personalizedMessage },
              },
              {
                params: { access_token: accessToken },
                headers: { 'Content-Type': 'application/json' },
              }
            )

            // Log as sent
            await supabase.from('dm_logs').insert({
              automation_id: matchedAutomation.id,
              user_id: account.user_id,
              account_id: account.id,
              platform: 'instagram',
              post_id: value.media?.id,
              commenter_platform_id: value.from?.id,
              commenter_username: value.from?.username,
              keyword_matched: matchedKeyword,
              dm_message_sent: matchedAutomation.dm_message,
              status: 'sent',
              sent_at: new Date().toISOString(),
            })

            console.log('[Webhook] ✅ DM sent successfully to', value.from?.username)
          } catch (err: any) {
            console.log('[Webhook] ❌ Failed to send DM:', err.response?.data?.error?.message || err.message)
            
            // Log as failed
            await supabase.from('dm_logs').insert({
              automation_id: matchedAutomation.id,
              user_id: account.user_id,
              account_id: account.id,
              platform: 'instagram',
              post_id: value.media?.id,
              commenter_platform_id: value.from?.id,
              commenter_username: value.from?.username,
              keyword_matched: matchedKeyword,
              dm_message_sent: matchedAutomation.dm_message,
              status: 'failed',
              error_message: err.response?.data?.error?.message || err.message,
            })
          }
        }
      }
    }
  }

  // Process Facebook Page events
  if (payload.object === 'page') {
    for (const entry of payload.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field === 'feed' && change.value?.item === 'comment') {
          const pageId = entry.id
          const { data: account } = await supabase
            .from('connected_accounts')
            .select('*, users!inner(id, plan, dms_used_this_month)')
            .eq('platform_account_id', pageId)
            .eq('is_active', true)
            .single()

          if (!account) continue

          const { data: automations } = await supabase
            .from('automations')
            .select('*')
            .eq('account_id', account.id)
            .eq('is_active', true)
            .eq('platform', 'facebook')

          let matchedAutomation = null
          let matchedKeyword: string | null = null

          for (const auto of automations || []) {
            if (auto.trigger_type === 'any_comment') {
              matchedAutomation = auto
              break
            }
            if (auto.trigger_type === 'comment_keyword') {
              const keywords: string[] = auto.keywords || []
              const commentText = (change.value.message || '').toLowerCase().trim()
              const found = keywords.find(kw => commentText.includes(kw.toLowerCase()))
              if (found) {
                matchedAutomation = auto
                matchedKeyword = found
                break
              }
            }
          }

          if (!matchedAutomation) continue

          // Check duplicate
          const { data: existingLog } = await supabase
            .from('dm_logs')
            .select('id')
            .eq('automation_id', matchedAutomation.id)
            .eq('post_id', change.value.post_id)
            .eq('commenter_platform_id', change.value.from?.id)
            .eq('status', 'sent')
            .single()

          if (existingLog) continue

          // Send DM directly
          try {
            const accessToken = decryptToken(account.access_token_encrypted)
            const personalizedMessage = matchedAutomation.dm_message
              .replace(/{name}/g, change.value.from?.name || 'there')
              .replace(/{username}/g, `@${change.value.from?.name || 'user'}`)

            await axios.post(
              `https://graph.facebook.com/v21.0/me/messages`,
              {
                recipient: { id: change.value.from?.id },
                message: { text: personalizedMessage },
                messaging_type: 'RESPONSE',
              },
              {
                params: { access_token: accessToken },
                headers: { 'Content-Type': 'application/json' },
              }
            )

            await supabase.from('dm_logs').insert({
              automation_id: matchedAutomation.id,
              user_id: account.user_id,
              account_id: account.id,
              platform: 'facebook',
              post_id: change.value.post_id,
              commenter_platform_id: change.value.from?.id,
              commenter_username: change.value.from?.name,
              keyword_matched: matchedKeyword,
              dm_message_sent: matchedAutomation.dm_message,
              status: 'sent',
              sent_at: new Date().toISOString(),
            })

            console.log('[Webhook] ✅ DM sent to', change.value.from?.name)
          } catch (err: any) {
            console.log('[Webhook] ❌ Failed to send DM:', err.response?.data?.error?.message || err.message)
          }
        }
      }
    }
  }

  return new NextResponse('OK', { status: 200 })
}
