import dynamic from 'next/dynamic';
import { Metadata } from 'next';
import { Navigation } from '@/components/landing/shared/Navigation';
import { SideNavigation } from '@/components/landing/shared/SideNavigation';
import { Hero } from '@/components/landing/sections/Hero';

export const metadata: Metadata = {
  title: 'DMPilot - Turn Instagram Comments into Customers with DM Automation',
  description: 'Automate Instagram and Facebook DMs when someone comments on your posts or reels. Built-in Link in Bio. Official Meta APIs. Free to start.',
  keywords: ['Instagram DM automation', 'comment to DM', 'Link in Bio', 'Instagram marketing', 'Facebook DM automation', 'Linktree alternative'],
  authors: [{ name: 'DMPilot' }],
  creator: 'DMPilot',
  publisher: 'DMPilot',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://dmpilot.com',
    title: 'DMPilot - Turn Instagram Comments into Customers',
    description: 'Automate your Instagram DMs with AI-powered responses. Increase conversions and save time.',
    siteName: 'DMPilot',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DMPilot - Turn Instagram Comments into Customers',
    description: 'Automate your Instagram DMs with AI-powered responses. Increase conversions and save time.',
    creator: '@dmpilot',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'DMPilot',
  description: 'Instagram and Facebook comment-to-DM automation with built-in Link in Bio',
  url: 'https://dmpilot.com',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '9',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    ratingCount: '500',
  },
  featureList: [
    'Comment-to-DM automation',
    'Instagram and Facebook support',
    'Public comment auto-reply',
    'Link in Bio page builder',
    'DM analytics dashboard',
    'Keyword and any-comment triggers',
  ],
};

// Lazy load heavy sections below the fold
const SoundFamiliar = dynamic(() => import('@/components/landing/sections/SoundFamiliar').then(m => m.SoundFamiliar), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse" />,
  ssr: true,
});

const CostOfManual = dynamic(() => import('@/components/landing/sections/CostOfManual').then(m => m.CostOfManual), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse" />,
  ssr: true,
});

const Features = dynamic(() => import('@/components/landing/sections/Features').then(m => m.Features), {
  loading: () => <div className="h-96 animate-pulse" style={{ background: 'var(--surface-1)' }} />,
  ssr: true,
});

const LinkInBioShowcase = dynamic(() => import('@/components/landing/sections/LinkInBioShowcase').then(m => m.LinkInBioShowcase), {
  loading: () => <div className="h-96 animate-pulse" style={{ background: 'var(--surface-0)' }} />,
  ssr: true,
});

const Roadmap = dynamic(() => import('@/components/landing/sections/Roadmap').then(m => m.Roadmap), {
  loading: () => <div className="h-96 animate-pulse" style={{ background: 'var(--section-warm)' }} />,
  ssr: true,
});

const WhatDMPilotDoes = dynamic(() => import('@/components/landing/sections/WhatDMPilotDoes').then(m => m.WhatDMPilotDoes), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse" />,
  ssr: true,
});

const DayInDMPilot = dynamic(() => import('@/components/landing/sections/DayInDMPilot').then(m => m.DayInDMPilot), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse" />,
  ssr: true,
});

const Values = dynamic(() => import('@/components/landing/sections/Values').then(m => m.Values), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse" />,
  ssr: true,
});

const TargetAudience = dynamic(() => import('@/components/landing/sections/TargetAudience').then(m => m.TargetAudience), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse" />,
  ssr: true,
});

const HonestComparison = dynamic(() => import('@/components/landing/sections/HonestComparison').then(m => m.HonestComparison), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse" />,
  ssr: true,
});


const SocialProof = dynamic(() => import('@/components/landing/sections/SocialProof').then(m => m.SocialProof), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse" />,
  ssr: true,
});

const FAQ = dynamic(() => import('@/components/landing/sections/FAQ').then(m => m.FAQ), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse" />,
  ssr: true,
});

const FinalCTA = dynamic(() => import('@/components/landing/sections/FinalCTA').then(m => m.FinalCTA), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse" />,
  ssr: true,
});

const Footer = dynamic(() => import('@/components/landing/sections/Footer').then(m => m.Footer), {
  loading: () => <div className="h-64 bg-gray-900 animate-pulse" />,
  ssr: true,
});

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50"
      >
        Skip to main content
      </a>
      <main id="main-content">
        <Navigation />
        <SideNavigation />
        <Hero />
        <SoundFamiliar />
        <Features />
        <LinkInBioShowcase />
        <WhatDMPilotDoes />
        <DayInDMPilot />
        <CostOfManual />
        <Values />
        <TargetAudience />
        <HonestComparison />
        <Roadmap />
        <SocialProof />
        <FAQ />
        <FinalCTA />
        <Footer />
      </main>
    </>
  );
}
