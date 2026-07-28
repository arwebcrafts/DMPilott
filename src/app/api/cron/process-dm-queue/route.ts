import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { processQueuedInstagramDmsForAccount } from '@/lib/instagramDmQueue'
import { assertCronRequest } from '@/lib/cronAuth'

// The queue is processed account-by-account; give it room so a backlog across
// many accounts isn't cut short. The 5-minute cron cadence catches any overflow.
export const maxDuration = 300

// Called by Vercel Cron to continue queued comment-triggered DMs.
export async function GET(request: Request) {
  const unauthorized = assertCronRequest(request)
  if (unauthorized) return unauthorized

  const supabase = createServiceClient()

  const { data: queueRows, error } = await supabase
    .from('dm_logs')
    .select('account_id')
    .eq('platform', 'instagram')
    .eq('status', 'queued')
    .not('account_id', 'is', null)
    .limit(2000)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const uniqueAccountIds = [...new Set((queueRows || []).map((row: any) => row.account_id).filter(Boolean))]
  if (uniqueAccountIds.length === 0) {
    return NextResponse.json({ processed: 0, accounts: 0 })
  }

  let totalProcessed = 0
  for (const accountId of uniqueAccountIds) {
    const result = await processQueuedInstagramDmsForAccount(supabase, accountId)
    totalProcessed += result.processed
  }

  return NextResponse.json({
    processed: totalProcessed,
    accounts: uniqueAccountIds.length,
  })
}
