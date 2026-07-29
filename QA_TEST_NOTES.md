# DMPilot — QA Test Notes

This document tells QA **what changed** and **how to verify it**. Read the top
section first — most of the previously reported bugs are already fixed in this
branch, so testing the wrong deployment will show them as still-failing.

---

## ⚠️ IMPORTANT — test the correct deployment

The previous bug report (BUG-001…BUG-015) was run against an **older deployment**.
Every fix below lives on the branch `claude/project-debug-production-ready-ogvpno`.

Before retesting, confirm all three:

1. The Vercel deployment you are testing was built from this branch (check the
   Vercel dashboard → the deployment's Git branch/commit).
2. The Supabase **migrations have been run** (SQL Editor), in order:
   `015, 016, 017, 018, 019, 020`.
3. Supabase **Auth → URL Configuration** has the production URLs in the
   *Redirect URLs* allowlist (see BUG-003 below).

If the deployment or migrations are stale, the old bugs will still appear even
though the code is fixed.

---

## Bug-by-bug verification

### BUG-004 — "Could not find the 'accountId' column" on Update Automation ✅ FIXED
- **What was wrong:** the client's camelCase `accountId` was sent straight to
  the database, which only has `account_id`.
- **Fix:** all fields now pass through a strict allowlist that maps camelCase →
  snake_case, so no unknown key can reach the database.
- **How to test:** Automations → edit any automation (keyword / DM reply / any
  comment) → change a field → Update. Expect success, no popup.

### BUG-005 — ~18 duplicate DM replies for one message ✅ FIXED
- **What was wrong:** the send path retried through multiple endpoints on any
  failure (even timeouts that had already delivered), and Meta's webhook retries
  weren't deduped race-safely.
- **Fix:** unique DB index + atomic claim + acknowledge-then-process, and the
  send only retries on true wrong-endpoint errors.
- **How to test:** enable a DM-reply automation → send **one** DM. Expect
  **exactly one** reply. (Requires migration `015` to be applied.)

### BUG-003 — Reset password shows "Could Not Load Bio Page" ✅ CODE HARDENED + CONFIG NEEDED
- **Code side:** `/auth/callback` now routes recovery links to `/reset-password`,
  and the reset page reads the recovery session robustly.
- **Config side (must do in Supabase dashboard):**
  Authentication → URL Configuration →
  - **Site URL:** `https://dmpilott.vercel.app` (your production URL)
  - **Redirect URLs (allowlist):** add
    `https://dmpilott.vercel.app/**` and `https://dmpilott.vercel.app/reset-password`
  Without these, Supabase ignores the reset redirect and lands on the wrong page.
- **How to test:** Forgot password → email → click the reset link → expect the
  Reset Password screen (not the bio error page).

### BUG-006 / BUG-010 — Empty link block can be saved ✅ FIXED
- Saving a link/product block now requires a title (client + server). The
  server rejects a blank title with 400.
- **Test:** Link in Bio → Links → edit a link → clear the title → Save. Expect a
  validation error, no save.

### BUG-007 — Long title breaks mobile preview ✅ FIXED
- Titles truncate (ellipsis) and wrap within the preview container.
- **Test:** enter a 100+ char title → Save → check the mobile preview stays intact.

### BUG-008 — `<script>` in title ✅ FIXED (sanitized)
- HTML tags are stripped on both client and server (`sanitizeText`), and the
  public page renders text through React (auto-escaped) — no `dangerouslySetInnerHTML`.
- **Test:** enter `<script>alert(1)</script>` as a title → Save → it is stored as
  plain text (`alert(1)`), no script runs.

### BUG-009 — Link saved without a URL ✅ FIXED
- Link/product blocks now require a valid `http(s)` URL, enforced **server-side**
  (a direct API call is rejected too).
- **Test:** edit a link → clear the URL → Save. Expect a validation error.

### BUG-011 — Duplicate title/URL ✅ FIXED
- Duplicate titles/URLs on the same page prompt a confirm ("Save anyway?").
- **Test:** create two links with the same title & URL → expect the warning.

### BUG-012 — Avatar accepts a non-image URL ✅ FIXED
- Avatar URL is validated as an image (client + **server**). A webpage URL like
  `https://www.google.com` is rejected.
- **Test:** Design → paste `https://www.google.com` as Avatar URL → Save. Expect
  a validation error.

### BUG-013 — Social field accepts unrelated URL ✅ FIXED
- Each social field is validated against its platform domain (client + **server**;
  invalid entries are rejected/dropped server-side).
- **Test:** Design → Social → put `https://picsum.photos/300` in the TikTok field
  → Save. Expect a validation error.

### BUG-014 — Background accepts a non-image URL ✅ FIXED
- Background image URL is validated as an image (client + **server**).
- **Test:** Design → Background → Image → paste `https://www.google.com` → Save.
  Expect a validation error.

### BUG-015 — QR code too small to scan ✅ FIXED
- The QR is now generated larger (400px, high error-correction, quiet-zone
  margin, pure-black modules) and displayed bigger and responsive.
- **Test:** Share → QR → scan with a phone camera. Expect a reliable scan.

### BUG-001 — Footer links (Support / Integrations / Contact)
- Footer uses real `<Link>` for internal pages and `mailto:` for Support/Contact.
- **Note:** `mailto:` opens the device's email client; on a machine with no mail
  client configured it appears to "do nothing" — that is expected browser
  behavior, not a bug. Integrations → the Features section.

### BUG-002 — FAQ "Email us" link
- The link is a `mailto:` (with a copy-to-clipboard fallback). Same `mailto:`
  note as above applies.

---

## What ELSE is new to test (built this cycle)

- **Pricing page** `/pricing` — Free / Creator ($19) / Pro ($49) / Business ($99),
  monthly & yearly toggle, comparison table. Nav + footer link to it.
- **Plan limits are enforced:** creating past the automation cap, enabling AI or
  follow-to-unlock below the required plan, exceeding the monthly DM limit, or
  connecting more accounts than allowed are all blocked with an upgrade message.
- **Dashboard DM usage meter** now shows real usage (X / limit) with an upgrade
  nudge at 80%+.
- **Story triggers:** Instagram Story Reply and Story Mention now work (they
  previously never fired). Automations → New → trigger "Story Reply"/"Story Mention".
- **Multi-step flows:** in an automation you can add up to 2 follow-up messages
  ("Add a follow-up message"). They send in order. Paid plans only.
- **AI auto-replies (Pro):** enable "AI replies" on a DM automation; requires the
  `ANTHROPIC_API_KEY` env var. Without a key it falls back to the static message.
- **Meta App Review note:** the public comment→DM flow ("Check your DMs!") needs
  the `instagram_manage_comments` permission approved. Until then, test as an app
  **tester/developer** role — all features work for testers.

---

## Migrations checklist (Supabase SQL Editor, in order)

`015` dedup + backfill · `016` waitlist · `017` per-post targeting ·
`018` DM usage · `019` Business plan · `020` flow steps
