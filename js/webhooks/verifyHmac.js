const crypto = require('crypto');

function verifyUpvestWebhookHmac(requestHeaders, rawRequestBody, hmacSecretKey) {
  const signatureHeader = requestHeaders['X-UP-Signature'];
  if (!signatureHeader) {
    return false;
  }
  const hmac = crypto.createHmac('sha256', hmacSecretKey).update(rawRequestBody, 'utf8').digest('hex');
  return signatureHeader == `sha256=${hmac}`;
}

module.exports = { verifyUpvestWebhookHmac };
