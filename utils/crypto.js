const crypto = require('crypto');

// Encrypt data
const encrypt = (data, key) => {
    try {
        // Validate key length
        if (Buffer.from(key, 'hex').length !== 32) {
            throw new Error('Encryption key must be 256 bits (32 bytes) in hexadecimal format.');
        }

        const iv = crypto.randomBytes(16); // Initialization vector
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        // Return IV and encrypted data in the format: iv:encryptedData
        return `${iv.toString('hex')}:${encrypted}`;
    } catch (error) {
        throw new Error(`Encryption failed: ${error.message}`);
    }
};

// Decrypt data
const decrypt = (data, key) => {
    try {
        // Validate key length
        if (Buffer.from(key, 'hex').length !== 32) {
            throw new Error('Decryption key must be 256 bits (32 bytes) in hexadecimal format.');
        }

        const parts = data.split(':');
        if (parts.length !== 2) {
            throw new Error('Invalid encrypted data format. Expected "iv:encryptedData".');
        }

        const [ivHex, encryptedData] = parts;
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        throw new Error(`Decryption failed: ${error.message}`);
    }
};

module.exports = { encrypt, decrypt };
