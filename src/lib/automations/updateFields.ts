export const VALID_TRIGGER_TYPES = [
  'any_comment',
  'comment_keyword',
  'dm_received',
  'story_mention',
  'story_reply',
] as const

export const VALID_PLATFORMS = ['instagram', 'facebook'] as const

/**
 * Maps an incoming request body to the exact `automations` columns clients are
 * allowed to write. Both camelCase (used by the dashboard) and snake_case
 * (used by older callers) spellings are accepted.
 *
 * Everything is funnelled through this allowlist on purpose. Handing a raw body
 * to PostgREST makes it reject the whole request with
 * "Could not find the '<key>' column of 'automations' in the schema cache"
 * as soon as the client sends a key that is not a real column — which is
 * exactly what a camelCase `accountId` does.
 */
export function mapUpdatableFields(body: Record<string, unknown>): Record<string, unknown> {
  const updates: Record<string, unknown> = {}

  const assign = (column: string, ...aliases: string[]) => {
    for (const alias of aliases) {
      if (body[alias] !== undefined) {
        updates[column] = body[alias]
        return
      }
    }
  }

  assign('account_id', 'accountId', 'account_id')
  assign('name', 'name')
  assign('platform', 'platform')
  assign('trigger_type', 'triggerType', 'trigger_type')
  assign('keywords', 'keywords')
  assign('dm_message', 'dmMessage', 'dm_message')
  assign('comment_reply_enabled', 'commentReplyEnabled', 'comment_reply_enabled')
  assign('comment_reply_text', 'commentReplyText', 'comment_reply_text')
  assign('send_delay_seconds', 'sendDelaySeconds', 'send_delay_seconds')
  assign('is_active', 'isActive', 'is_active')

  // Nullable URL columns: an empty string means "clear it".
  const nullableUrls: Array<[string, string, string]> = [
    ['follow_facebook_url', 'followFacebookUrl', 'follow_facebook_url'],
    ['follow_instagram_url', 'followInstagramUrl', 'follow_instagram_url'],
  ]
  for (const [column, ...aliases] of nullableUrls) {
    for (const alias of aliases) {
      if (body[alias] !== undefined) {
        updates[column] = body[alias] || null
        break
      }
    }
  }

  return updates
}
