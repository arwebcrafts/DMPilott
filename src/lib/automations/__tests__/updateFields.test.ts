import { mapUpdatableFields } from '../updateFields'

describe('mapUpdatableFields', () => {
  it('maps camelCase accountId to the account_id column', () => {
    // Regression: sending `accountId` straight through made PostgREST reject
    // the update with "Could not find the 'accountId' column of 'automations'
    // in the schema cache".
    const updates = mapUpdatableFields({ accountId: 'acc-1' })

    expect(updates).toEqual({ account_id: 'acc-1' })
    expect(updates).not.toHaveProperty('accountId')
  })

  it('never emits a key that is not a real column', () => {
    const updates = mapUpdatableFields({
      accountId: 'acc-1',
      triggerType: 'comment_keyword',
      dmMessage: 'hey',
      commentReplyEnabled: true,
      commentReplyText: 'Check your DMs!',
      // Junk a client might send — must be dropped entirely.
      id: 'should-be-ignored',
      connected_accounts: { username: 'someone' },
      totally_made_up: true,
    })

    const allowedColumns = [
      'account_id',
      'name',
      'platform',
      'trigger_type',
      'keywords',
      'dm_message',
      'comment_reply_enabled',
      'comment_reply_text',
      'send_delay_seconds',
      'is_active',
      'follow_facebook_url',
      'follow_instagram_url',
    ]

    for (const key of Object.keys(updates)) {
      expect(allowedColumns).toContain(key)
    }
    expect(updates).not.toHaveProperty('id')
    expect(updates).not.toHaveProperty('connected_accounts')
    expect(updates).not.toHaveProperty('totally_made_up')
  })

  it('accepts snake_case spellings too', () => {
    expect(mapUpdatableFields({ account_id: 'acc-2', dm_message: 'hi' })).toEqual({
      account_id: 'acc-2',
      dm_message: 'hi',
    })
  })

  it('prefers camelCase when both spellings are present', () => {
    expect(mapUpdatableFields({ accountId: 'camel', account_id: 'snake' })).toEqual({
      account_id: 'camel',
    })
  })

  it('omits fields the client did not send, so a partial update stays partial', () => {
    const updates = mapUpdatableFields({ dmMessage: 'only this' })

    expect(updates).toEqual({ dm_message: 'only this' })
    expect(updates).not.toHaveProperty('keywords')
    expect(updates).not.toHaveProperty('account_id')
  })

  it('turns empty follow URLs into null so they can be cleared', () => {
    expect(mapUpdatableFields({ followFacebookUrl: '', followInstagramUrl: '' })).toEqual({
      follow_facebook_url: null,
      follow_instagram_url: null,
    })
  })

  it('keeps falsy-but-meaningful values', () => {
    expect(mapUpdatableFields({ isActive: false, sendDelaySeconds: 0 })).toEqual({
      is_active: false,
      send_delay_seconds: 0,
    })
  })

  it('returns nothing for an empty body', () => {
    expect(mapUpdatableFields({})).toEqual({})
  })

  it('maps a specific post target', () => {
    expect(mapUpdatableFields({ mediaId: '178_9', mediaCaption: 'My reel' })).toEqual({
      media_id: '178_9',
      media_caption: 'My reel',
    })
  })

  it('clears the post target (whole account) when media_id is empty', () => {
    expect(mapUpdatableFields({ mediaId: '' })).toEqual({ media_id: null })
  })
})
