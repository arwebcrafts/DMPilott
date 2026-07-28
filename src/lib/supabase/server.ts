import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
          }
        },
      },
    }
  )
}

export function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return [] },
        setAll() {},
      },
    }
  )
}

let cachedServiceClient: ReturnType<typeof createServiceClient> | null = null

/**
 * Memoised service client. Unlike `createServiceClient()` this must never be
 * called at module scope — see `serviceClientProxy` below for that case.
 */
export function getServiceClient() {
  if (!cachedServiceClient) {
    cachedServiceClient = createServiceClient()
  }
  return cachedServiceClient
}

/**
 * A stand-in for the service client that defers construction until the first
 * property access. Modules that want a file-level `supabase` binding must use
 * this: building the real client at import time reads env vars during
 * `next build` page-data collection, where they are not available, and throws
 * "Your project's URL and Key are required to create a Supabase client!".
 */
export const serviceClientProxy = new Proxy(
  {},
  {
    get(_target, prop) {
      const client = getServiceClient() as unknown as Record<string | symbol, unknown>
      const value = client[prop]
      return typeof value === 'function' ? (value as (...args: unknown[]) => unknown).bind(client) : value
    },
  }
) as ReturnType<typeof createServiceClient>
