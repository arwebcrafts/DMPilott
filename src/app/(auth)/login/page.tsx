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

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginForm) {
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
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
            <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">Welcome back</h1>
            <p className="text-gray-600 dark:text-gray-300">Sign in to your account to continue</p>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-gray-900 dark:text-gray-100">Password</Label>
                <Link href="/forgot-password" className="text-sm text-[#e85d3a] hover:underline">
                  Forgot password?
                </Link>
              </div>
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

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                className="w-full text-white font-semibold"
                style={{ background: 'var(--accent)' }}
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </motion.div>
          </motion.form>

          {/* Guest login */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Button
              type="button"
              variant="ghost"
              className="w-full text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={async () => {
                setLoading(true)
                setError(null)
                const { error } = await supabase.auth.signInAnonymously()
                if (error) {
                  setError(error.message)
                  setLoading(false)
                } else {
                  router.push('/dashboard')
                  router.refresh()
                }
              }}
              disabled={loading}
            >
              Continue as Guest
            </Button>
          </motion.div>

          {/* Sign up link */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center text-sm text-gray-600 dark:text-gray-300"
          >
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-[#e85d3a] hover:underline font-medium">
              Sign up
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
