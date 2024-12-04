const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const crypto = require('crypto'); // For Diffie-Hellman key generation
require('dotenv').config();

const otpStorage = {}; // Temporary in-memory OTP storage with expiry

// Send OTP and register user
exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
    const otpExpiry = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes
    otpStorage[email] = { otp, expiry: otpExpiry };

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP for Registration',
      text: `Your OTP for registration is ${otp}. It will expire in 10 minutes.`,
    });

    res.status(200).json({ message: 'OTP sent to your email.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Verify OTP and complete registration
exports.verifyOTP = async (req, res) => {
  const { username, email, password, otp } = req.body;

  try {
    // Check if OTP is valid
    const storedOtpData = otpStorage[email];
    if (!storedOtpData) {
      return res.status(400).json({ error: 'OTP expired or not requested.' });
    }

    const { otp: storedOtp, expiry } = storedOtpData;
    if (Date.now() > expiry) {
      delete otpStorage[email]; // Clear expired OTP
      return res.status(400).json({ error: 'OTP has expired.' });
    }

    if (parseInt(otp) !== storedOtp) {
      return res.status(400).json({ error: 'Invalid OTP.' });
    }

    // Clear OTP from storage
    delete otpStorage[email];

    // Generate a Diffie-Hellman key pair
    const dh = crypto.createDiffieHellman(2048);
    const publicKey = dh.generateKeys('base64'); // Store as base64
    const privateKey = dh.getPrivateKey('base64'); // Optional: can store securely

    // Create and save the user
    const newUser = new User({
      username,
      email,
      password, // Assume hashing in pre-save middleware
      publicKey, // Save DH public key to database
    });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully. Please log in.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Login user
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Compare plaintext password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Generate a JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Respond with token, user details, and public key
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        publicKey: user.publicKey, // Include user's public key in response
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
