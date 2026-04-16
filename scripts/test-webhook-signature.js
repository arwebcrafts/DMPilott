/**
 * Webhook Signature Test Script
 * Run: node scripts/test-webhook-signature.js
 */

import crypto from 'crypto'
import fs from 'fs'

// Load env from .env.local
function loadEnv() {
  const envPath = '.env.local'
  if (!fs.existsSync(envPath)) {
    console.log('No .env.local found')
    return {}
  }
  const envContent = fs.readFileSync(envPath, 'utf-8')
  const env = {}
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=').map(s => s.trim())
    if (key && value) env[key] = value
  })
  return env
}

const env = loadEnv()
const META_APP_SECRET = env.META_APP_SECRET || process.env.META_APP_SECRET
const META_APP_ID = env.META_APP_ID || process.env.META_APP_ID

console.log('=== Webhook Signature Test ===\n')
console.log('META_APP_ID:', META_APP_ID || 'NOT SET')
console.log('META_APP_SECRET:', META_APP_SECRET ? `${META_APP_SECRET.substring(0, 4)}...${META_APP_SECRET.slice(-4)} (${META_APP_SECRET.length} chars)` : 'NOT SET')
console.log('')

// Sample webhook body from logs
const sampleBody = '{"entry": [{"id": "17841430541631416", "time": 1776340786, "changes": [{"value": {"from": {"id": "848067418322071", "username": "m_waqarsikandar"}, "media": {"id": "18050310947722369", "media_product_type": "FEED"}, "text": "INFO", "created_time": 1776340786, "comment_id": "17841440480551053"}, "field": "comments"}]}],"object": "instagram"}'

// Sample signature from logs
const sampleSignature = 'sha256=cef782fd03212fc56446d00b804d4af08287aaae1f60fd4dc10eda203cc99f2f'

// Use local .env.local secret directly (strip quotes)
const testSecret = META_APP_SECRET?.replace(/"/g, '') || ''

if (!testSecret) {
  console.log('META_APP_SECRET not found in .env.local')
  process.exit(1)
}

const expected = crypto
  .createHmac('sha256', testSecret)
  .update(sampleBody)
  .digest('hex')
const expectedWithPrefix = `sha256=${expected}`

console.log('Signature from Meta: ', sampleSignature)
console.log('Expected signature:   ', expectedWithPrefix)
console.log('')
console.log('Match:', expectedWithPrefix === sampleSignature ? 'YES - Secret is CORRECT!' : 'NO - Secret is wrong')
