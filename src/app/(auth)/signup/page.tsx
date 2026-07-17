'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthShell } from '@/components/auth/AuthShell'
import { formatAuthError } from '@/lib/supabase/errors'
import { motion } from 'framer-motion'

const signupSchema = z.object({
  fullName: z.string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .refine((val) => val.replace(/\s/g, '').length >= 2, {
      message: 'Name cannot be only whitespace',
    }),
  email: z.string().email('Please enter a valid email'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type SignupForm = z.infer<typeof signupSchema>

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const { register, handleSubmit, formState: { errors } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  })

  async function onSubmit(formData: SignupForm) {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    })

    if (error) {
      setError(formatAuthError(error.message))
      setLoading(false)
      return
    }

    if (data.user && !data.session) {
      setError('Please check your email to confirm your account.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <AuthShell
      title="Create an account"
      subtitle="Start automating your Instagram & Facebook DMs"
      footer={
        <p className="text-center text-sm auth-subtitle">
          Already have an account?{' '}
          <Link href="/login" className="text-[#e85d3a] hover:underline font-medium">
            Sign in
          </Link>
        </p>
      }
    >
      <motion.form
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input id="fullName" type="text" placeholder="John Doe" {...register('fullName')} />
          {errors.fullName && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.fullName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
          {errors.email && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
          {errors.password && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input id="confirmPassword" type="password" placeholder="••••••••" {...register('confirmPassword')} />
          {errors.confirmPassword && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full text-white font-semibold"
          style={{ background: 'var(--accent)' }}
          disabled={loading}
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </Button>

        <p className="text-xs auth-subtitle text-center">
          By signing up, you agree to our{' '}
          <Link href="/privacy-policy" className="text-[#e85d3a] hover:underline">Privacy Policy</Link>
          {' '}and{' '}
          <Link href="/terms-of-service" className="text-[#e85d3a] hover:underline">Terms of Service</Link>
        </p>
      </motion.form>
    </AuthShell>
  )
}
