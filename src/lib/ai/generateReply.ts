import Anthropic from '@anthropic-ai/sdk'

// Default to the latest, most capable Claude model. Override with AI_REPLY_MODEL
// (e.g. claude-haiku-4-5) if you want faster, cheaper replies at scale.
const DEFAULT_MODEL = 'claude-opus-5'

let cachedClient: Anthropic | null = null

/**
 * True when AI replies can actually run — i.e. a key is configured. The
 * dashboard toggle (`ai_replies_enabled`) turns the feature on per-automation,
 * but without a key every request falls back to the static DM message.
 */
export function isAiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY)
}

function getClient(): Anthropic {
  if (!cachedClient) {
    cachedClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return cachedClient
}

interface GenerateReplyParams {
  /** The automation's DM message — used as the brand voice / instructions. */
  instruction: string
  /** The follower's incoming message or comment text. */
  incomingText: string
  /** The follower's name/handle, for personalisation. */
  senderName?: string | null
  /** What to send if AI is disabled, unconfigured, or errors. */
  fallback: string
}

/**
 * Generates a contextual auto-reply with Claude, grounded in the creator's own
 * DM message as brand instructions. Always returns a sendable string: on any
 * failure — no key, timeout, refusal, empty output — it returns `fallback`, so
 * the DM pipeline never breaks because of the AI layer.
 */
export async function generateAiReply(params: GenerateReplyParams): Promise<string> {
  const { instruction, incomingText, senderName, fallback } = params

  if (!isAiConfigured()) return fallback

  const system = [
    'You are the auto-reply assistant for an Instagram/Facebook creator or business.',
    'Write a short, warm, on-brand direct-message reply to the person who just messaged.',
    'Rules:',
    '- 1 to 3 short sentences, friendly and human. No markdown, no hashtags, no emoji spam (one emoji at most).',
    '- Never invent facts, prices, links, or promises that are not in the brand instructions.',
    '- Do not mention that you are an AI or that this is automated.',
    '- Reply in the same language the person used.',
    '',
    'Brand instructions / the message the creator normally sends:',
    instruction || 'Thank them for reaching out and say the team will follow up.',
  ].join('\n')

  const who = senderName ? `${senderName} said: ` : 'They said: '

  try {
    const response = await getClient().messages.create(
      {
        model: process.env.AI_REPLY_MODEL || DEFAULT_MODEL,
        max_tokens: 300,
        system,
        messages: [{ role: 'user', content: `${who}${incomingText || '(no text)'}` }],
      },
      // Keep the webhook responsive — a slow model must not hold the DM pipeline.
      { timeout: 12000 }
    )

    if (response.stop_reason === 'refusal') {
      console.log('[AI Reply] Model declined; using fallback message')
      return fallback
    }

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map(block => block.text)
      .join('')
      .trim()

    return text || fallback
  } catch (err: any) {
    console.log('[AI Reply] Generation failed, using fallback:', err?.message || err)
    return fallback
  }
}
