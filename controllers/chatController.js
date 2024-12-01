const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const Chat = require('../models/Chat');

// Load RSA keys
let publicKey, privateKey;

try {
  publicKey = fs.readFileSync(path.join(__dirname, '../certs/server.crt'), 'utf8');
  privateKey = fs.readFileSync(path.join(__dirname, '../certs/server.key'), 'utf8');
} catch (err) {
  console.error('Error loading RSA keys:', err.message);
  process.exit(1); // Exit if keys are missing or unreadable
}

/**
 * Send a message
 */
exports.sendMessage = async (req, res) => {
  const { recipient, content } = req.body;
  const sender = req.user.id;

  if (!content || !recipient) {
    return res.status(400).json({ error: 'Recipient and content are required' });
  }

  try {
    // Encrypt content using RSA with OAEP padding
    const encryptedContent = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256', // Ensure consistent hash algorithm
      },
      Buffer.from(content) // Convert message to Buffer for encryption
    ).toString('base64'); // Encode as Base64 for safe storage/transmission

    // Create and save the message
    const newMessage = new Chat({
      sender,
      recipient,
      content: encryptedContent,
    });

    await newMessage.save();

    res.status(201).json({
      message: 'Message sent successfully',
      messageId: newMessage._id,
    });
  } catch (err) {
    console.error('Error while sending message:', err.message);
    res.status(500).json({ error: `Failed to send message: ${err.message}` });
  }
};

/**
 * Get messages
 */
exports.getMessages = async (req, res) => {
  const { recipient } = req.params;

  if (!recipient) {
    return res.status(400).json({ error: 'Recipient is required' });
  }

  try {
    // Retrieve messages between the sender and recipient
    const messages = await Chat.find({
      $or: [
        { sender: req.user.id, recipient },
        { sender: recipient, recipient: req.user.id },
      ],
    }).sort({ createdAt: 1 });

    // Decrypt each message content
    const decryptedMessages = messages.map((msg) => {
      try {
        const decryptedContent = crypto.privateDecrypt(
          {
            key: privateKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256', // Ensure consistent hash algorithm
          },
          Buffer.from(msg.content, 'base64') // Decode Base64 back to Buffer
        ).toString('utf8'); // Convert decrypted Buffer to string

        return {
          ...msg.toObject(),
          content: decryptedContent,
        };
      } catch (decryptionError) {
        console.error(`Decryption failed for message ${msg._id}:`, decryptionError.message);
        return {
          ...msg.toObject(),
          content: '[Decryption failed]', // Indicate decryption issue
        };
      }
    });

    res.status(200).json(decryptedMessages);
  } catch (err) {
    console.error('Error retrieving messages:', err.message);
    res.status(500).json({ error: `Failed to retrieve messages: ${err.message}` });
  }
};
