import { parseFlowSteps, getAutomationMessages, personalizeText, MAX_FLOW_STEPS } from '../flow'

describe('parseFlowSteps', () => {
  it('accepts {text} objects and trims/caps them', () => {
    expect(parseFlowSteps([{ text: ' hi ' }, { text: 'there' }])).toEqual([
      { text: 'hi' },
      { text: 'there' },
    ])
  })

  it('accepts bare strings', () => {
    expect(parseFlowSteps(['one', 'two'])).toEqual([{ text: 'one' }, { text: 'two' }])
  })

  it('drops empty steps', () => {
    expect(parseFlowSteps([{ text: '' }, { text: '  ' }, { text: 'keep' }])).toEqual([{ text: 'keep' }])
  })

  it('caps the number of steps', () => {
    const many = Array.from({ length: 10 }, (_, i) => ({ text: `m${i}` }))
    expect(parseFlowSteps(many)).toHaveLength(MAX_FLOW_STEPS)
  })

  it('returns [] for non-arrays', () => {
    expect(parseFlowSteps(null)).toEqual([])
    expect(parseFlowSteps('nope')).toEqual([])
    expect(parseFlowSteps(undefined)).toEqual([])
  })
})

describe('personalizeText', () => {
  it('substitutes name and username', () => {
    expect(personalizeText('Hi {name} ({username})', 'Sam', 'sam_ig')).toBe('Hi Sam (@sam_ig)')
  })
  it('falls back when values are missing', () => {
    expect(personalizeText('Hi {name} {username}')).toBe('Hi there user')
  })
})

describe('getAutomationMessages', () => {
  it('uses the flow steps when present, personalized', () => {
    const auto = { dm_message: 'ignored', flow_steps: [{ text: 'Hi {name}' }, { text: 'Step 2' }] }
    expect(getAutomationMessages(auto, 'Sam', 'sam')).toEqual(['Hi Sam', 'Step 2'])
  })

  it('falls back to the single dm_message when there is no flow', () => {
    expect(getAutomationMessages({ dm_message: 'Hello {name}', flow_steps: null }, 'Sam')).toEqual(['Hello Sam'])
  })

  it('never returns an empty list', () => {
    expect(getAutomationMessages({ dm_message: '', flow_steps: [] }).length).toBe(1)
  })
})
