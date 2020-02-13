const crypto = require('crypto');

function isUpvestHmacHeaderName(headerName) {
  headerName = headerName
    .toLowerCase()
    .replace(/[^a-z]+/g, '-') // Neutralize all non-alphabetical characters
    .replace(/^http-/g, '') // Some environments *might* have an "HTTP_" prefix
    .replace(/(^-*|-*$)/g, '') // Remove leading and trailing dashes
  ;
  return headerName == 'x-up-signature';
}

function extractUpvestHmacHeader(requestHeaders) {
  for (const [name, value] of Object.entries(requestHeaders)) {
    if (isUpvestHmacHeaderName(name)) {
      return value;
    }
  }
  throw new Error('No Upvest HMAC header "X-UP-Signature".');
}

function verifyUpvestWebhookHmac(requestHeaders, rawRequestBody, hmacSecretKey) {
  const signatureHeader = extractUpvestHmacHeader(requestHeaders);
  const hmac = crypto.createHmac('sha256', hmacSecretKey).update(rawRequestBody, 'utf8').digest('hex');
  return signatureHeader == `sha256=${hmac}`;
}

module.exports = { verifyUpvestWebhookHmac };
