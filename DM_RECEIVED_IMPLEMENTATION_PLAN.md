# Implementation Plan: `dm_received` Auto-Reply Automation

## Goal
Allow users to create an automation with trigger type **`dm_received`** so that when someone sends a DM to a connected Instagram account, the app automatically replies with a configured message.

---

## Current State Analysis

### What already works (backend) ✅
The backend is **already fully implemented** for `dm_received`:

1. **API validation** — `src/app/api/automations/route.ts:67`
   ```ts
   const validTriggerTypes = ['any_comment', 'comment_keyword', 'dm_received', 'story_mention']
   ```
   `dm_received` is already accepted.

2. **Webhook handler** — `src/app/api/webhooks/meta/route.ts:199-256` (`handleInstagramMessage`)
   - Receives Instagram `messaging` events
   - Skips echo / self messages
   - Resolves the account via `findIgAccount` (now dual-ID aware)
   - Queries automations with `trigger_type = 'dm_received'`
   - Sends an auto-reply via `sendInstagramDm`

### What is missing ❌
1. **UI option** — `src/app/dashboard/automations/page.tsx:376-379`
   The trigger-type selector only offers:
   - `comment_keyword` (Keyword)
   - `story_reply` (Story Reply)  ← note: not even a valid backend type
   - `any_comment` (Any Comment)

   There is **no `dm_received` option**, so users cannot create one from the UI.

2. **Form logic** — The modal hardcodes comment-centric behavior:
   - Keyword section only shows for `comment_keyword`
   - "Auto-reply on comment" section is irrelevant for DMs
   - Submit button label / validation are comment-oriented

3. **DB CHECK constraint (verify)** — `supabase/migrations/001_initial_schema.sql:70`
   ```sql
   trigger_type text not null check (trigger_type in ('comment_keyword', 'story_reply', 'any_comment'))
   ```
   The original schema constraint does **NOT** include `dm_received`. If this constraint is still active in the live DB, inserts with `dm_received` will FAIL at the database level even though the API allows it. **This must be fixed first.**

---

## Implementation Steps

### Step 1 — Fix the database CHECK constraint (REQUIRED FIRST)

Create migration `supabase/migrations/004_add_dm_received_trigger.sql`:

```sql
-- Allow dm_received (and story_mention) trigger types on automations
alter table public.automations
  drop constraint if exists automations_trigger_type_check;

alter table public.automations
  add constraint automations_trigger_type_check
  check (trigger_type in ('comment_keyword', 'story_reply', 'any_comment', 'dm_received', 'story_mention'));
```

Run this in the Supabase SQL editor before deploying UI changes.

**Verification:**
```sql
-- Should succeed after migration
insert into automations (user_id, account_id, platform, trigger_type, dm_message)
values ('<user_uuid>', '<account_uuid>', 'instagram', 'dm_received', 'test')
returning id;
-- then delete the test row
```

---

### Step 2 — Add `dm_received` to the UI trigger selector

File: `src/app/dashboard/automations/page.tsx` (~line 376)

Add the new option to the trigger-type grid:
```tsx
{[
  { value: 'comment_keyword', label: 'Keyword', icon: '💬' },
  { value: 'any_comment', label: 'Any Comment', icon: '✉️' },
  { value: 'dm_received', label: 'DM Reply', icon: '📩' },
].map(opt => ( ... ))}
```

Notes:
- Consider removing `story_reply` since it is not a valid backend trigger type (the API would reject it with "Invalid trigger type").
- The grid is `grid-cols-3`; three options keeps the layout clean.

---

### Step 3 — Adjust form behavior for `dm_received`

File: `src/app/dashboard/automations/page.tsx` (`CreateAutomationModal`)

1. **Keywords section** (~line 399): already gated by `triggerType === 'comment_keyword'`. No keywords needed for DMs — leave as is (it stays hidden).

2. **Auto-reply on comment section** (~line 465): hide it for `dm_received` since it is about replying to comments, not DMs:
   ```tsx
   {triggerType !== 'dm_received' && (
     <div> ...auto-reply on comment block... </div>
   )}
   ```

3. **DM Message label/help text** (~line 429): optionally clarify copy when `dm_received` is selected, e.g. "This message is sent automatically whenever someone DMs this account."

4. **Automation name** (~line 290): the generated name uses `keywords[0]`. For `dm_received` there are no keywords, so it becomes "dm received - auto". That's fine; optionally special-case it:
   ```ts
   name: triggerType === 'dm_received'
     ? 'DM auto-reply'
     : `${triggerType.replace('_', ' ')} - ${keywords[0] || 'auto'}`,
   ```

5. **Submit validation** (~line 273, 515): current guard `triggerType === 'comment_keyword' && keywords.length === 0` already permits `dm_received` with no keywords. Confirm the disabled condition on the submit button also only requires `dmMessage`. No change needed beyond what's there.

---

### Step 4 — Confirm webhook delivery prerequisites

For `dm_received` to fire, Instagram must deliver `messages` webhook events. From the logs this **already works** (DM/messaging events arrive and reach `handleInstagramMessage`).

Requirements (already satisfied per logs):
- OAuth scope includes `instagram_business_manage_messages` ✅
- Webhook subscription includes the `messages` field ✅
- The DM must come from a real user (not an echo of the account's own message) ✅ (handler skips `is_echo`)

**Important Meta limitation:** While the app is not fully approved/live, message webhooks are typically only delivered for conversations with users who have a **role on the app** (testers/admins) or who initiated contact. Public users may not trigger until the app is approved. This mirrors the comment-permission limitation.

---

### Step 5 — (Optional) De-duplicate / rate-limit DM auto-replies

Currently `handleInstagramMessage` sends the reply immediately and does **not**:
- Log to `dm_logs`
- Apply the 200/hour rate limit (unlike the comment flow which queues via `processQueuedInstagramDmsForAccount`)
- Guard against replying to every message in a thread (could spam if a user sends many messages)

Recommended enhancement (optional, can be a follow-up):
- Insert a `dm_logs` row with `status: 'queued'` and route through `processQueuedInstagramDmsForAccount` for consistent rate limiting and reporting, OR
- Add a simple per-sender cooldown (e.g., only auto-reply once per sender per N minutes) using an in-memory Set or a `dm_logs` lookup.

This is not required for basic functionality but prevents abuse and keeps analytics accurate.

---

## Files to Change

| File | Change | Required |
|------|--------|----------|
| `supabase/migrations/004_add_dm_received_trigger.sql` | New migration to allow `dm_received` in CHECK constraint | **Yes** |
| `src/app/dashboard/automations/page.tsx` | Add `dm_received` trigger option; hide comment-only sections; tweak name/copy | **Yes** |
| `src/app/api/automations/route.ts` | None (already supports `dm_received`) | No |
| `src/app/api/webhooks/meta/route.ts` | None for basic flow; optional rate-limit/logging in Step 5 | Optional |

---

## Testing Plan

1. **DB constraint:** Run migration 004, then attempt an insert with `trigger_type = 'dm_received'` (should succeed).
2. **UI creation:** In the dashboard, create a new automation, select **DM Reply**, enter a DM message, and save. Confirm it appears in the list with trigger tag "dm received".
3. **End-to-end (with a tester account):**
   - From an Instagram account that has a role on the app, send a DM to the connected business account.
   - Watch logs for:
     ```
     [Message] is_echo: false
     [Account] Found account: <username>
     [Message] Found auto-reply automation: <name>
     ```
   - Confirm the auto-reply DM is received.
4. **Echo safety:** Confirm the account's own outgoing DM (is_echo: true) does NOT trigger a loop.
5. **Toggle off:** Disable the automation and confirm DMs no longer get a reply.

---

## Rollback

- UI: revert the `page.tsx` changes.
- DB: the CHECK constraint change is additive (only widens allowed values); no rollback needed. If required:
  ```sql
  alter table public.automations drop constraint if exists automations_trigger_type_check;
  alter table public.automations add constraint automations_trigger_type_check
    check (trigger_type in ('comment_keyword', 'story_reply', 'any_comment'));
  ```

---

## Summary

The **only mandatory work** is:
1. **Migration 004** to allow `dm_received` in the DB CHECK constraint (otherwise inserts fail).
2. **Add the `dm_received` option to the UI** and hide comment-only form sections.

The webhook handler and API already support `dm_received` fully. Optional hardening (rate limiting + logging for DM replies) is recommended as a follow-up.
