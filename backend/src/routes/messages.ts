import express from 'express';
import mongoose from 'mongoose';
import { authenticate, AuthRequest } from '../middleware/auth';
import Message from '../models/Message';
import User from '../models/User';

const router = express.Router();

// Get all users for friends list
router.get('/users', authenticate, async (req: AuthRequest, res) => {
  try {
    const currentUserId = req.user?.id;
    const users = await User.find(
      { _id: { $ne: currentUserId } },
      'firstName lastName email course role isOnline'
    ).sort({ firstName: 1, lastName: 1 });

    // Get current user's friends
    const currentUser = await User.findById(currentUserId).populate('friends', 'firstName lastName');
    const friendsList = currentUser?.friends || [];

    const usersWithStatus = users
      .filter(user => user && user.firstName && user.lastName) // Filter out null/incomplete users
      .map(user => ({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        course: user.course,
        role: user.role,
        isOnline: user.isOnline || false,
        isFriend: friendsList.some((friend: any) => friend._id.toString() === user._id.toString())
      }));

    res.json(usersWithStatus);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users.', error: err });
  }
});

// Get conversations (users with whom current user has exchanged messages)
router.get('/conversations', authenticate, async (req: AuthRequest, res) => {
  try {
    const currentUserId = req.user?.id;
    
    // Find all unique conversations
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: new mongoose.Types.ObjectId(currentUserId) },
            { receiver: new mongoose.Types.ObjectId(currentUserId) }
          ]
        }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', new mongoose.Types.ObjectId(currentUserId)] },
              '$receiver',
              '$sender'
            ]
          },
          lastMessage: { $last: '$$ROOT' }
        }
      },
      {
        $sort: { 'lastMessage.timestamp': -1 }
      }
    ]);

    // Get user details for each conversation
    const conversationUsers = await Promise.all(
      conversations.map(async (conv) => {
        const user = await User.findById(conv._id, 'firstName lastName email course role isOnline');
        if (!user || !user.firstName || !user.lastName) {
          return null; // Skip null/incomplete users
        }
        return {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          course: user.course,
          role: user.role,
          isOnline: user.isOnline || false,
          lastMessage: conv.lastMessage
        };
      })
    );

    // Filter out null users
    const validConversationUsers = conversationUsers.filter(user => user !== null);

    res.json(validConversationUsers);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch conversations.', error: err });
  }
});

// Get messages between two users
router.get('/:userId', authenticate, async (req: AuthRequest, res) => {
  try {
    const currentUserId = req.user?.id;
    const otherUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId }
      ]
    })
    .sort({ timestamp: 1 })
    .populate('sender', 'firstName lastName')
    .populate('receiver', 'firstName lastName');

    // Mark messages as read if they were sent to current user
    await Message.updateMany(
      { sender: otherUserId, receiver: currentUserId, isRead: false },
      { isRead: true }
    );

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch messages.', error: err });
  }
});

// Send a message
router.post('/:userId', authenticate, async (req: AuthRequest, res) => {
  try {
    const currentUserId = req.user?.id;
    const receiverId = req.params.userId;
    const { content } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Message content is required.' });
    }

    const message = await Message.create({
      sender: currentUserId,
      receiver: receiverId,
      content: content.trim(),
      isRead: false,
      timestamp: new Date()
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'firstName lastName')
      .populate('receiver', 'firstName lastName');

    res.status(201).json(populatedMessage);
  } catch (err) {
    res.status(500).json({ message: 'Failed to send message.', error: err });
  }
});

// Mark messages as read
router.put('/:userId/read', authenticate, async (req: AuthRequest, res) => {
  try {
    const currentUserId = req.user?.id;
    const senderId = req.params.userId;

    await Message.updateMany(
      { sender: senderId, receiver: currentUserId, isRead: false },
      { isRead: true }
    );

    res.json({ message: 'Messages marked as read.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark messages as read.', error: err });
  }
});

// Get unread message count
router.get('/unread/count', authenticate, async (req: AuthRequest, res) => {
  try {
    const currentUserId = req.user?.id;
    
    const count = await Message.countDocuments({
      receiver: currentUserId,
      isRead: false
    });

    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get unread count.', error: err });
  }
});

export default router; 