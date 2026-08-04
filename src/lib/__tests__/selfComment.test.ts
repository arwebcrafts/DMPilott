import { isSelfAuthoredComment } from '../automations/selfComment'

// Regression: an "any comment" automation matched its own public
// "Check your DMs!" reply and posted another one, repeatedly.
describe('isSelfAuthoredComment', () => {
  const account = {
    webhookAccountId: '17841430541631416',
    accountIds: ['9876543210', '17841430541631416'],
    accountUsername: 'armantesting14',
  }

  it('blocks a comment whose author id is the webhook account id', () => {
    expect(isSelfAuthoredComment({
      ...account,
      commenterId: '17841430541631416',
      commenterUsername: 'armantesting14',
    })).toBe(true)
  })

  it('blocks a comment matching the app-scoped account id', () => {
    expect(isSelfAuthoredComment({ ...account, commenterId: '9876543210' })).toBe(true)
  })

  it('blocks by username when the ids do not line up', () => {
    expect(isSelfAuthoredComment({
      ...account,
      commenterId: '55555',
      commenterUsername: 'ArmanTesting14',
    })).toBe(true)
  })

  it('allows a real follower through', () => {
    expect(isSelfAuthoredComment({
      ...account,
      commenterId: '55555',
      commenterUsername: '_.zaynebbb',
    })).toBe(false)
  })

  it('does not treat missing identifiers as a self comment', () => {
    expect(isSelfAuthoredComment({ ...account, commenterId: null, commenterUsername: null })).toBe(false)
    expect(isSelfAuthoredComment({ commenterId: '55555', commenterUsername: 'someone' })).toBe(false)
  })

  it('ignores empty-string ids rather than matching them together', () => {
    expect(isSelfAuthoredComment({
      commenterId: '',
      commenterUsername: 'someone',
      webhookAccountId: '',
      accountIds: ['', null, undefined],
      accountUsername: 'armantesting14',
    })).toBe(false)
  })
})

// Mirrors rankAutomation in the webhook handler: specific beats general.
function rankAutomation(auto: { media_id?: string | null; trigger_type?: string }): number {
  const targeted = auto.media_id ? 0 : 2
  const specific = auto.trigger_type === 'comment_keyword' ? 0 : 1
  return targeted + specific
}

describe('comment automation priority', () => {
  const order = (list: any[]) => [...list].sort((a, b) => rankAutomation(a) - rankAutomation(b))

  it('checks a keyword automation before a catch-all "any comment" one', () => {
    const [first] = order([
      { name: 'catch-all', media_id: null, trigger_type: 'any_comment' },
      { name: 'keyword', media_id: null, trigger_type: 'comment_keyword' },
    ])
    expect(first.name).toBe('keyword')
  })

  it('checks a post-targeted automation before a whole-account one', () => {
    const [first] = order([
      { name: 'whole-account keyword', media_id: null, trigger_type: 'comment_keyword' },
      { name: 'this post', media_id: '123', trigger_type: 'any_comment' },
    ])
    expect(first.name).toBe('this post')
  })

  it('ranks all four combinations most-specific first', () => {
    expect(order([
      { name: 'account/any', media_id: null, trigger_type: 'any_comment' },
      { name: 'post/any', media_id: '1', trigger_type: 'any_comment' },
      { name: 'account/keyword', media_id: null, trigger_type: 'comment_keyword' },
      { name: 'post/keyword', media_id: '1', trigger_type: 'comment_keyword' },
    ]).map(a => a.name)).toEqual([
      'post/keyword', 'post/any', 'account/keyword', 'account/any',
    ])
  })
})
