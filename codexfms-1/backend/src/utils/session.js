const crypto = require('crypto');

function generateSessionId() {
  return crypto.randomBytes(48).toString('hex');
}

module.exports = {
  generateSessionId
};
