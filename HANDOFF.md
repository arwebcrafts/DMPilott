# DMPilot — Team Handoff

**Live app:** https://dmpilott.vercel.app  
**Git branch:** `arman-cursor` only (all work happens here)  
**Meta App ID:** `4552936261602709`

---

## 1. What we already built

### Live and working

- Landing page with features, Link in Bio showcase, roadmap, dark mode
- Auth: email sign-up, guest sign-in (needs `012_anonymous_guest_users.sql` applied)
- OAuth: Instagram connect via popup (`/api/instagram/callback`)
- Dashboard: overview, accounts, automations, activity, analytics shell
- **Comment-to-DM automations:** keyword/any-comment triggers, static DM templates, public comment reply, activity log
- **Link in Bio:** create page, add links/categories/video/email blocks, design themes, insights, share + QR
- Meta webhook endpoint: `https://dmpilott.vercel.app/api/webhooks/meta`
- Plan gating (Free / Pro limits) in `src/lib/planGating.ts`

### Partially built (not production-ready)

| Feature | Status | Notes |
|---------|--------|-------|
| Giveaways | ~15% | DB + UI shell, create button disabled ("Soon") |
| Story triggers | ~5% | DB field only, no UI or webhook logic |
| AI replies | ~3% | `ai_replies_enabled` column exists, **no OpenAI integration** |
| Unified inbox | 0% | Not started |
| Appointment booking | 0% | Not started |

### AI replies — important

Adding `OPENAI_API_KEY` alone does **not** make AI replies work. Still needed:

- Server-side OpenAI SDK + API route
- Suggest/approve flow in automation UI
- Pro plan gating wired to real calls
- Webhook handler to use AI instead of static templates

### Meta App Review

| Permission | Status |
|------------|--------|
| `instagram_business_manage_messages` | Approved |
| `instagram_business_manage_comments` | **Rejected** — needs new screencast |

Screencast must show: login → connect IG → create automation with public comment reply → real comment on Instagram → **public reply visible on IG** → DM sent → activity log entry.  
Guide: `APP_REVIEW_GUIDE.md`

---

## 2. What to test

### Full product smoke test

1. Sign up (not guest) at https://dmpilott.vercel.app
2. Connect Instagram (Business/Creator account linked to Facebook Page)
3. Create automation: pick post, set keyword, write DM, enable public reply
4. From a second account, comment with the keyword
5. Verify: DM received, activity log updated, public reply on Instagram (if enabled)
6. Link in Bio: create page, add links, customize design, publish, open public URL
7. Test on mobile — bio page and dashboard

### Link in Bio — focus areas

- Add link / video / category blocks (save URL in edit modal)
- Publish toggle (page goes live at `/{slug}`)
- Background: preset, solid, gradient, image URL or upload
- Insights: views, clicks, email signups
- Share: copy URL, download QR code

### Meta screencast (for rejected permission)

Record full flow for `instagram_business_manage_comments` resubmission.  
Use a real post, real comment, show the public reply on Instagram app (not just DMPilot dashboard).

### Environment (never commit)

Required in Vercel / `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
META_APP_ID
INSTAGRAM_APP_ID
INSTAGRAM_APP_SECRET
ENCRYPTION_KEY
META_WEBHOOK_VERIFY_TOKEN
CRON_SECRET
NEXT_PUBLIC_APP_URL=https://dmpilott.vercel.app
```

Optional (AI, not wired yet): `OPENAI_API_KEY`

---

## 3. What to build next

Priority order:

1. **Giveaways** — finish create flow, entry tracking, winner picker (`src/app/dashboard/giveaways/`)
2. **Story triggers** — UI + webhook handler for story replies
3. **AI replies** — OpenAI server integration, Pro gating, automation UI toggle
4. **Unified inbox** — DM threads from connected accounts in one view
5. **Appointment booking** — calendar + booking links in bio blocks

Later:

- Facebook-only automations (partially supported, needs QA)
- Stripe billing (plans exist in code, checkout not live)
- Email notifications
- White-label / agency mode

### Rules for all new work

- Branch: `arman-cursor` only
- Never commit `.env` or API keys
- Meta and OpenAI calls **server-side only** (never from frontend JS)
- All REST routes: auth check + input sanitization
- Guest sessions are temporary — real sign-up for production testing

### Key files

```
src/app/dashboard/link-in-bio/     Link in Bio UI
src/app/api/bio-pages/             Bio page CRUD
src/app/api/bio-blocks/            Bio blocks CRUD
src/app/api/webhooks/meta/         Instagram/Facebook webhooks
src/lib/planGating.ts              Feature limits per plan
supabase/migrations/               Database schema
APP_REVIEW_GUIDE.md                Meta review screencast guide
TESTER_ONBOARDING.md               Beta tester instructions
```

---

*This file is temporary — delete after handoff is complete.*
