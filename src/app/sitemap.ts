import { MetadataRoute } from 'next'

// Keep in sync with the public marketing routes. The base URL comes from the
// deployment so preview/prod both emit correct absolute URLs.
const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://dmpilot.com').replace(/\/$/, '')

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date()

  const routes: Array<[string, number, MetadataRoute.Sitemap[number]['changeFrequency']]> = [
    ['', 1, 'daily'],
    ['/pricing', 0.9, 'weekly'],
    ['/features', 0.8, 'weekly'],
    ['/services', 0.7, 'monthly'],
    ['/signup', 0.9, 'monthly'],
    ['/login', 0.6, 'monthly'],
    ['/privacy-policy', 0.4, 'monthly'],
    ['/terms-of-service', 0.4, 'monthly'],
  ]

  return routes.map(([path, priority, changeFrequency]) => ({
    url: `${BASE_URL}${path}`,
    lastModified: currentDate,
    changeFrequency,
    priority,
  }))
}
