import { isWrongEndpointError } from '../instagramDmQueue'

/**
 * A DM send probes two hosts x two account IDs. Retrying the next combination
 * after an error that may still have delivered the message is what turned one
 * incoming DM into four identical "Thanks for reaching out" replies, so only
 * proven endpoint mismatches may be retried.
 */
describe('isWrongEndpointError', () => {
  const withResponse = (status: number, error: Record<string, unknown>) => ({
    response: { status, data: { error } },
  })

  describe('retries (the endpoint is genuinely wrong)', () => {
    it('treats (#100) unsupported post request as a wrong endpoint', () => {
      expect(
        isWrongEndpointError(
          withResponse(400, { code: 100, message: 'Unsupported post request. Object with ID does not exist' })
        )
      ).toBe(true)
    })

    it('treats GraphMethodException as a wrong endpoint', () => {
      expect(isWrongEndpointError(withResponse(400, { type: 'GraphMethodException', message: 'bad path' }))).toBe(true)
    })

    it('treats 404 as a wrong endpoint', () => {
      expect(isWrongEndpointError(withResponse(404, { message: 'unknown path components' }))).toBe(true)
    })
  })

  describe('does not retry (the message may already be delivered)', () => {
    it('does not retry a client timeout', () => {
      // No `response` at all — Meta may have accepted and delivered the message.
      expect(isWrongEndpointError({ code: 'ECONNABORTED', message: 'timeout of 20000ms exceeded' })).toBe(false)
    })

    it('does not retry a socket hangup', () => {
      expect(isWrongEndpointError({ code: 'ECONNRESET', message: 'socket hang up' })).toBe(false)
    })

    it('does not retry a rate limit', () => {
      expect(
        isWrongEndpointError(withResponse(400, { code: 613, message: 'Calls to this api have exceeded the rate limit' }))
      ).toBe(false)
    })

    it('does not retry a temporary block', () => {
      expect(isWrongEndpointError(withResponse(400, { code: 368, message: 'Temporarily blocked' }))).toBe(false)
    })

    it('does not retry a server error', () => {
      expect(isWrongEndpointError(withResponse(500, { message: 'Internal Server Error' }))).toBe(false)
    })

    it('does not retry a 403 permission error', () => {
      expect(
        isWrongEndpointError(withResponse(403, { code: 10, message: 'This message is sent outside of allowed window' }))
      ).toBe(false)
    })

    it('does not retry an undefined error', () => {
      expect(isWrongEndpointError(undefined)).toBe(false)
    })
  })
})
