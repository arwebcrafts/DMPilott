'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { CTAButton } from './CTAButton';
import { cn } from '@/lib/utils';

interface EmailCaptureProps {
  onSubmit?: (email: string) => Promise<void>;
  placeholder?: string;
  buttonText?: string;
  successMessage?: string;
  className?: string;
}

export function EmailCapture({
  onSubmit,
  placeholder = 'Your email',
  buttonText = 'Start your day',
  successMessage = "You're on the list!",
  className,
}: EmailCaptureProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit');
      }

      if (onSubmit) {
        await onSubmit(email);
      }
      setIsSuccess(true);
      setEmail('');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn('w-full max-w-md', className)}>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          disabled={isSubmitting || isSuccess}
          className={cn(
            'flex-1 px-5 py-4 rounded-lg border border-gray-300',
            'focus:border-gray-900 focus:ring-2 focus:ring-gray-900 outline-none',
            'text-gray-900 placeholder-gray-400',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-all duration-200'
          )}
        />
        <CTAButton
          isLoading={isSubmitting}
          disabled={isSuccess}
          className="sm:w-auto whitespace-nowrap"
        >
          {buttonText}
        </CTAButton>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 flex items-center gap-2 text-red-600 text-sm"
          >
            <AlertCircle className="h-4 w-4" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 flex items-center gap-2 text-green-600 text-sm"
          >
            <CheckCircle className="h-4 w-4" />
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
