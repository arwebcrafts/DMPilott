import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { decryptToken } from '@/lib/encryption'
import axios from 'axios'

/**
 * GET /api/accounts/[id]/media
 *
 * Lists an account's recent posts so the automation modal can offer per-post
 * targeting ("run this automation on one specific video"). Ownership is checked
 * via the RLS client before the token is ever touched.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: account } = await supabase
    .from('connected_accounts')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!account) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 })
  }

  let token: string
  try {
    token = decryptToken(account.access_token_encrypted)
  } catch {
    return NextResponse.json({ error: 'Could not read account credentials' }, { status: 500 })
  }

  try {
    if (account.platform === 'instagram') {
      const res = await axios.get(`https://graph.instagram.com/v21.0/${account.platform_account_id}/media`, {
        params: {
          fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp',
          access_token: token,
          limit: 25,
        },
        timeout: 10000,
      })
      const media = (res.data?.data || []).map((m: any) => ({
        id: m.id,
        caption: m.caption || '',
        mediaType: m.media_type,
        thumbnail: m.thumbnail_url || m.media_url || null,
        permalink: m.permalink || null,
        timestamp: m.timestamp,
      }))
      return NextResponse.json({ media })
    }

    // Facebook Page posts
    const res = await axios.get(`https://graph.facebook.com/v21.0/${account.platform_account_id}/posts`, {
      params: {
        fields: 'id,message,full_picture,permalink_url,created_time',
        access_token: token,
        limit: 25,
      },
      timeout: 10000,
    })
    const media = (res.data?.data || []).map((m: any) => ({
      id: m.id,
      caption: m.message || '',
      mediaType: 'POST',
      thumbnail: m.full_picture || null,
      permalink: m.permalink_url || null,
      timestamp: m.created_time,
    }))
    return NextResponse.json({ media })
  } catch (err: any) {
    const apiMessage = err?.response?.data?.error?.message || err?.message
    console.error('[Account Media] Failed to fetch media:', apiMessage)
    // Return an empty list rather than 500 so the UI can still offer
    // "whole account" targeting even when the media endpoint is unavailable.
    return NextResponse.json({ media: [], warning: apiMessage })
  }
}
