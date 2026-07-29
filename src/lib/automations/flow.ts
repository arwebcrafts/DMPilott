// Multi-step DM flows.
//
// An automation can send a *sequence* of messages instead of a single reply.
// `flow_steps` is stored as JSON on the automation; when it is empty/absent the
// automation keeps its original single-message behaviour, so nothing breaks.
// v1 executes steps inline in order (no time delays / branching yet).

export interface FlowStep {
  text: string
}

// A small cap keeps sends well under Meta's per-hour limits and avoids the
// "spammy wall of DMs" failure mode.
export const MAX_FLOW_STEPS = 3

/**
 * Normalises arbitrary input into a clean, bounded list of flow steps.
 * Returns [] when there is no valid multi-step flow.
 */
export function parseFlowSteps(raw: unknown): FlowStep[] {
  if (!Array.isArray(raw)) return []
  const steps: FlowStep[] = []
  for (const item of raw) {
    const text = typeof item === 'string' ? item : (item && typeof item.text === 'string' ? item.text : '')
    const trimmed = text.trim()
    if (trimmed) steps.push({ text: trimmed.slice(0, 1000) })
    if (steps.length >= MAX_FLOW_STEPS) break
  }
  return steps
}

export function personalizeText(
  text: string,
  name?: string | null,
  username?: string | null
): string {
  return (text || '')
    .replace(/{name}/g, name || 'there')
    .replace(/{username}/g, username ? `@${username.replace(/^@/, '')}` : 'user')
}

/**
 * Resolves the ordered list of messages an automation should send, personalised.
 * A configured flow wins; otherwise it falls back to the single dm_message.
 */
export function getAutomationMessages(
  automation: { dm_message?: string | null; flow_steps?: unknown },
  name?: string | null,
  username?: string | null
): string[] {
  const steps = parseFlowSteps(automation.flow_steps)
  const texts = steps.length > 0
    ? steps.map(s => s.text)
    : [automation.dm_message || "Thanks for reaching out! We'll get back to you soon. 👋"]
  return texts.map(t => personalizeText(t, name, username))
}
