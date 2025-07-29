import { Router } from 'express';
import User from '../models/User';
import ExamResult from '../models/ExamResult';
import FeeStatus from '../models/FeeStatus';

const router = Router();

// Get all students (for search/list)
router.get('/all', async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }, '_id firstName lastName email friends friendRequests');
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch students.', error: err });
  }
});

// Get friends list
router.get('/friends/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate('friends', 'firstName lastName email');
    res.json(user?.friends || []);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch friends.', error: err });
  }
});

// Get pending friend requests
router.get('/requests/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate('friendRequests', 'firstName lastName email');
    res.json(user?.friendRequests || []);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch requests.', error: err });
  }
});

// Get student profile (basic info, exam results, fee status)
router.get('/profile/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const user = await User.findById(studentId, 'firstName lastName email admission course level');
    const examResults = await ExamResult.find({ student: studentId });
    const feeStatus = await FeeStatus.findOne({ student: studentId });
    res.json({ user, examResults, feeStatus });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch profile.', error: err });
  }
});

// Send friend request
router.post('/request', async (req, res) => {
  try {
    const { fromId, toId } = req.body;
    if (fromId === toId) return res.status(400).json({ message: 'Cannot friend yourself.' });
    const toUser = await User.findById(toId);
    if (!toUser) return res.status(404).json({ message: 'User not found.' });
    if (toUser.friendRequests.includes(fromId) || toUser.friends.includes(fromId)) {
      return res.status(400).json({ message: 'Already requested or friends.' });
    }
    toUser.friendRequests.push(fromId);
    await toUser.save();
    res.json({ message: 'Request sent.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send request.', error: err });
  }
});

// Accept friend request
router.post('/accept', async (req, res) => {
  try {
    const { userId, fromId } = req.body;
    const user = await User.findById(userId);
    const fromUser = await User.findById(fromId);
    if (!user || !fromUser) return res.status(404).json({ message: 'User not found.' });
    user.friends.push(fromId);
    user.friendRequests = user.friendRequests.filter((id: string) => id.toString() !== fromId);
    fromUser.friends.push(userId);
    await user.save();
    await fromUser.save();
    res.json({ message: 'Friend request accepted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to accept request.', error: err });
  }
});

// Reject friend request
router.post('/reject', async (req, res) => {
  try {
    const { userId, fromId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    user.friendRequests = user.friendRequests.filter((id: string) => id.toString() !== fromId);
    await user.save();
    res.json({ message: 'Friend request rejected.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to reject request.', error: err });
  }
});

export default router; 