module.exports = {
    jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret',
    saltRounds: parseInt(process.env.SALT_ROUNDS) || 10,
  };
  