import dynamic from 'next/dynamic';
import { Metadata } from 'next';
import { Navigation } from '@/components/landing/shared/Navigation';
import { Hero } from '@/components/landing/sections/Hero';
import { Problem } from '@/components/landing/sections/Problem';
import { Solution } from '@/components/landing/sections/Solution';
import { ProductDemo } from '@/components/landing/sections/ProductDemo';

export const metadata: Metadata = {
  title: 'DMPilot - Turn Instagram Comments into Customers with AI-Powered DM Automation',
  description: 'Automate your Instagram DMs with DMPilot. Respond to comments instantly, increase conversions by 3x, and save 10+ hours per week. Trusted by 500+ creators.',
  keywords: ['Instagram DM automation', 'Instagram comment to DM', 'Instagram marketing tool', 'creator automation', 'Instagram DM bot', 'auto DM Instagram'],
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
  description: 'AI-powered Instagram DM automation tool that turns comments into customers',
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
    'Automated DM responses',
    'AI-powered conversation',
    'Instagram integration',
    'Analytics dashboard',
    'Custom workflows',
  ],
};

// Lazy load heavy sections below the fold
const TargetAudience = dynamic(() => import('@/components/landing/sections/TargetAudience').then(m => m.TargetAudience), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse" />,
  ssr: true,
});

const Values = dynamic(() => import('@/components/landing/sections/Values').then(m => m.Values), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse" />,
  ssr: true,
});

const Comparison = dynamic(() => import('@/components/landing/sections/Comparison').then(m => m.Comparison), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse" />,
  ssr: true,
});

const Integrations = dynamic(() => import('@/components/landing/sections/Integrations').then(m => m.Integrations), {
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
      <main id="main-content" className="light-theme">
        <Navigation />
        <Hero />
        <Problem />
        <Solution />
        <ProductDemo />
        <TargetAudience />
        <Values />
        <Comparison />
        <Integrations />
        <SocialProof />
        <FAQ />
        <FinalCTA />
        <Footer />
      </main>
    </>
  );
}
