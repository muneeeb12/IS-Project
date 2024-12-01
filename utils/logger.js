const winston = require('winston');

// Create a custom logger
const logger = winston.createLogger({
    level: 'info',
    transports: [
        new winston.transports.Console({ format: winston.format.simple() }),
        new winston.transports.File({ filename: 'logs/app.log', level: 'info' })
    ],
});

module.exports = logger;
