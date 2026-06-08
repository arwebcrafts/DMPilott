'use client';

import { motion } from 'framer-motion';
import { SectionContainer } from '../shared/SectionContainer';
import { EmailCapture } from '../shared/EmailCapture';

export function FinalCTA() {
  return (
    <SectionContainer padding="xl" id="join">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <p className="text-sm text-gray-500 mb-4">START YOUR DAY</p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6 leading-tight">
            When the day starts quiet, the day ends done.
          </h2>
        </div>
        
        <div className="bg-gray-50 rounded-2xl p-8 mb-8">
          <p className="text-gray-600 mb-4">Hi friend,</p>
          <p className="text-gray-600 mb-4">
            Most apps want you to do more. <span className="font-semibold text-gray-900">DMPilot wants you to feel done.</span>
          </p>
          <p className="text-gray-600 mb-6">
            Drop your email. We'll send a thoughtful invite when there's room — never a marketing blast, never a countdown.
          </p>
          <EmailCapture
            placeholder="Your email"
            buttonText="Start your day"
            className="w-full"
          />
          <div className="mt-6">
            <p className="text-gray-500">With calm,</p>
            <p className="text-gray-600">— The DMPilot team</p>
          </div>
        </div>
        
        <p className="text-sm text-gray-500">
          JOIN THE CALM CREW · ALREADY IN BETA · QUIET ON PURPOSE
        </p>
      </div>
    </SectionContainer>
  );
}
