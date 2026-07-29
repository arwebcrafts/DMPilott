import { Metadata } from 'next'
import { PricingPageClient } from './PricingPageClient'

export const metadata: Metadata = {
  title: 'Pricing - DMPilot | Instagram & Facebook DM Automation',
  description:
    'Simple, transparent pricing for DMPilot. Automate Instagram and Facebook comment-to-DM replies, AI conversations, follow-to-unlock, and Link in Bio. Free plan available, monthly or yearly.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'DMPilot Pricing — Free, Creator, and Pro plans',
    description:
      'Automate Instagram & Facebook DMs. Start free, upgrade for AI replies, follow-to-unlock, and higher limits.',
    url: '/pricing',
    type: 'website',
  },
}

export default function PricingPage() {
  return <PricingPageClient />
}
