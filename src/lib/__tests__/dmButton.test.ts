import { buildInstagramMessagePayload } from '../instagramDmQueue'

describe('buildInstagramMessagePayload', () => {
  it('sends plain text when no button is configured', () => {
    expect(buildInstagramMessagePayload('Hello there', null)).toEqual({ text: 'Hello there' })
    expect(buildInstagramMessagePayload('Hello there')).toEqual({ text: 'Hello there' })
  })

  it('ignores a half-configured button', () => {
    expect(buildInstagramMessagePayload('Hi', { text: 'Get it', url: '' })).toEqual({ text: 'Hi' })
    expect(buildInstagramMessagePayload('Hi', { text: '', url: 'https://x.com' })).toEqual({ text: 'Hi' })
  })

  it('builds a generic template with a web_url button', () => {
    const payload: any = buildInstagramMessagePayload('Here is your guide', {
      text: 'Get Access',
      url: 'https://example.com/guide',
    })
    const element = payload.attachment.payload.elements[0]
    expect(payload.attachment.type).toBe('template')
    expect(payload.attachment.payload.template_type).toBe('generic')
    expect(element.title).toBe('Here is your guide')
    expect(element.buttons).toEqual([
      { type: 'web_url', url: 'https://example.com/guide', title: 'Get Access' },
    ])
  })

  it('truncates the button label to Instagram’s 20-character limit', () => {
    const payload: any = buildInstagramMessagePayload('Msg', {
      text: 'This label is far too long to fit',
      url: 'https://example.com',
    })
    expect(payload.attachment.payload.elements[0].buttons[0].title).toHaveLength(20)
  })

  it('splits a long message across title and subtitle', () => {
    const long = 'a'.repeat(120)
    const payload: any = buildInstagramMessagePayload(long, { text: 'Go', url: 'https://e.com' })
    const element = payload.attachment.payload.elements[0]
    expect(element.title).toHaveLength(80)
    expect(element.subtitle).toHaveLength(40)
  })
})
