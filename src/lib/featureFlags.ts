/**
 * Feature switches.
 *
 * Story triggers are hidden until Meta approves comment management. They are
 * built and the webhook still handles them, but they are not proven against
 * real Instagram traffic, and a half-working option on screen during App Review
 * is a liability.
 *
 * To turn them back on: set NEXT_PUBLIC_ENABLE_STORY_TRIGGERS=true in Vercel
 * (Settings → Environment Variables → All Environments) and redeploy. No code
 * change needed.
 */
export const STORY_TRIGGERS_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_STORY_TRIGGERS === 'true'
