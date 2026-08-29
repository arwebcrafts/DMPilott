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
## THE THING THAT KEEPS FAILING — read this first

Rejected three times, same reason each time. It is not the product. It is one
missing screen in the video.

**There are two different logins. Meta only wants one of them.**

| Login | What it looks like | Meta wants it? |
|---|---|---|
| DMPilot login | Email + password on dmpilott.vercel.app | No |
| **Instagram login** | The **Instagram** page listing permissions, with an **Allow** button | **Yes** |

When the rejection says *"the complete Meta login flow"* and *"a user granting
app access to the permission"*, it means the Instagram permission screen — the
one that appears after clicking **Connect Instagram**, that lists what the app
may access, with **Allow** at the bottom.

That screen only appears when the Instagram account is **not already connected**.
If it was connected before recording started, the screen never appeared and the
reviewer never saw permission being granted.

**So before you press record: Dashboard → Accounts → Disconnect Instagram.**

Do that one thing and the most likely cause of all three rejections is gone.

### Voice is not enough

The rejection asks for "captions and tool-tips". Narrating with your voice is
good, but Meta asks in writing for **text on the screen** as well. Reviewers
often watch muted. Put a short line of text on screen at the start of each
section — the six captions are written into the script below.

---

## What the video must show

| # | Meta's requirement | What that means in practice |
|---|---|---|
| 1 | The complete Meta login flow | The Instagram permission screen, on camera, in real time |
| 2 | A user granting app access to the permission | That screen's permission list, and the tap on **Allow** |
| 3 | The end-to-end experience of the use case | Comment → DM arrives, unbroken |
| 4 | Screen Recording Guide best practices | English UI, on-screen captions, explain every button |

---

## Shot-by-shot script

Record in English, at normal speed, with **no cuts and no jump edits**. Roughly
3–5 minutes. Add on-screen captions before each section.

### Part 1 — Sign in (0:00–0:30)
- Caption: *"DMPilot — Instagram comment automation for creators"*
- Open `https://dmpilott.vercel.app`, sign in with the reviewer test account.
- Land on the dashboard. Say aloud what the app does in one sentence.

### Part 2 — Connect Instagram, showing consent (0:30–1:30) ← **THE PART THAT KEEPS FAILING**
- Caption: *"Connecting an Instagram Business account"*
- Start on the Accounts page with **no Instagram connected**.
- Click **Connect Instagram**.
- The browser goes to **instagram.com**. Stop moving. Let that page sit on
  screen for a few seconds so it is unmistakably in the recording.
- The permission list appears — basic info, messages, **comments**. Move the
  cursor down the list and read each one aloud.
- Click **Allow**.
- Show the return to DMPilot and the account now appearing in the list.

Nothing else in the video matters if this is missing. This screen is what the
reviewer is looking for, and it is the reason for all three rejections.

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

## Checklist before you submit

- [ ] Instagram Tester invite for `armantesting14` **accepted** (Instagram app →
      Settings → Apps and Websites → Tester Invites)
- [ ] Instagram **disconnected** in DMPilot before recording, so the consent
      screen appears in the video
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
