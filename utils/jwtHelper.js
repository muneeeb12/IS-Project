const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

// Generate JWT
const generateToken = (userId) => {
    const payload = { userId };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
};

// Verify JWT
const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return null;
    }
};

module.exports = { generateToken, verifyToken };
