'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export const dynamic = 'force-dynamic'

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
})

type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--background)' }}>
        <Card className="w-full max-w-md text-center border shadow-xl" style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}>
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'var(--surface-1)' }}>
                <span className="text-3xl text-[#22c55e]">✓</span>
              </div>
            </div>
            <CardTitle className="text-2xl text-gray-900 dark:text-gray-100">Check your email</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              We sent a password reset link to your email address.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--background)' }}>
      <Card className="w-full max-w-md border shadow-xl" style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}>
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Reset password</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">Enter your email to receive a reset link</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-md dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-900 dark:text-gray-100">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="you@example.com" 
                {...register('email')} 
                className="border-gray-300 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 focus:border-[#e85d3a]"
              />
              {errors.email && <p className="text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>}
            </div>
            <Button
              type="submit"
              className="w-full text-white font-semibold"
              style={{ background: 'var(--accent)' }}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
