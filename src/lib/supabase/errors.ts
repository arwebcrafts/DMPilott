export function getSupabaseConfigError(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? ''
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? ''

  if (!url || !anonKey) {
    return 'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.'
  }

  if (anonKey.includes('placeholder') || anonKey.endsWith('.placeholder')) {
    return 'Supabase anon key is still a placeholder. Copy the real anon key from Vercel or Supabase Dashboard into .env.local, then restart the dev server.'
  }

  // Legacy anon keys are JWTs ("eyJ..."); current projects issue publishable
  // keys ("sb_publishable_..."). Both are valid.
  if (!anonKey.startsWith('eyJ') && !anonKey.startsWith('sb_publishable_')) {
    return 'Supabase anon key looks invalid. Copy it again from Supabase → Project Settings → API.'
  }

  return null
}

export function formatAuthError(message: string): string {
  const lower = message.toLowerCase()

  if (lower.includes('invalid api key')) {
    return 'Invalid Supabase API key. Update NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (local) or Vercel env vars (production), then restart.'
  }

  if (lower.includes('anonymous') && lower.includes('disabled')) {
    return 'Guest sign-in is disabled in Supabase. Enable it under Authentication → Providers → Anonymous.'
  }

  if (lower.includes('database error creating anonymous user')) {
    return 'Guest sign-in needs a database update. Run migration 012_anonymous_guest_users.sql in the Supabase SQL Editor.'
  }

  return message
}
