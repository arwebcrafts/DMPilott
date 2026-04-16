const crypto = require('crypto');

// Full body from Vercel logs
const body = '{"entry": [{"id": "17841430541631416", "time": 1776347037, "changes": [{"value": {"from": {"id": "848067418322071", "username": "m_waqarsikandar"}, "media": {"id": "18050310947722369", "media_product_type": "FEED"}, "id": "17870462385492428", "text": "LINK"}, "field": "comments"}]}], "object": "instagram"}';

// Signature from Meta header
const metaSignature = 'sha256=4404997beaaea4dfb2dcfa412626527fe2635f9fb6c55df139e95e1165be2c64';

// Secret from Vercel logs
const secret = '0aafa7c1d96bf4729255b85e2b49fc4d';

const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');

console.log('Body:', body);
console.log('Body length:', body.length);
console.log('');
console.log('Meta signature:', metaSignature);
console.log('Computed:      ', 'sha256=' + expected);
console.log('');
console.log('Match:', metaSignature === 'sha256=' + expected ? 'YES' : 'NO');
