import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAuthenticatedUserPlan } from '@/lib/bio/planChecks'
import { canUseFollowGate } from '@/lib/planGating'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Follow-to-unlock (gift offers) is a Pro feature.
  const auth = await getAuthenticatedUserPlan()
  if (!canUseFollowGate(auth?.plan || 'free')) {
    return NextResponse.json(
      { error: 'Follow-to-unlock is available on the Pro plan. Upgrade to enable it.', code: 'plan_limit' },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const { account_username, gift_link_url, gift_link_title } = body

    if (!account_username || !gift_link_url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('instagram_gift_offers')
      .insert({
        user_id: user.id,
        account_username,
        gift_link_url,
        gift_link_title,
      })
      .select()
      .single()

    if (error) {
      console.error('[Instagram Gift Offers] Insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ giftOffer: data }, { status: 201 })
  } catch (error) {
    console.error('[Instagram Gift Offers] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  // If ID is provided, fetch single gift offer (for webview - public access)
  if (id) {
    const { createServiceClient } = await import('@/lib/supabase/server')
    const supabase = await createServiceClient()
    try {
      const { data, error } = await supabase
        .from('instagram_gift_offers')
        .select('*')
        .eq('id', id)
        .maybeSingle()

      if (error) {
        console.error('[Instagram Gift Offers] Fetch error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      if (!data) {
        return NextResponse.json({ error: 'Gift offer not found' }, { status: 404 })
      }

      return NextResponse.json(data)
    } catch (error) {
      console.error('[Instagram Gift Offers] Error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }

  // Otherwise fetch all gift offers for user (requires auth)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data, error } = await supabase
      .from('instagram_gift_offers')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[Instagram Gift Offers] Fetch error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ giftOffers: data })
  } catch (error) {
    console.error('[Instagram Gift Offers] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
