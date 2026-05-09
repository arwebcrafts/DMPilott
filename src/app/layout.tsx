import type { Metadata } from 'next'
import './globals.css'

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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
