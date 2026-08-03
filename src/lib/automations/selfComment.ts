/**
 * Guards against the self-reply loop.
 *
 * When an automation posts its public "Check your DMs!" reply, that reply is a
 * comment like any other, so Meta delivers a webhook for it. An "any comment"
 * automation matches its own reply and posts another one — a loop that fills a
 * thread with identical replies seconds apart.
 *
 * Identifiers are compared loosely on purpose: Instagram reports the comment
 * author under different ids depending on the payload (the webhook entry id,
 * the app-scoped id, or the business account id), and the username is the only
 * value guaranteed to be stable across all of them.
 */
export interface SelfCommentCheck {
  commenterId?: string | number | null
  commenterUsername?: string | null
  /** The id from the webhook envelope (entry.id). */
  webhookAccountId?: string | number | null
  /** Identifiers stored on the connected account. */
  accountIds?: Array<string | number | null | undefined>
  accountUsername?: string | null
}

export function isSelfAuthoredComment(check: SelfCommentCheck): boolean {
  const { commenterId, commenterUsername, webhookAccountId, accountIds, accountUsername } = check

  if (commenterId != null && commenterId !== '') {
    const commenter = String(commenterId)
    if (webhookAccountId != null && commenter === String(webhookAccountId)) return true
    const known = (accountIds || [])
      .filter(v => v != null && v !== '')
      .map(v => String(v))
    if (known.includes(commenter)) return true
  }

  if (commenterUsername && accountUsername) {
    if (commenterUsername.trim().toLowerCase() === String(accountUsername).trim().toLowerCase()) {
      return true
    }
  }

  return false
}
