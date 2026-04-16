const crypto = require('crypto');

// Full body from Vercel logs
const body = '{"entry": [{"id": "17841430541631416", "time": 1776339591, "changes": [{"value": {"from": {"id": "848067418322071", "username": "m_waqarsikandar"}, "media": {"id": "18050310947722369", "media_product_type": "FEED"}, "id": "17867301270523379", "text": "LINK"}, "field": "comments"}]}], "object": "instagram"}';

// Signature from Meta header
const metaSignature = 'sha256=62c39a94ace08b1ff5b2ac296a3630cf77769f4b055afc51ef25d12bffe1a9ab';

// Secret from Vercel
const secret = '0aafa7c1d96bf4729255b85e2b49fc4d';

const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');

console.log('Body:', body);
console.log('');
console.log('Body length:', body.length);
console.log('Body bytes:', Buffer.byteLength(body));
console.log('');
console.log('Meta signature:', metaSignature);
console.log('Computed:      ', 'sha256=' + expected);
console.log('');
console.log('Match:', metaSignature === 'sha256=' + expected ? 'YES' : 'NO');

// Also try with Buffer
const bodyBuffer = Buffer.from(body, 'utf8');
console.log('');
console.log('Body as Buffer:', bodyBuffer.toString('hex').substring(0, 100));
const expectedFromBuffer = crypto.createHmac('sha256', secret).update(bodyBuffer).digest('hex');
console.log('Computed from Buffer:', 'sha256=' + expectedFromBuffer);
console.log('Match from Buffer:', metaSignature === 'sha256=' + expectedFromBuffer ? 'YES' : 'NO');
