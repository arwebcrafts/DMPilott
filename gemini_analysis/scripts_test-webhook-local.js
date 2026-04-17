/**
 * Local Webhook Test Script
 * Run locally to test webhook signature verification without Vercel
 * 
 * Usage: 
 * 1. Start local dev server: npm run dev
 * 2. Run: node scripts/test-webhook-local.js
 */

import crypto from 'crypto'
import axios from 'axios'
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
    const [key, ...valueParts] = line.split('=')
    if (key && valueParts.length) {
      env[key.trim()] = valueParts.join('=').trim().replace(/"/g, '')
    }
  })
  return env
}

const env = loadEnv()
const META_APP_SECRET = env.META_APP_SECRET
const META_APP_ID = env.META_APP_ID
const APP_URL = 'http://localhost:3000'

console.log('=== Local Webhook Test ===\n')
console.log('META_APP_ID:', META_APP_ID || 'NOT SET')
console.log('META_APP_SECRET:', META_APP_SECRET ? `${META_APP_SECRET.substring(0, 4)}...${META_APP_SECRET.slice(-4)} (${META_APP_SECRET.length} chars)` : 'NOT SET')
console.log('APP_URL:', APP_URL)
console.log('')

if (!META_APP_SECRET) {
  console.log('❌ META_APP_SECRET not found in .env.local')
  process.exit(1)
}

// Test payload simulating Instagram webhook event
const testPayload = {
  object: 'instagram',
  entry: [{
    id: '17841430541631416',
    time: Math.floor(Date.now() / 1000),
    changes: [{
      value: {
        from: { id: '848067418322071', username: 'test_user' },
        media: { id: '18050310947722369', media_product_type: 'FEED' },
        text: 'INFO',
        created_time: Math.floor(Date.now() / 1000),
        comment_id: '17841440480551053'
      },
      field: 'comments'
    }]
  }]
}

const payloadString = JSON.stringify(testPayload)

// Compute signature like Meta does
const signature = crypto
  .createHmac('sha256', META_APP_SECRET)
  .update(payloadString)
  .digest('hex')

const signatureHeader = `sha256=${signature}`

console.log('Test Payload:', payloadString.substring(0, 60) + '...')
console.log('Computed Signature:', signatureHeader)
console.log('')

// Send test request to local webhook
const webhookUrl = `${APP_URL}/api/webhooks/meta`

console.log(`Sending test POST to ${webhookUrl}...`)
console.log('')

axios.post(webhookUrl, testPayload, {
  headers: {
    'Content-Type': 'application/json',
    'x-hub-signature-256': signatureHeader
  }
})
.then(response => {
  console.log('✅ Response Status:', response.status)
  console.log('✅ Response Body:', response.data)
  console.log('')
  console.log('SUCCESS: Webhook signature verified correctly!')
})
.catch(error => {
  if (error.response) {
    console.log('❌ Response Status:', error.response.status)
    console.log('❌ Response Body:', error.response.data)
    console.log('')
    console.log('FAILURE: Webhook rejected the signature.')
    console.log('This means META_APP_SECRET in .env.local does NOT match')
    console.log('the App Secret in Meta Developer Portal.')
  } else {
    console.log('❌ Error:', error.message)
    console.log('Make sure your local dev server is running (npm run dev)')
  }
})
