const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const groupRoutes = require('./routes/groupRoutes');
const errorHandler = require('./middlewares/errorHandler');

require('dotenv').config();

const app = express();

// Middleware
app.use(express.json()); // To parse incoming JSON data

// Connect to the Database
connectDB();

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/group', groupRoutes);

// Error Handling Middleware (Catch all errors)
app.use(errorHandler);

module.exports = app;
