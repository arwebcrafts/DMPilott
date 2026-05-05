/**
 * Python Webhook Server for Meta Instagram
 * Alternative implementation using Python + Flask
 * 
 * Usage:
 *   pip install flask requests
 *   python server.py
 * 
 * Or with ngrok for HTTPS:
 *   ngrok http 5000
 */

from flask import Flask, request, jsonify
import hashlib
import hmac
import json
import os
import requests

app = Flask(__name__)

# Configuration
CONFIG = {
    'VERIFY_TOKEN': os.getenv('META_VERIFY_TOKEN', 'your_verify_token_here'),
    'APP_SECRET': os.getenv('META_APP_SECRET', 'your_app_secret_here'),
    'IG_ACCESS_TOKEN': os.getenv('IG_ACCESS_TOKEN', 'your_ig_access_token_here'),
    'IG_BUSINESS_ACCOUNT_ID': os.getenv('IG_BUSINESS_ACCOUNT_ID', 'your_ig_business_account_id'),
}

# Processed comment tracking (in production, use Redis or database)
processed_comments = set()

def verify_signature(raw_body, signature):
    """Verify webhook signature using SHA256"""
    if not signature:
        return False
    
    expected = 'sha256=' + hmac.new(
        CONFIG['APP_SECRET'].encode(),
        raw_body,
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(signature, expected)

def send_welcome_dm(recipient_ig_sid, recipient_username):
    """Send welcome DM to user"""
    welcome_message = f"Hey @{recipient_username}! Thanks for commenting! 🎉\n\nI'm the AI assistant for this account. How can I help you today?"
    
    url = f"https://graph.facebook.com/v25.0/{CONFIG['IG_BUSINESS_ACCOUNT_ID']}/messages"
    
    payload = {
        "recipient": {"id": recipient_ig_sid},
        "message": {"text": welcome_message}
    }
    
    headers = {
        "Authorization": f"Bearer {CONFIG['IG_ACCESS_TOKEN']}",
        "Content-Type": "application/json"
    }
    
    response = requests.post(url, json=payload, headers=headers)
    result = response.json()
    
    if 'error' in result:
        print(f"[DM] Error: {result['error']}")
    else:
        print(f"[DM] ✓ Welcome DM sent! Message ID: {result.get('message_id')}")

def reply_to_comment(comment_id, reply_text):
    """Reply to comment publicly"""
    url = f"https://graph.facebook.com/v25.0/{comment_id}/replies"
    
    payload = {"message": reply_text}
    headers = {
        "Authorization": f"Bearer {CONFIG['IG_ACCESS_TOKEN']}",
        "Content-Type": "application/json"
    }
    
    response = requests.post(url, json=payload, headers=headers)
    result = response.json()
    
    if 'error' in result:
        print(f"[Comment Reply] Error: {result['error']}")
    else:
        print(f"[Comment Reply] ✓ Reply sent! ID: {result.get('id')}")

@app.route('/webhook', methods=['GET'])
def verify():
    """Handle webhook verification requests"""
    mode = request.args.get('hub.mode')
    token = request.args.get('hub.verify_token')
    challenge = request.args.get('hub.challenge')
    
    print(f"[Verification] mode={mode}, token={token}, challenge={challenge}")
    
    if mode == 'subscribe' and token == CONFIG['VERIFY_TOKEN']:
        print("[Verification] ✓ Webhook verified!")
        return challenge, 200
    else:
        print("[Verification] ✗ Verification failed")
        return "Forbidden", 403

@app.route('/webhook', methods=['POST'])
def webhook():
    """Handle webhook event notifications"""
    signature = request.headers.get('X-Hub-Signature-256')
    raw_body = request.get_data()
    
    if not verify_signature(raw_body, signature):
        print("[Security] ✗ Invalid signature!")
        return "Invalid signature", 403
    
    print("[Webhook] ✓ Signature verified")
    
    payload = request.get_json()
    print(f"[Webhook] Payload: {json.dumps(payload, indent=2)}")
    
    # Respond quickly
    return "OK", 200

def process_payload(payload):
    """Process webhook payload (call this asynchronously in production)"""
    if payload.get('object') != 'instagram':
        print(f"[Process] Ignoring: {payload.get('object')}")
        return
    
    for entry in payload.get('entry', []):
        print(f"[Process] Entry ID: {entry.get('id')}")
        
        # Handle comments
        for change in entry.get('changes', []):
            if change.get('field') == 'comments':
                value = change.get('value', {})
                
                comment_id = value.get('id')
                comment_text = value.get('text', '')
                commenter_id = value.get('from', {}).get('id')
                commenter_username = value.get('from', {}).get('username')
                media_id = value.get('media', {}).get('id')
                
                print(f"[Comment] From: @{commenter_username} ({commenter_id})")
                print(f"[Comment] Text: '{comment_text}'")
                
                if comment_id in processed_comments:
                    print(f"[Comment] Already processed, skipping")
                    continue
                
                processed_comments.add(comment_id)
                
                # Send welcome DM
                send_welcome_dm(commenter_id, commenter_username)

@app.route('/', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "running",
        "webhook": "/webhook",
        "timestamp": "now"
    })

def subscribe_to_fields():
    """Subscribe to webhook fields"""
    fields = "comments,messages,mentions,story_insights"
    url = f"https://graph.facebook.com/v25.0/{CONFIG['IG_BUSINESS_ACCOUNT_ID']}/subscribed_apps"
    
    response = requests.post(
        url,
        data={'subscribed_fields': fields},
        headers={'Authorization': f"Bearer {CONFIG['IG_ACCESS_TOKEN']}"}
    )
    
    result = response.json()
    if result.get('success'):
        print(f"[Subscribe] ✓ Subscribed to: {fields}")
    else:
        print(f"[Subscribe] ✗ Failed: {result}")

if __name__ == '__main__':
    print("=" * 50)
    print("  Meta Instagram Webhook Server (Python)")
    print("=" * 50)
    
    subscribe_to_fields()
    
    print(f"\nServer running on http://localhost:5000")
    print("Endpoints:")
    print("  GET  /        - Health check")
    print("  GET  /webhook - Verification")
    print("  POST /webhook - Events")
    print("\n⚠️  Use ngrok for HTTPS: ngrok http 5000")
    print()
    
    app.run(host='0.0.0.0', port=5000, debug=True)
