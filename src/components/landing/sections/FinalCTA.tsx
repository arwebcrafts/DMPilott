'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { SectionContainer } from '../shared/SectionContainer';
import { CTAButton } from '../shared/CTAButton';
import { EmailCapture } from '../shared/EmailCapture';

export function FinalCTA() {
  const handleEmailSubmit = async (email: string) => {
    // TODO: Implement email submission logic
    console.log('Email submitted:', email);
  };

  return (
    <SectionContainer variant="dark" padding="xl" id="final-cta">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
            Ready to Turn Comments into Customers?
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-300 leading-relaxed">
            Join 500+ creators who are already using DMPilot to automate their Instagram DMs and increase conversions.
          </p>

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-6 text-gray-300">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-400" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-400" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-400" />
              <span>Cancel anytime</span>
            </div>
          </div>

          {/* Email Capture */}
          <div className="max-w-md mx-auto">
            <EmailCapture
              onSubmit={handleEmailSubmit}
              placeholder="Enter your email"
              buttonText="Start Free Trial"
              successMessage="Check your inbox to get started!"
              className="w-full"
            />
          </div>

          {/* Secondary CTA */}
          <div className="pt-4">
            <CTAButton
              variant="outline"
              size="lg"
              href="/signup"
              className="border-white text-white hover:bg-white hover:text-gray-900"
            >
              Create Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </CTAButton>
          </div>

          {/* Trust Badge */}
          <div className="pt-8 border-t border-gray-700">
            <p className="text-sm text-gray-400">
              Trusted by creators worldwide. Your data is secure and encrypted.
            </p>
          </div>
        </motion.div>
      </div>
    </SectionContainer>
  );
}
