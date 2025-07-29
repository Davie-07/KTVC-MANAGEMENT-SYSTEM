import { Router } from 'express';
import Message from '../models/Message';

const router = Router();

// Send a message
router.post('/', async (req, res) => {
  try {
    const { sender, recipient, content } = req.body;
    const message = await Message.create({ sender, recipient, content, unreadBy: [recipient] });
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: 'Failed to send message.', error: err });
  }
});

// Get all messages for a user (sent or received)
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await Message.find({ $or: [{ sender: userId }, { recipient: userId }] });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch messages.', error: err });
  }
});

// Mark a message as read
router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const updated = await Message.findByIdAndUpdate(id, { $pull: { unreadBy: userId } }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark message as read.', error: err });
  }
});

export default router; 