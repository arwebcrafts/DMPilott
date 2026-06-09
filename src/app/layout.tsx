import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'DMPilot — Instagram & Facebook DM Automation for Creators',
    template: '%s | DMPilot',
  },
  description: 'Automatically send DMs to everyone who comments on your Instagram and Facebook posts. Turn comments into customers. Used by 2,400+ creators. Start free.',
  keywords: ['instagram dm automation', 'instagram auto dm', 'comment to dm', 'facebook dm automation', 'meta api'],
  authors: [{ name: 'DMPilot' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://dmautomation.app',
    siteName: 'DMPilot',
    title: 'DMPilot — Instagram & Facebook DM Automation',
    description: 'Automatically send DMs to everyone who comments on your posts. Official Meta API. Start free.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DMPilot — Instagram DM Automation',
    description: 'Send automatic DMs to everyone who comments on your Instagram posts.',
    creator: '@dmpilot',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${outfit.variable}`}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
