/**
 * Reserved top-level route segments — cannot be claimed as bio slugs.
 * Add new entries here when introducing new root-level routes.
 */
export const RESERVED_SLUGS = new Set([
  'dashboard',
  'login',
  'signup',
  'forgot-password',
  'reset-password',
  'creators',
  'contact-sales',
  'privacy-policy',
  'terms-of-service',
  'webview',
  'auth',
  'api',
  'admin',
  'pricing',
  'about',
  'blog',
  'help',
  'support',
  'status',
  'sitemap',
  'robots',
  'favicon',
  'manifest',
])

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug.toLowerCase())
}
