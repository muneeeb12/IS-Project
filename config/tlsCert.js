const fs = require('fs');
const path = require('path');

/**
 * Loads the TLS certificates from the specified paths.
 * @returns {Object} An object containing the private key and certificate.
 * @throws {Error} Throws an error if the certificates are not found or cannot be loaded.
 */
const getTLSCertificates = () => {
  try {
    // Resolve the paths for the certificate and key
    const certPath = path.resolve(__dirname, '../certs/server.crt');
    const keyPath = path.resolve(__dirname, '../certs/server.key');

    // Check if the certificate and key files exist
    if (!fs.existsSync(certPath)) {
      throw new Error(`Certificate file not found at: ${certPath}`);
    }
    if (!fs.existsSync(keyPath)) {
      throw new Error(`Key file not found at: ${keyPath}`);
    }

    // Read and return the certificate and key as strings
    return {
      key: fs.readFileSync(keyPath, 'utf8'),
      cert: fs.readFileSync(certPath, 'utf8'),
    };
  } catch (err) {
    // Log and re-throw the error for better debugging
    console.error('Error loading TLS certificates:', err.message);
    throw new Error(`Failed to load TLS certificates. Ensure the certs folder contains server.key and server.crt. ${err.message}`);
  }
};

module.exports = getTLSCertificates;
