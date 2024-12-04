const ChatMessage = require('../models/Chat'); // Assuming the model is named ChatMessage
const crypto = require('crypto');
require('dotenv').config(); // Load environment variables

// Helper function to encrypt a message
function encryptMessage(message, secretKey) {
  const iv = crypto.randomBytes(16); // Generate a random IV
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secretKey, 'hex'), iv);

  let encrypted = cipher.update(message, 'utf-8', 'hex');
  encrypted += cipher.final('hex');

  return {
    encryptedMessage: encrypted,
    iv: iv.toString('hex'), // Convert the IV to a hex string for storage
  };
}

// Helper function to decrypt a message
function decryptMessage(encryptedMessage, iv, secretKey) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(secretKey, 'hex'), Buffer.from(iv, 'hex'));

  let decrypted = decipher.update(encryptedMessage, 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');

  return decrypted;
}

// Send a message
exports.sendMessage = async (req, res) => {
  const {  recipientId, content } = req.body;
  const senderId = req.user.id;
  try {
    const secretKey = process.env.SECRET_KEY; // Ensure this is a 256-bit key in hex format
    if (!secretKey) {
      return res.status(500).json({ error: 'Encryption key not configured.' });
    }

    // Encrypt the message content
    const { encryptedMessage, iv } = encryptMessage(content, secretKey);

    // Create and save the chat message
    const newMessage = new ChatMessage({
      sender: senderId,
      recipient: recipientId,
      content: encryptedMessage,
      iv, // Save the IV
    });

    await newMessage.save();

    res.status(201).json({ message: 'Message sent successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: `Failed to send message: ${err.message}` });
  }
};

// Retrieve chat messages between two users
exports.getMessages = async (req, res) => {
  const { recipient } = req.params;
  const senderId = req.user.id;
  console.log(senderId)
  try {
    const secretKey = process.env.SECRET_KEY; // Ensure this is a 256-bit key in hex format
    if (!secretKey) {
      return res.status(500).json({ error: 'Encryption key not configured.' });
    }

    // Fetch messages between the sender and recipient
    const messages = await ChatMessage.find({
      $or: [
        { sender: senderId, recipient: recipient },
        { sender: recipient, recipient: senderId },
      ],
    }).sort({ sentAt: 1 }); // Sort messages by time

    // Decrypt the message content
    const decryptedMessages = messages.map((msg) => ({
      sender: msg.sender,
      recipient: msg.recipient,
      content: decryptMessage(msg.content, msg.iv, secretKey),
      sentAt: msg.sentAt,
    }));

    res.status(200).json(decryptedMessages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: `Failed to retrieve messages: ${err.message}` });
  }
};
