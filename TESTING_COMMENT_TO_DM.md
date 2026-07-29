# Testing comment → DM (start here when "no DM arrives")

## First: open the new Diagnostics page

`/dashboard/diagnostics`

It shows, in plain English, **every webhook Meta sent and what DMPilot did with it**.
You no longer have to guess. Comment on your post, wait ~10 seconds, hit Refresh.

What the outcomes mean:

| Outcome | Meaning | Fix |
|---|---|---|
| *(no events at all)* | Meta is not delivering webhooks | Meta dashboard → Instagram → Webhooks: callback `https://dmpilott.vercel.app/api/webhooks/meta`, subscribe the **comments** and **messages** fields |
| `rejected signature` | Your app secret doesn't match | Set `META_APP_SECRET` (and `INSTAGRAM_APP_SECRET`) in Vercel → redeploy |
| `no account` | Event arrived, no matching connected account | Reconnect the account under Accounts |
| `no automation` | Account matched, no ACTIVE automation | Turn the automation ON |
| `no keyword match` | Comment text didn't match your keywords | Check spelling / try "Any Comment" |
| `queued` | Matched, waiting to send | If it stays queued, check the DM attempts list for Meta's error |
| `send failed` | Meta rejected the send | The detail shows **Meta's exact error** — usually a permission or the 24h window |
| `sent` | ✅ Delivered | — |

---

## The known cause of "zero DMs" (fixed in this release)

Signature verification previously used **only** `META_APP_SECRET`. Instagram Login
for Business signs webhooks with the **Instagram** app secret. If they differ (or
the variable is missing in Vercel), **every webhook was rejected with 401 and no
DM was ever sent** — silently.

Now DMPilot accepts either secret and, when it can't verify, records
`rejected signature` on the Diagnostics page instead of failing silently.

**Action:** in Vercel → Settings → Environment Variables, confirm:
- `META_APP_SECRET` = Meta app secret (App Settings → Basic)
- `INSTAGRAM_APP_SECRET` = Instagram app secret (Products → Instagram → API setup) — set it even if you think it's the same
- `META_WEBHOOK_VERIFY_TOKEN` = same string used in the Meta webhook config

Then **redeploy** (env changes need a rebuild).

---

## Step-by-step test

**Setup (once)**
1. Both Instagram accounts must be **Business or Creator** accounts (personal accounts cannot receive automated DMs).
2. In the Meta app, the tester account has a role: App Roles → Roles → add as Tester, and **accept the invite**.
3. Meta dashboard → Webhooks → Instagram: callback URL `https://dmpilott.vercel.app/api/webhooks/meta`, verify token matches, and **comments** + **messages** are subscribed.
4. Vercel env vars set as above, redeployed.
5. Supabase migrations run: `015 … 022`.

**The test**
1. Log in to DMPilot → Accounts → connect Instagram Account A.
2. Automations → New Automation:
   - Platform **Instagram**, Account **A**
   - Trigger **Keyword**, keyword `LINK`
   - Apply to **All posts**
   - DM Message: `Hey {name}! Here's the link 👇`
   - CTA button: label `Get Access`, URL `https://your-site.com`
   - Save, and confirm the toggle is **ON**.
3. From Account **B** (a different account, not following required), comment `LINK` on any post of Account A.
4. Wait ~10 seconds → check Account B's DMs.
5. If nothing arrives → `/dashboard/diagnostics` → Refresh → read the outcome.

**Expected:** Account B receives one DM with your text and a tappable **Get Access** button.

---

## Important limits that are NOT bugs

- **The commenter must not be you.** Instagram will not deliver an automated DM from an account to itself. Always comment from a second account.
- **Comment → DM (private reply) requires the `instagram_manage_comments` permission.** Before App Review approval it works **only** for users with a role in your Meta app (admin/developer/tester). That's why the tester role in step 2 matters. Your public users won't work until approved.
- **DM auto-reply (someone messages you first)** works without that permission — good for the App Review demo video.
- **24-hour window:** a plain DM can only be sent within 24h of the user's last message. Comment-triggered private replies are exempt (7 days), which is why we send them via `comment_id`.
- **Rate limits:** 200 sends/hour per account, plus your plan's monthly limit (Free = 150).

---

## Recording the App Review video

Meta wants to see the permission being used. Record:
1. Logging into DMPilot and showing the automation with keyword `LINK`.
2. Switching to the second account, commenting `LINK` on the post.
3. The DM arriving with the CTA button.
4. Briefly showing the Diagnostics page proving the event flow.

Keep it under 2 minutes and narrate what each screen is.
