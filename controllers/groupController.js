const Group = require('../models/Group');
const crypto = require('crypto'); // Note: built-in module
const fs = require('fs');
const path = require('path');

exports.createGroup = async (req, res) => {
  const { name, members } = req.body;
  const creatorId = req.user.id;  // Assuming user is logged in and req.user.id contains the logged-in user's ID

  try {
    // Add the creator to the members array
    const newGroup = new Group({ 
      name, 
      members: [...members, creatorId]  // Include the creator as a member of the group
    });

    await newGroup.save();

    res.status(201).json(newGroup);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to create group' });
  }
};


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
 * Send a group message
 */
exports.sendGroupMessage = async (req, res) => {
  const { groupId, content } = req.body;
  const sender = req.user.id; // Logged-in user's ID

  if (!content || !groupId) {
    return res.status(400).json({ error: 'Group ID and content are required' });
  }

  try {
    // Find the group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if the sender is a member of the group
    if (!group.members.includes(sender)) {
      return res.status(403).json({ error: 'You are not a member of this group and cannot send messages' });
    }

    // Encrypt content using RSA with OAEP padding
    const encryptedContent = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256', // Ensure consistent hash algorithm
      },
      Buffer.from(content) // Convert message to Buffer for encryption
    ).toString('base64'); // Encode as Base64 for safe storage/transmission

    // Add the message to the group's messages array
    group.messages.push({
      sender,
      content: encryptedContent,
    });

    await group.save();

    res.status(201).json({
      message: 'Group message sent successfully',
      groupId: group._id,
    });
  } catch (err) {
    console.error('Error while sending group message:', err.message);
    res.status(500).json({ error: `Failed to send group message: ${err.message}` });
  }
};


exports.getGroupMessages = async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user.id;  // Get user ID from authenticated user

  if (!groupId) {
    return res.status(400).json({ error: 'Group ID is required' });
  }

  try {
    // Retrieve the group with its members and messages
    const group = await Group.findById(groupId).populate('messages.sender', 'username');
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if the user is a member of the group
    if (!group.members.includes(userId)) {
      // If user is not a member, deny access
      return res.status(403).json({
        message: 'You are not a member of this group',
        messages: []  // Return an empty array of messages
      });
    }

    // Decrypt each message content
    const decryptedMessages = group.messages.map((msg) => {
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
        console.error(`Decryption failed for message in group ${groupId}:`, decryptionError.message);
        return {
          ...msg.toObject(),
          content: '[Decryption failed]', // Indicate decryption issue
        };
      }
    });

    res.status(200).json({
      groupId: group._id,
      messages: decryptedMessages,
    });
  } catch (err) {
    console.error('Error retrieving group messages:', err.message);
    res.status(500).json({ error: `Failed to retrieve group messages: ${err.message}` });
  }
};

/**
 * Get all groups the user is a member of
 */
exports.getUserGroups = async (req, res) => {
  const userId = req.user.id;  // Get user ID from authenticated user

  try {
    // Find all groups where the user is a member
    const groups = await Group.find({ members: userId });
    if (groups.length === 0) {
      return res.status(404).json({ message: 'You are not a member of any groups' });
    }

    res.status(200).json({
      message: 'Groups retrieved successfully',
      groups: groups.map(group => ({
        name: group.name,
        membersCount: group.members.length,
      })),
    });
  } catch (err) {
    console.error('Error retrieving user groups:', err.message);
    res.status(500).json({ error: `Failed to retrieve groups: ${err.message}` });
  }
};


