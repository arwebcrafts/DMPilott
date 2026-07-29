-- =============================================================================
-- Migration 016: waitlist table
-- =============================================================================
-- The /api/waitlist route writes here via the service client, but the table
-- was never captured in a migration (it had been created by hand). Add it so a
-- fresh database matches production. RLS is on with no public policies: only
-- the service role (which bypasses RLS) can read or write, so email addresses
-- are never exposed to anonymous or logged-in users.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON public.waitlist(created_at DESC);

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
