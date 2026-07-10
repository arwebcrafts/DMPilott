import { createBrowserClient } from '@supabase/ssr'
import { getSupabaseConfigError } from './errors'

export function createClient() {
  const configError = getSupabaseConfigError()
  if (configError && typeof window !== 'undefined') {
    console.error(configError)
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
}
