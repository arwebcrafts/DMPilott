import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PLAN_LIMITS } from '@/lib/planGating'
import GiveawaysClient from './GiveawaysClient'

export interface Giveaway {
  id: string
  name: string
  platform: string
  post_id: string | null
  entry_keyword: string
  winner_count: number
  winner_dm_template: string | null
  non_winner_dm_template: string | null
  status: 'active' | 'ended' | 'winner_picked'
  ends_at: string | null
  created_at: string
  account: {
    id: string
    username: string
    profile_picture_url: string | null
  }
  entry_count: number
}

export default async function GiveawaysDataFetcher() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: profile },
    { data: giveaways },
    { data: accounts },
  ] = await Promise.all([
    supabase.from('users').select('plan').eq('id', user.id).single(),
    supabase
      .from('giveaways')
      .select(`
        *,
        account:connected_accounts(id, username, profile_picture_url),
        entry_count:giveaway_entries(count)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('connected_accounts')
      .select('id, username, platform, profile_picture_url')
      .eq('user_id', user.id)
      .eq('is_active', true),
  ])

  const plan = ((profile?.plan as string) || 'free') as keyof typeof PLAN_LIMITS
  const maxGiveaways = PLAN_LIMITS[plan].maxGiveaways
  const currentGiveaways = giveaways?.length || 0

  return (
    <GiveawaysClient
      plan={plan}
      maxGiveaways={maxGiveaways}
      currentGiveaways={currentGiveaways}
      giveaways={(giveaways || []).map((g: any) => ({
        id: g.id,
        name: g.name,
        platform: g.platform,
        post_id: g.post_id,
        entry_keyword: g.entry_keyword,
        winner_count: g.winner_count,
        winner_dm_template: g.winner_dm_template,
        non_winner_dm_template: g.non_winner_dm_template,
        status: g.status,
        ends_at: g.ends_at,
        created_at: g.created_at,
        account: g.account,
        entry_count: g.entry_count?.[0]?.count || 0,
      }))}
      accounts={accounts || []}
    />
  )
}
