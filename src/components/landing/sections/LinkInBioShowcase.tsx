'use client';

import { motion } from 'framer-motion';
import { Link2, Palette, BarChart3, Share2, Video, Mail, ShoppingBag } from 'lucide-react';
import { SectionContainer } from '../shared/SectionContainer';
import { SectionHeader } from '../shared/SectionHeader';
import { CTAButton } from '../shared/CTAButton';
import Link from 'next/link'

const bioFeatures = [
  { icon: Link2, label: 'Unlimited links' },
  { icon: Video, label: 'Video embeds' },
  { icon: ShoppingBag, label: 'Product cards' },
  { icon: Mail, label: 'Email capture' },
  { icon: Palette, label: 'Custom themes' },
  { icon: BarChart3, label: 'Click analytics' },
];

export function LinkInBioShowcase() {
  return (
    <SectionContainer padding="lg" id="link-in-bio" className="section-cool overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Copy */}
          <div>
            <SectionHeader
              title="Link in Bio, built in"
              subtitle="Like Linktree, but included"
              description="One premium link page for your Instagram bio. No extra tool, no extra bill. Design it, publish it, track every click."
              align="left"
              size="lg"
            />

            <div className="mt-8 grid grid-cols-2 gap-3">
              {bioFeatures.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 p-3 rounded-xl border"
                  style={{ background: 'var(--surface-1)', borderColor: 'var(--surface-2)' }}
                >
                  <Icon className="w-4 h-4 text-[#DD2A7B]" />
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <CTAButton variant="primary" size="md" href="/signup">
                Create your page
              </CTAButton>
              <Link
                href="/features"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium border transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                style={{ borderColor: 'var(--surface-2)', color: 'var(--text-primary)' }}
              >
                <Share2 className="w-4 h-4" />
                See all features
              </Link>
            </div>
          </div>

          {/* Phone mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex justify-center lg:justify-end"
          >
            <div className="w-[280px] rounded-[2.5rem] border-[6px] border-gray-900 shadow-2xl overflow-hidden bg-gray-900">
              <div className="bg-gray-900 pt-3 pb-1 flex justify-center">
                <div className="w-16 h-1 rounded-full bg-gray-700" />
              </div>
              <div
                className="px-5 pt-6 pb-8 min-h-[480px]"
                style={{ background: 'linear-gradient(160deg, #8134AF 0%, #DD2A7B 50%, #F58529 100%)' }}
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-white/20 mx-auto mb-3 flex items-center justify-center text-2xl font-bold text-white">
                    D
                  </div>
                  <p className="text-white font-bold text-lg">@yourbrand</p>
                  <p className="text-white/70 text-xs mt-1">Creator · DM automation</p>
                </div>
                <div className="space-y-2.5">
                  {['Shop my course', 'Free guide', 'Book a call', 'Latest reel'].map((label, i) => (
                    <motion.div
                      key={label}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + i * 0.08 }}
                      className="w-full py-3 px-4 rounded-xl text-center text-sm font-semibold text-gray-900 bg-white/95 shadow-sm"
                    >
                      {label}
                    </motion.div>
                  ))}
                </div>
                <p className="text-center text-[10px] text-white/50 mt-6">dmpilott.vercel.app/you</p>
              </div>
              <div className="h-5 bg-gray-900 flex justify-center items-center">
                <div className="w-24 h-1 rounded-full bg-gray-600" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </SectionContainer>
  );
}
