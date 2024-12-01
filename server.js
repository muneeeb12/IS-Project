const https = require('https');
const app = require('./app'); // Your Express app
const getTLSCertificates = require('./config/tlsCert'); // Adjust path as needed

const PORT = process.env.PORT || 5000;

try {
  // Retrieve TLS Certificates
  const { key, cert } = getTLSCertificates();

  // Create HTTPS server
  const server = https.createServer({ key, cert }, app);

  server.listen(PORT, () => {
    console.log(`Secure server running on https://localhost:${PORT}`);
  });
} catch (err) {
  console.error('Failed to start HTTPS server:', err.message);
  process.exit(1); // Exit with failure
}
