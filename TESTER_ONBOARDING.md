# DMPilot — Beta Tester Guide

**Live app:** https://dmpilott.vercel.app  
**Support:** Reply to the person who sent you this doc.

---

## What you are testing

DMPilot automates Instagram and Facebook DMs when someone comments on your posts or reels. It also includes a built-in **Link in Bio** page (like Linktree).

---

## Before you start

You need:

- Instagram **Business** or **Creator** account
- That account linked to a **Facebook Page** (Meta requirement)
- A second Instagram account (or a friend) to leave a test comment
- 10–15 minutes

**Use a real sign-up**, not Guest. Guest sessions are temporary and your setup may not save.

---

## Step 1 — Create your account

1. Open https://dmpilott.vercel.app
2. Click **Join beta** or go to **Sign up**
3. Create an account with email + password
4. Confirm email if Supabase sends a confirmation link

---

## Step 2 — Connect Instagram

1. Go to **Dashboard**
2. Open **Accounts** (or connect from the setup banner)
3. Click **Connect Instagram**
4. Log in with Meta and approve permissions
5. You should see your Instagram account listed as connected

If connect fails:

- Make sure you are using a Business/Creator account, not a personal account
- Try again in a private/incognito window
- Tell us the exact error message on screen

---

## Step 3 — Create your first automation

1. Go to **Automations** → **New Automation**
2. Choose **Instagram**
3. Select a **post or reel** you want to test on
4. Set trigger:
   - **Keyword** (e.g. `LINK` or `PRICE`), or
   - **Any comment**
5. Write your **DM message** (you can use `{name}` and `{username}`)
6. Optional: turn on **public comment reply** (e.g. "Check your DMs!")
7. Save and make sure the automation is **Active**

---

## Step 4 — Test it (most important)

1. From a **different** Instagram account, comment on that post/reel  
   - If you used a keyword, include that word in the comment
2. Wait 30–90 seconds
3. Check:
   - Did the test account get a **DM**?
   - Does DMPilot show the send in **activity / analytics**?
   - If you enabled public reply, is there a reply under the comment?

**Report back with:**

- Screenshot of the comment
- Screenshot of the DM (or "no DM received")
- Screenshot of DMPilot dashboard if possible

---

## Step 5 — Link in Bio (optional)

1. Go to **Link in Bio**
2. Set your **slug** (e.g. your username)
3. Add links, theme, profile name
4. Click **Publish**
5. Copy your bio URL and paste it in your Instagram bio
6. Open the link on your phone and confirm it looks right

---

## What works in this beta

| Feature | Status |
|---------|--------|
| Sign up / login | Live |
| Instagram + Facebook connect | Live |
| Comment → DM automation | Live |
| DM auto-reply | Live |
| Link in Bio (links, design, publish, clicks) | Live |
| Analytics | Live |
| Gift offer buttons in DMs | Live |

---

## What is NOT live yet (please do not expect these)

| Feature | Status |
|---------|--------|
| Giveaways | Coming soon |
| AI-written replies | Coming soon |
| Unified inbox | Coming soon |
| Story / mention triggers | Coming soon |

**Note:** Public comment replies on **Instagram** depend on a Meta permission still in review. DMs should work; public IG replies may not work for everyone until Meta approves it.

---

## Quick troubleshooting

| Problem | Try this |
|---------|----------|
| "Invalid API key" on login | Tell us — server config issue |
| Can't connect Instagram | Use Business/Creator + linked Facebook Page |
| Comment but no DM | Check automation is Active, correct post, keyword matches |
| DM works, no public reply | Expected for some IG accounts until Meta approval |
| Link in Bio 404 | Make sure page is **Published** and slug is correct |

---

## Feedback we need from you

Please send:

1. **Did signup + connect work?** (yes/no + error if no)
2. **Did comment → DM work?** (yes/no + how long it took)
3. **Link in Bio** — did you try it? How did it look on mobile?
4. **Anything confusing** in the dashboard?
5. **Would you pay for this?** Rough honest answer.

---

## Short message you can forward (WhatsApp)

```
DMPilot beta test 🚀

1. Sign up: https://dmpilott.vercel.app/signup
2. Connect Instagram (Business/Creator account)
3. Automations → New → pick a reel → keyword "LINK" → save
4. Comment "LINK" from another account → check DM
5. Optional: Link in Bio → publish → add to your bio

Reply with screenshots if something breaks. Thanks!
```

---

*Last updated: July 2026 — branch `arman-cursor`*
