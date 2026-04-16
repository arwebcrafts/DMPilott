const crypto = require('crypto');

// Body from Vercel logs (after signature was computed)
const body = '{"entry": [{"id": "17841430541631416", "time": 1776344773, "changes": [{"value": {"from": {"id": "848067418322071", "username": "m_waqarsikandar"}, "media": {"id": "18050310947722369"}, "text": "LINK", "comment_id": "17841440480551053"}, "field": "comments"}]}]}';

// Signature from Meta that came in the header
const metaSignature = 'sha256=2fabd651d8dccbedf33fe2daf22a75ea7d53dc4f3ddc3f59615163a7efb4b642';

// Secret from Vercel logs
const secret = '0aafa7c1d96bf4729255b85e2b49fc4d';

const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');

console.log('Body:', body);
console.log('');
console.log('Meta signature:', metaSignature);
console.log('Computed:      ', 'sha256=' + expected);
console.log('');
console.log('Match:', metaSignature === 'sha256=' + expected ? 'YES' : 'NO');
