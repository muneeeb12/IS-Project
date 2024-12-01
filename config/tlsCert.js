const fs = require('fs');
const path = require('path');

const getTLSCertificates = () => {
  try {
    const certPath = path.resolve(__dirname, '../certs/server.crt');
    const keyPath = path.resolve(__dirname, '../certs/server.key');

    return {
      key: fs.readFileSync(keyPath, 'utf8'),
      cert: fs.readFileSync(certPath, 'utf8'),
    };
  } catch (err) {
    console.error('Error loading TLS certificates:', err.message);
    throw new Error('Failed to load TLS certificates. Ensure the certs folder contains server.key and server.crt.');
  }
};

module.exports = getTLSCertificates;
