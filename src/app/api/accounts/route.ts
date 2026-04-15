import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/accounts - list user's connected accounts
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: accounts } = await supabase
    .from('connected_accounts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Mask tokens (never return raw tokens)
  const maskedAccounts = (accounts || []).map(acc => ({
    ...acc,
    access_token_encrypted: undefined,
  }))

  return NextResponse.json({ accounts: maskedAccounts })
}
