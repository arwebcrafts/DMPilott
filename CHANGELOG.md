# DMPilot — MVP Build Changelog
**Version:** 1.0.0 | **Date:** April 13, 2026 | **Status:** Build Complete

---

## Session Updates (April 15, 2026)

### Bug Fixes
- **Fixed redirect URL issue**: Changed signup redirect from `/onboarding` to `/dashboard` after signup
- **Fixed auth callback**: Updated `/auth/callback` to ensure user record exists in `users` table before redirecting
- **Fixed signup flow**: Signup now uses `emailRedirectTo` to properly go through callback, ensuring user profile is created
- **Fixed SQL syntax error**: Removed erroneous "trigger" keyword from `handle_updated_at()` function declaration

### New Features
- **Guest/Anonymous Sign-in**: Added "Continue as Guest" button on login page using Supabase anonymous sign-in
- **Settings Page**: Created `/dashboard/settings` page showing:
  - User email and name
  - User ID
  - Current plan
  - Email confirmation status
  - Account creation date
  - Sign out button

### Configuration Updates Required
**Vercel Environment Variables:**
```
META_APP_ID = <facebook_oauth_app_id>
META_APP_SECRET = <facebook_oauth_app_secret>
META_WEBHOOK_VERIFY_TOKEN = <random_verify_token>
NEXT_PUBLIC_APP_URL = https://dmpilott.vercel.app
SUPABASE_SERVICE_ROLE_KEY = <supabase_service_role_key>
ENCRYPTION_KEY = <32_char_random_string>
```

**Meta App Setup:**
- Facebook OAuth app with Facebook Login product enabled
- OAuth redirect URI: `https://dmpilott.vercel.app/api/meta/callback`
- Instagram API product configured with webhook callback URL: `https://dmpilott.vercel.app/api/webhooks/meta`

---

**Version:** 1.0.0 | **Date:** April 13, 2026 | **Status:** Build Complete

---

## What Was Built

A fully functional MVP of DMPilot — an Instagram & Facebook DM automation SaaS — was scaffolded directly in this session. It includes authentication, Meta OAuth, webhook event processing, a BullMQ job queue, dashboard UI, automation CRUD, and Stripe billing integration.

---

## Project Structure

```
dmpilot/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx          # Email + Google OAuth login
│   │   │   ├── signup/page.tsx         # Email + Google OAuth signup
│   │   │   └── forgot-password/page.tsx # Password reset flow
│   │   ├── auth/
│   │   │   └── callback/route.ts       # OAuth callback handler
│   │   ├── api/
│   │   │   ├── accounts/route.ts       # GET connected accounts
│   │   │   ├── accounts/[id]/route.ts  # DELETE disconnect account
│   │   │   ├── automations/route.ts    # GET/POST automations
│   │   │   ├── automations/[id]/route.ts        # PUT/DELETE automation
│   │   │   ├── automations/[id]/toggle/route.ts # PATCH toggle active
│   │   │   ├── meta/
│   │   │   │   ├── connect/route.ts   # Initiate Meta OAuth
│   │   │   │   └── callback/route.ts  # Meta OAuth callback
│   │   │   ├── stripe/
│   │   │   │   ├── create-checkout/route.ts # Create Stripe checkout
│   │   │   │   ├── portal/route.ts    # Stripe billing portal
│   │   │   │   └── webhook/route.ts   # Stripe webhook handler
│   │   │   └── webhooks/
│   │   │       └── meta/route.ts      # Meta webhook verifier + receiver
│   │   ├── dashboard/
│   │   │   ├── layout.tsx             # Dashboard shell (sidebar + navbar)
│   │   │   ├── page.tsx               # Overview with KPI cards + charts
│   │   │   ├── accounts/page.tsx      # Connect/disconnect IG/FB accounts
│   │   │   ├── automations/page.tsx   # Automation list + create modal
│   │   │   └── billing/page.tsx       # Plan management + Stripe portal
│   │   ├── layout.tsx                 # Root layout with metadata
│   │   ├── page.tsx                   # Public landing page
│   │   └── globals.css                # Tailwind v4 global styles
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx             # Shadcn Button component
│   │   │   ├── card.tsx               # Shadcn Card component
│   │   │   ├── input.tsx              # Shadcn Input component
│   │   │   ├── label.tsx              # Shadcn Label component
│   │   │   └── brand-icons.tsx        # Custom Instagram + Facebook SVG icons
│   │   └── dashboard/
│   │       ├── DashboardSidebar.tsx    # Left sidebar with nav + plan card
│   │       └── DashboardNavbar.tsx    # Top navbar with user dropdown
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts    # Browser Supabase client (for client components)
│   │   │   ├── server.ts   # Server Supabase client + service role client
│   │   │   └── middleware.ts # Session refresh for middleware
│   │   ├── encryption.ts   # AES-256-GCM token encryption/decryption
│   │   ├── planGating.ts   # Plan limits + gating utilities
│   │   └── utils.ts        # cn() utility (clsx + tailwind-merge)
│   ├── stores/
│   │   └── userStore.ts     # Zustand store for user + accounts state
│   └── workers/
│       └── dmWorker.ts      # BullMQ worker for sending DMs asynchronously
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # Full DB schema + RLS + triggers
├── .env.example              # Template with all required env vars
├── .env.local               # Placeholder values (fill in your real ones)
└── components.json          # Shadcn/ui configuration
```

---

## Implementation Details

### 1. Authentication
- **Supabase Auth** with email/password and Google OAuth
- `middleware.ts` protects `/dashboard/*` routes — unauthenticated users redirect to `/login`
- Auth pages redirect logged-in users away to `/dashboard`
- User profile auto-created on signup via PostgreSQL trigger

### 2. Meta OAuth (Connect Instagram/Facebook)
- `GET /api/meta/connect?platform=instagram|facebook` initiates OAuth
- User is redirected to Meta's official OAuth dialog
- `GET /api/meta/callback` exchanges code for long-lived token (60-day)
- Fetches account details (username, display name, profile pic, follower count)
- Token is **encrypted with AES-256-GCM** before storage (IV + auth tag prepended)
- Instagram connected via Page → Instagram Business Account chain
- Account upserted into `connected_accounts` table

### 3. Webhook Listener (`/api/webhooks/meta`)
- `GET` handler verifies Meta's webhook with `META_WEBHOOK_VERIFY_TOKEN`
- `POST` handler verifies `X-Hub-Signature-256` HMAC signature
- Routes Instagram and Facebook events separately
- **Immediately queues job to Redis** (BullMQ) and returns 200 — never blocks on API calls
- Matches incoming comments against user's active automations by keyword
- Prevents duplicate DMs via unique constraint on `(automation_id, post_id, commenter_platform_id)`
- Queues jobs with optional delay from `send_delay_seconds`

### 4. DM Worker (`src/workers/dmWorker.ts`)
- Standalone BullMQ worker (run with `npx tsx src/workers/dmWorker.ts`)
- Picks jobs from `dm-jobs` queue
- Rate-limited to **200 DMs/hour per account** via BullMQ limiter
- Decrypts access token, personalizes message with `{name}`, `{username}`, `{code}` merge tags
- Sends DM via `POST /me/messages` (Instagram) or Messenger API (Facebook)
- Updates `dm_logs` status to `sent` or `failed`
- Handles error codes: 190 (token expired → disconnects account), 368 (limit → requeues), 100 (invalid param → fails)
- Graceful shutdown on `SIGTERM`

### 5. Automations Dashboard
- List all automations with platform badge, keyword chips, toggle, DM count
- Create automation modal: platform tabs, trigger type selector (keyword/story/any), keyword tag input, DM textarea with merge tag hints, char counter
- Toggle automation active state via `PATCH /api/automations/[id]/toggle`
- Delete with confirmation
- Optimistic UI updates

### 6. Stripe Billing
- `POST /api/stripe/create-checkout` creates Stripe Checkout session with 7-day trial
- `POST /api/stripe/portal` opens Stripe Customer Portal
- `POST /api/stripe/webhook` handles: `checkout.session.completed`, `customer.subscription.updated/deleted`, `invoice.payment_failed/succeeded`
- Updates `users.plan` and `subscriptions` table on all events
- Three plan cards with monthly/yearly toggle

### 7. Dashboard Overview
- **KPI cards**: Total DMs Sent, DMs This Month (with progress bar), Active Automations, Accounts Connected
- **7-day bar chart**: Instagram vs Facebook DMs (CSS-only bars, no chart library needed)
- **Quick actions grid**: New Automation, Create Giveaway, View Analytics, Add Account
- **Recent activity table**: last 10 DM logs with status badges (Sent/Queued/Failed)

### 8. Database Schema (`supabase/migrations/001_initial_schema.sql`)
| Table | Purpose |
|---|---|
| `users` | Profile, plan, Stripe customer, DM usage counters |
| `connected_accounts` | IG/FB accounts with encrypted tokens, webhook status |
| `automations` | Automation configs (keywords, DM message, trigger type, settings) |
| `dm_logs` | Every DM event with status tracking + duplicate prevention index |
| `giveaways` | Giveaway configs (entry keyword, winner count, templates) |
| `giveaway_entries` | Collected entries with winner flag + unique constraint |
| `discount_codes` | Per-automation code pool with usage tracking |
| `subscriptions` | Stripe subscription state per user |
| **RLS enabled on all tables** — users only see their own data |

**Triggers:**
- Auto-create `users` row on `auth.users` insert
- Auto-set `updated_at` on update for users, accounts, automations, subscriptions

---

## Tech Stack Used

| Category | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + shadcn/ui components |
| Database | Supabase (PostgreSQL + Auth + RLS) |
| Queue | BullMQ + Upstash Redis |
| Payments | Stripe (Checkout + Webhooks + Customer Portal) |
| State | Zustand |
| Forms | React Hook Form + Zod |
| HTTP | Axios |
| Icons | Lucide React + custom SVG brand icons |
| Font | Inter (Google Fonts) |

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Meta Graph API
META_APP_ID=
META_APP_SECRET=
META_WEBHOOK_VERIFY_TOKEN=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_CREATOR_MONTHLY=
STRIPE_PRICE_CREATOR_YEARLY=
STRIPE_PRICE_PRO_MONTHLY=
STRIPE_PRICE_PRO_YEARLY=

# Redis (Upstash)
REDIS_URL=

# Encryption (32-char secret for AES-256)
ENCRYPTION_KEY=

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Setup Instructions

### 1. Supabase Setup
1. Create a Supabase project at supabase.com
2. Go to **Settings > API** and copy the URL and keys
3. Run the migration SQL in **Settings > SQL Editor**:
   - Paste contents of `supabase/migrations/001_initial_schema.sql`
   - Click **Run**
4. Enable **Google OAuth** in Authentication > Providers

### 2. Meta App Setup
1. Go to [developers.facebook.com](https://developers.facebook.com) → My Apps → your app
2. Add **Instagram Messaging** and **Messenger** products
3. Configure OAuth redirect: `{your-app-url}/api/meta/callback`
4. Set webhook URL: `{your-app-url}/api/webhooks/meta`
5. Subscribe to events: `comments`, `feed`, `messages`, `messaging_postbacks`
6. Copy App ID, App Secret, and set a random `WEBHOOK_VERIFY_TOKEN`

### 3. Stripe Setup
1. Create products and prices in Stripe Dashboard
2. Copy the 4 price IDs (Creator monthly/yearly, Pro monthly/yearly)
3. Set Stripe webhook URL: `{your-app-url}/api/stripe/webhook`
4. Use Stripe CLI to forward webhooks locally: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

### 4. Redis (Upstash)
1. Create a free Upstash Redis account at upstash.com
2. Copy your `REDIS_URL` from the Upstash dashboard

### 5. Run the App
```bash
cd dmpilot
npm run dev
```

### 6. Run the DM Worker (separate terminal)
```bash
npx tsx src/workers/dmWorker.ts
```

### 7. Expose Webhook for Local Testing
```bash
# Use ngrok or Cloudflare Tunnel
ngrok http 3000
# Set the ngrok URL as your Meta webhook URL
```

---

## Missing from Full Product

These are **not** in the MVP but were specced in the documentation:

- [ ] Onboarding wizard (4-step flow after signup)
- [ ] Analytics page with Recharts (full chart suite)
- [ ] Giveaway creation + winner picker + confetti animation
- [ ] Discount code upload + per-DM code assignment
- [ ] AI reply engine (GPT-4o Mini integration)
- [ ] Multi-language auto-detect + translation
- [ ] Email lead capture from DM replies
- [ ] Full Settings page (profile, notifications, API keys)
- [ ] Privacy Policy + Terms pages
- [ ] Landing page SEO (sitemap.ts, robots.ts, JSON-LD)
- [ ] i18n / multi-language (next-intl for PT-BR, DE, NL, etc.)
- [ ] ISR + loading.tsx + error.tsx for dashboard routes
- [ ] Sentry error monitoring
- [ ] Meta App Review submission (for going live with real users)

---

## Build Command

```bash
npm run build   # Production build
npm run dev     # Development server
npm run lint    # ESLint check
```
