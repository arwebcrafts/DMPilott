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
