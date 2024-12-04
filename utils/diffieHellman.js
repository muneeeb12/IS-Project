const crypto = require('crypto');

/**
 * Generate Diffie-Hellman key pair
 * @returns {Object} The Diffie-Hellman private and public keys
 */
const generateKeys = () => {
  const dh = crypto.createDiffieHellman(2048);
  const publicKey = dh.generateKeys();
  
  return {
    privateKey: dh.getPrivateKey(),
    publicKey: publicKey,
  };
};

/**
 * Compute the shared secret using a user's private key and the recipient's public key
 * @param {Buffer} privateKey - The user's private key
 * @param {Buffer} recipientPublicKey - The recipient's public key
 * @returns {Buffer} The shared secret key
 */
const computeSharedSecret = (privateKey, recipientPublicKey) => {
  const dh = crypto.createDiffieHellman(2048);
  dh.setPrivateKey(privateKey);
  
  const sharedSecret = dh.computeSecret(recipientPublicKey);
  
  return sharedSecret;
};

module.exports = { generateKeys, computeSharedSecret };
