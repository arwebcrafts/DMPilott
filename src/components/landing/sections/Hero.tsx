'use client';

import { motion } from 'framer-motion';
import { EmailCapture } from '../shared/EmailCapture';

export function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-white hero-gradient px-4">
      <div className="max-w-3xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-sm font-medium mb-8"
        >
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          CALM ENGAGEMENT · PRIVATE BETA
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-6 leading-tight"
        >
          End the day knowing you actually connected.
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed max-w-2xl mx-auto"
        >
          A calm DM automation tool that helps you respond without losing the personal touch.
        </motion.p>

        {/* Email Capture */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-md mx-auto"
        >
          <EmailCapture
            placeholder="Your email"
            buttonText="Start your day"
            className="w-full"
          />
          <p className="mt-4 text-sm text-gray-500">
            Join the calm crew already in beta. No spam.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
