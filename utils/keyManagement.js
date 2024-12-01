const crypto = require('crypto');

// Generate a random key for encryption
const generateKey = () => {
    return crypto.randomBytes(32).toString('hex'); // 256-bit key for AES-256
};

module.exports = { generateKey };
