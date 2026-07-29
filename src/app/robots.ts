import { MetadataRoute } from 'next'

const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://dmpilot.com').replace(/\/$/, '')

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Keep private/app surfaces out of the index; marketing pages stay open.
        disallow: ['/api/', '/dashboard/', '/auth/', '/reset-password', '/forgot-password'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  }
}
