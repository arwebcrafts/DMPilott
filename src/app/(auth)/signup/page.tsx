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
import { motion } from 'framer-motion'

const signupSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
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
      setError(error.message)
      setLoading(false)
      return
    }

    // If email confirmation is required, show message
    if (data.user && !data.session) {
      setError('Please check your email to confirm your account.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: 'var(--background)' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="card-warm rounded-2xl p-8 space-y-6 shadow-xl">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#e85d3a] to-[#f09433] flex items-center justify-center">
                <span className="text-white text-lg font-bold">D</span>
              </div>
              <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">DMPilot</span>
            </div>
            <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">Create an account</h1>
            <p className="text-gray-600 dark:text-gray-300">Start automating your Instagram & Facebook DMs</p>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-400"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-gray-900 dark:text-gray-100">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                {...register('fullName')}
                className="border-gray-300 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 focus:border-[#e85d3a]"
              />
              {errors.fullName && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-900 dark:text-gray-100">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register('email')}
                className="border-gray-300 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 focus:border-[#e85d3a]"
              />
              {errors.email && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-900 dark:text-gray-100">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                className="border-gray-300 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 focus:border-[#e85d3a]"
              />
              {errors.password && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-900 dark:text-gray-100">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                {...register('confirmPassword')}
                className="border-gray-300 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 focus:border-[#e85d3a]"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.confirmPassword.message}</p>
              )}
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                className="w-full text-white font-semibold"
                style={{ background: 'var(--accent)' }}
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </motion.div>

            <p className="text-xs text-gray-600 dark:text-gray-300 text-center">
              By signing up, you agree to our{' '}
              <Link href="/privacy-policy" className="text-[#e85d3a] hover:underline">Privacy Policy</Link>
              {' '}and{' '}
              <Link href="/terms-of-service" className="text-[#e85d3a] hover:underline">Terms of Service</Link>
            </p>
          </motion.form>

          {/* Sign in link */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-sm text-gray-600 dark:text-gray-300"
          >
            Already have an account?{' '}
            <Link href="/login" className="text-[#e85d3a] hover:underline font-medium">
              Sign in
            </Link>
          </motion.p>
        </div>

        {/* Back to home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-6"
        >
          <Link href="/" className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
            ← Back to home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
