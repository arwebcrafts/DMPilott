# Meta App Review — `instagram_business_manage_comments`

This permission has been rejected twice (26 May 2026, 8 Jul 2026). Both times the
reason was identical, and it was **not** about the product:

> **Screencast Not Aligned with Use Case Details** — Developer Policy 1.6
>
> "We have determined that your apps' use case is allowed, however, the submitted
> screencast fails to demonstrate the end-to-end experience of the use case
> described in the submission notes."

Read that first line again: **the use case is allowed.** Meta is not saying no to
comment automation. They are saying the video did not show them what they need.

Meta listed exactly four things the video must contain. This file exists so the
next submission contains all four.

---

## What the video must show

| # | Meta's requirement | What that means in practice |
|---|---|---|
| 1 | The complete Meta login flow | The Instagram OAuth screen, on camera, in real time |
| 2 | A user granting app access to the permission | The consent screen listing the permissions, and the tap on **Allow** |
| 3 | The end-to-end experience of the use case | Comment → DM arrives, unbroken |
| 4 | Screen Recording Guide best practices | English UI, captions, explain every button |

**The most likely reason both previous submissions failed is #2.** If the Instagram
account was already connected when recording started, the consent screen never
appears — and that screen is the single most important frame in the whole video.

Before recording: **disconnect Instagram in DMPilot** (Dashboard → Accounts →
Disconnect). The reviewer has to watch the permission being granted from scratch.

---

## Shot-by-shot script

Record in English, at normal speed, with **no cuts and no jump edits**. Roughly
3–5 minutes. Add on-screen captions before each section.

### Part 1 — Sign in (0:00–0:30)
- Caption: *"DMPilot — Instagram comment automation for creators"*
- Open `https://dmpilott.vercel.app`, sign in with the reviewer test account.
- Land on the dashboard. Say aloud what the app does in one sentence.

### Part 2 — Connect Instagram, showing consent (0:30–1:30) ← **critical**
- Caption: *"Connecting an Instagram Business account"*
- Dashboard → **Accounts** → **Connect Instagram**.
- **Let the Instagram login page load fully and stay on screen.** Do not cut.
- On the permission screen, **read the permissions out loud as they appear**,
  including the one covering comment management. Point at them with the cursor.
- Tap **Allow**. Show the redirect back to DMPilot and the account now listed.

If this part is not in the video, the submission is rejected again regardless of
everything else.

### Part 3 — Build the automation (1:30–2:30)
- Caption: *"Creating a keyword automation"*
- Dashboard → **Automations** → **New Automation**.
- Explain each field aloud as you fill it:
  - **Trigger** — "when someone comments on my post"
  - **Keyword** — type `LINK`; say "this is the word the follower comments"
  - **Post** — pick a specific post from the dropdown
  - **Message** — the DM text
  - **Button** — label and URL; say "this becomes a tappable button in the DM"
- Save it. Show the automation listed as **Active**.

### Part 4 — The end-to-end proof (2:30–4:00) ← **the part they scroll to**
- Caption: *"A follower comments the keyword"*
- Switch to a **second device or second Instagram account** — a real follower,
  not the business account. Keep both visible if you can (phone beside screen).
- Open the post. **Type the comment `LINK` on camera.** Post it.
- Switch to that follower's Instagram inbox.
- **Show the DM arriving**, with the button visible. Tap the button. Show it open.

Do not speed this up. Do not cut between the comment and the DM. If there is a
delay, let the recording run through it — a real wait is far more convincing to
a reviewer than an edit.

### Part 5 — Close (4:00–4:30)
- Caption: *"Comment data is used only to detect the keyword and reply to that person"*
- Show Dashboard → **Diagnostics** with the delivery listed.
- State plainly: comments are read only to match the keyword, nothing is stored
  beyond the delivery record, and nothing is shared with third parties.

---

## Submission notes (paste into the App Review form)

> DMPilot is a direct-message automation tool for Instagram creators and small
> businesses.
>
> A creator posts content and invites followers to comment a keyword — for
> example "LINK" — to receive something: a discount code, a guide, or a booking
> page. DMPilot detects that comment and automatically sends that follower a
> direct message containing the requested link.
>
> `instagram_business_manage_comments` is required so that DMPilot can receive
> the comment webhook and read the comment text in order to match the creator's
> configured keyword. It is used only to identify which follower asked for the
> content, and only on posts belonging to accounts the creator has explicitly
> connected.
>
> DMPilot does not store comment content beyond what is needed to deliver the
> reply, does not read comments on accounts it is not connected to, and does not
> share or sell any comment data.
>
> The attached screencast shows the complete flow: signing in, connecting an
> Instagram Business account and granting permissions, creating a keyword
> automation, a follower commenting the keyword from a separate account, and the
> resulting direct message arriving.

---

---

## Prepare the reviewer's test account (do this first)

Meta reviewers log in and try to reproduce the video themselves. On the **free
plan** they will hit an upgrade wall partway through and report that they could
not reproduce it:

| Free plan limit | What the reviewer hits |
|---|---|
| 1 connected account | Cannot connect their own Instagram — "Upgrade to add more" |
| 1 automation | Cannot create the automation shown in the video |
| Per-post targeting off | The post picker in the video is unavailable |

Put the reviewer's account on the Business plan so nothing blocks them. In
Supabase → SQL Editor, replacing the email with the account you give Meta:

```sql
update public.users
set plan = 'business', dms_used_this_month = 0
where email = 'REVIEWER_ACCOUNT_EMAIL_HERE';
```

## Where the video goes

**Upload it inside the App Review submission form** — there is a Screencast
field on the permission request. Do **not** email it; emailed videos are not
attached to the submission and reviewers never see them.

If the file is too large to upload, put it on Google Drive or as an **unlisted
YouTube** video and paste the link in the same field. Set Drive sharing to
"Anyone with the link" — a permission-locked link counts as no video at all and
is rejected without review.

## Credentials to provide

In the same form there is a section for test credentials. Provide:

- **DMPilot login** — email and password of the Business-plan account above
- **Instagram login** — a Business/Creator Instagram account the reviewer can
  connect. Use a dedicated account and change its password once review finishes.
- **A short note**: "Sign in at https://dmpilott.vercel.app/login, go to
  Accounts → Connect Instagram, then Automations → New Automation."

Reviewers do log in. An account they cannot use is the second most common
rejection after the screencast.

## Checklist before you submit

- [ ] Reviewer's DMPilot account set to `business` plan (SQL above)
- [ ] Instagram **disconnected** in DMPilot before recording, so the consent
      screen appears in the video
- [ ] App left **Published** — unpublishing stops webhooks entirely
- [ ] Data deletion URL in App Settings → Basic changed from `facebook.com` to
      `https://dmpilott.vercel.app/data-deletion`
- [ ] Reviewer **test credentials** provided (email + password for a working
      DMPilot account) — reviewers do log in
- [ ] Video is unedited, in English, with captions
- [ ] Video shows the consent screen, the comment being typed, and the DM arriving
- [ ] Submission notes above pasted into the form

## Already confirmed as done

- Business verification — **Verified** (AR WebCrafts LLC)
- Tech Provider access verification — **Verified**
- Webhook callback URL — `https://dmpilott.vercel.app/api/webhooks/meta`
- Webhook fields `comments` and `messages` — **Subscribed**
- Privacy Policy and Terms of Service URLs — live
- App icon, category, contact email — set
