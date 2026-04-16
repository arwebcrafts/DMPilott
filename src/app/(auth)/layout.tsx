// Auth pages use the Supabase client and must not be statically pre-rendered
export const dynamic = 'force-dynamic'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
